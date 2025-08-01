import axios from "axios";

namespace ShadowBot {
  export interface Command {
    config: {
      name: string;
      description: string;
      usage: string;
      nonPrefix: boolean;
    };
    run: (context: { api: any; event: any; args: string[] }) => Promise<void>;
  }
}

const aiCommand: ShadowBot.Command = {
  config: {
    name: "ai",
    description: "Interact with the GPT-4o API for conversational responses.",
    usage: "ai <query>",
    nonPrefix: true,
  },
  run: async ({ api, event, args }: { api: any; event: any; args: string[] }) => {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage("Please provide a query.", threadID, messageID);
    }

    try {
      const response = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4o", {
        params: {
          ask: query,
          uid: senderID,
          webSearch: "on",
          apikey: "6345c38b-47b1-4a9a-8a70-6e6f17d6641b",
        },
      });
      const gptResponse = response.data.response || "No response from GPT-4o API.";
      const message = `${gptResponse}\n\nReply to this message to continue the conversation.`;

      let sentMessageID: string;
      await new Promise((resolve, reject) => {
        api.sendMessage(message, threadID, (err, messageInfo) => {
          if (err) {
            reject(err);
          } else {
            sentMessageID = messageInfo.messageID;
            resolve(messageInfo);
          }
        }, messageID);
      });

      if (!global.Kagenou.replyListeners) {
        global.Kagenou.replyListeners = new Map();
      }

      const handleReply = async (ctx: { api: any; event: any; data?: any }) => {
        const { api, event } = ctx;
        const { threadID, messageID } = event;
        const userReply = event.body?.trim() || "";

        try {
          const followUpResponse = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4o", {
            params: {
              ask: userReply,
              uid: senderID,
              webSearch: "on",
              apikey: "6345c38b-47b1-4a9a-8a70-6e6f17d6641b",
            },
          });
          const newGptResponse = followUpResponse.data.response || "No response from GPT-4o API.";
          const newMessage = `${newGptResponse}\n\nReply to this message to continue the conversation.`;

          let newSentMessageID: string;
          await new Promise((resolve, reject) => {
            api.sendMessage(newMessage, threadID, (err, newMessageInfo) => {
              if (err) {
                reject(err);
              } else {
                newSentMessageID = newMessageInfo.messageID;
                resolve(newMessageInfo);
              }
            }, messageID);
          });

          global.Kagenou.replyListeners.set(newSentMessageID, { callback: handleReply });
        } catch (error) {
          api.sendMessage("An error occurred while processing your reply with GPT-4o API.", threadID, messageID);
        }
      };

      global.Kagenou.replyListeners.set(sentMessageID, { callback: handleReply });
    } catch (error) {
      api.sendMessage("An error occurred while contacting the GPT-4o API.", threadID, messageID);
    }
  },
};

export default aiCommand;
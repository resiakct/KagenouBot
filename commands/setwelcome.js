
module.exports = {

  config: {

    name: "setwelcome",

    description: "Set a global welcome message for new users",

    role: 2,

    cooldown: 5,

    aliases: ["welcome", "setgreet"],

  },

  handleEvent: true,

  async handleEvent({ api, event }) {

    if (event.logMessageType === "log:subscribe") {

      const threadID = event.threadID;

      const addedUsers = event.logMessageData.addedParticipants;

      if (!addedUsers || addedUsers.length === 0) return;

      if (addedUsers.some(user => user.userFbId === api.getCurrentUserID())) {

        return api.sendMessage("Hello! I'm your bot. Type /help to see my commands!", threadID);

      }

      const welcomeMessage = global.welcomeMessage || "🎉 Welcome {userNames} to the group chat! Enjoy your stay!";

      let mentions = [];

      let names = [];

      for (const user of addedUsers) {

        const userName = user.fullName || "User";

        mentions.push({

          tag: `@${userName}`,

          id: user.userFbId,

        });

        names.push(`@${userName}`);

      }

      const formattedMessage = welcomeMessage.replace("{userNames}", names.join(", "));

      api.sendMessage({ body: formattedMessage, mentions }, threadID);

    }

  },

  async run({ api, event, args }) {

    const { threadID, messageID } = event;

    const newMessage = args.join(" ");

    if (!newMessage) {

      return api.sendMessage(

        "Please provide a welcome message (e.g., #setwelcome Welcome {userNames}!).",

        threadID,

        messageID

      );

    }

    try {

      global.welcomeMessage = newMessage; // Store globally

      await api.sendMessage(`✅ Global welcome message updated to: ${newMessage}`, threadID, messageID);

    } catch (error) {

      await api.sendMessage(`❌ Error updating welcome message: ${error.message}`, threadID, messageID);

      await api.setMessageReaction("❌", messageID, () => {});

    }

  },

};
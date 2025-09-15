module.exports = {
  config: {
    name: "spammer",
    author: "Aljur pogoy",
    description: "Spams messages, reacts to its own messages, and stops on a trigger.",
    role: 0,
    usage: "<prefix>spammer",
    aliases: ["spam"],
  },
  async run({ api, event, args }) {
    const { threadID, messageID, type } = event;

    let spamInterval;
    const spamMessages = ["ako lang malakas", "de ako lang talaga"]; 
    const stopTrigger = "wala na ah"; 

    // Function to start spamming
    function startSpam() {
      let messageIndex = 0;
      spamInterval = setInterval(async () => {
        try {
          const sentMessage = await api.sendMessage(spamMessages[messageIndex % spamMessages.length], threadID);
          // React to its own message
          await api.setMessageReaction("😆", sentMessage.messageID, (err) => {}, true); 
          messageIndex++;
        } catch (error) {
          console.error("Error sending spam message:", error);
          clearInterval(spamInterval);
        }
      }, 1500); // 1.5 seconds interval
    }

    // Check for "Like" reaction to start
    if (type === "message_reaction" && event.reaction === "👍" && !spamInterval) {
      startSpam();
    }

    // Check for "wala na ah" to stop
    if (event.body && event.body.toLowerCase() === stopTrigger) {
      if (spamInterval) {
        clearInterval(spamInterval);
        spamInterval = null; 
      }
    }
  },
};

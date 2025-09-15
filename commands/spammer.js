const path = require("path");
module.exports = {
  name: "spammer",
  description: "Spams messages, reacts to its own messages, and stops on a trigger.",
  author: "Aljur pogoy",
  role: 0,
  async run({ api, event, args }) {
    const { threadID, messageID, body } = event;
    const spamMessages = ["ako lang malakas", "de ako lang talaga"]; 
    const startTrigger = "game na";
    const stopTrigger = "wala na ah";
    let spamInterval = global.spammerIntervals ? global.spammerIntervals[threadID] : null;

    if (body && body.trim() === startTrigger && !spamInterval) {
      let messageIndex = 0;
      spamInterval = setInterval(async () => {
        try {
          const sentMessage = await api.sendMessage(spamMessages[messageIndex % spamMessages.length], threadID);
          await api.setMessageReaction("😆", sentMessage.messageID, (err) => {}, true); 
          messageIndex++;
        } catch (error) {
          console.error("Error sending spam message:", error);
          clearInterval(spamInterval);
          delete global.spammerIntervals[threadID];
        }
      }, 1000); // 1 second interval
      
      if (!global.spammerIntervals) {
        global.spammerIntervals = {};
      }
      global.spammerIntervals[threadID] = spamInterval;
    }

    if (body && body.toLowerCase() === stopTrigger) {
      if (spamInterval) {
        clearInterval(spamInterval);
        delete global.spammerIntervals[threadID];
      }
    }
  }
};

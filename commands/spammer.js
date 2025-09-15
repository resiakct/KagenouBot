const path = require("path");

/** * @author - AljurDev
* @Notice this command is dangerous can restricted your bot due to spamming message, to prevent spamming, modify interval
* @Notice #2: This command is a trashed and spaghetti cuz it has typeof and typedoc antion
*/

/**
 * @typedef {Object} Api
 * @property {(message: string, threadID: string) => Promise<{ messageID: string }>} sendMessage
 * @property {(reaction: string, messageID: string, callback: (err: any) => void, add: boolean) => Promise<void>} setMessageReaction
 */

/**
 * @typedef {Object} Event
 * @property {string} threadID
 * @property {string} [body]
 * @property {string} [messageID]
 */

/**
 * @typedef {Object}
 * @property {Api}
 * @property {Event} event
 */

// Use a global object to store the message index for each thread
if (!global.spammerState) {
  global.spammerState = {};
}

module.exports = {
  config: {
    name: "spammer",
    description: "Spams messages, reacts to its own messages, and stops on a trigger.",
    author: "Aljur Pogoy",
    role: 0,
    nonPrefix: true,
  },

  /**
   * Handles events for starting and stopping spam.
   * @param {HandleEventArgs} param
   */
  handleEvent: async ({ api, event }) => {
    const { threadID, body } = event;
    if (!body) return;

    /** @type {string[]} */
    const spamMessages = ["ako lang malakas", "de ako lang talaga"];

    /** @type {string} */
    const startTrigger = "game na";

    /** @type {string} */
    const stopTrigger = "wala na ah";

    /** @type {NodeJS.Timeout|null} */
    let spamInterval = global.spammerState[threadID] ? global.spammerState[threadID].interval : null;
    
    // START SPAM
    if (body.trim().toLowerCase() === startTrigger && !spamInterval) {
      // Initialize message index for this specific thread
      global.spammerState[threadID] = {
        messageIndex: 0,
        interval: null
      };
      
      const currentState = global.spammerState[threadID];
      
      const interval = setInterval(async () => {
        try {
          const sentMessage = await api.sendMessage(
            spamMessages[currentState.messageIndex % spamMessages.length],
            threadID
          );

          await api.setMessageReaction("😆", sentMessage.messageID, (err) => {}, true);
          currentState.messageIndex++;
        } catch (error) {
          console.error("Error sending spam message:", error);
          clearInterval(currentState.interval);
          delete global.spammerState[threadID];
        }
      }, 1500);

      currentState.interval = interval;
    }

    // STOP SPAM
    if (body.trim().toLowerCase() === stopTrigger) {
      if (spamInterval) {
        clearInterval(spamInterval);
        delete global.spammerState[threadID];
      }
    }
  },
};

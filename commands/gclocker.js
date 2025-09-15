const path = require("path");

/**
 * @typedef {Object} Api
 * @property {(threadName: string, threadID: string) => Promise<void>} changeGroupThreadName
 */

/**
 * @typedef {Object} Event
 * @property {string} threadID
 * @property {string} body
 * @property {string} logMessageType
 * @property {string} logMessageData
 */

/**
 * @typedef {Object} HandleEventArgs
 * @property {Api} api
 * @property {Event} event
 */

// Global variable para malaman kung naka-activate na ang bot sa isang thread
if (!global.gclockerActive) {
    global.gclockerActive = {};
}

module.exports = {
  config: {
    name: "gclocker",
    description: "I-re-revert ang pangalan ng group chat pabalik sa isang target name.",
    author: "YourName",
    role: 0,
    nonPrefix: true, // Para ma-monitor ang messages na walang prefix
  },
  
  /**
   * Ang handleEvent function ang magbabantay sa mga messages.
   * @param {HandleEventArgs} param
   */
  handleEvent: async ({ api, event }) => {
    const { threadID, body, logMessageType, logMessageData } = event;
    
    // --- Ilagay ang gusto mong pangalan dito ---
    const targetName = "Sikat Na Group Chat";
    // ---

    const startTrigger = "group name ah";

    // Step 1: I-activate ang GC locker kapag sinabi ang start trigger
    if (body && body.trim().toLowerCase() === startTrigger) {
      global.gclockerActive[threadID] = true;
      api.sendMessage("Okay, naka-on na ang group name locker.", threadID);
    }
    
    // Step 2: Tingnan kung ang event ay pagbabago ng GC name at kung active ang bot
    if (logMessageType === "log:thread-name" && global.gclockerActive[threadID]) {
      const currentName = logMessageData.newThreadName;
      
      // Step 3: I-revert ang pangalan kung hindi ito tugma sa target name
      if (currentName !== targetName) {
        try {
          await api.changeGroupThreadName(targetName, threadID);
          // Walang message na ipapadala ang bot, gagawin lang ang pagpapalit
          console.log(`Successfully reverted group name for ${threadID} to ${targetName}`);
        } catch (error) {
          console.error("Error reverting group name:", error);
        }
      }
    }
  },
};

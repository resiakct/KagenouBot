const path = require("path");

/**
 * @typedef {Object} Api
 * @property {(newTitle: string, threadID: string, callback: (err: Error) => void) => void} setTitle
 */

/**
 * @typedef {Object} Event
 * @property {string} threadID
 * @property {string} body
 * @property {string} logMessageType
 * @property {Object} logMessageData
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
    const targetName = "gc ngani";
    // ---

    const startTrigger = "group name ah";
    const stopTrigger = "stop group name ah";

    // Step 1: I-activate ang GC locker kapag sinabi ang start trigger
    if (body && body.trim().toLowerCase() === startTrigger) {
      global.gclockerActive[threadID] = true;
      return api.sendMessage("✅ Naka-on na ang group name locker.", threadID);
    }

    // Step 2: I-deactivate kapag sinabi ang stop trigger
    if (body && body.trim().toLowerCase() === stopTrigger) {
      global.gclockerActive[threadID] = false;
      return api.sendMessage("🛑 Naka-off na ang group name locker.", threadID);
    }
    
    // Step 3: Tingnan kung ang event ay pagbabago ng GC name at kung active ang bot
    if (logMessageType === "log:thread-name" && global.gclockerActive[threadID]) {
      const currentName = logMessageData?.name || logMessageData?.newName || logMessageData?.newThreadName;

      console.log(`🔔 Detected GC name change in ${threadID}: ${currentName}`);

      // Step 4: I-revert ang pangalan kung hindi ito tugma sa target name
      if (currentName && currentName !== targetName) {
        api.setTitle(targetName, threadID, (err) => {
          if (err) {
            console.error("❌ Error reverting group name:", err);
          } else {
            console.log(`✅ Successfully reverted group name for ${threadID} to ${targetName}`);
          }
        });
      }
    }
  },
};

module.exports = {

  config: {

    name: "setprefix",

    description: "Set a custom prefix for this thread",

    role: 2,

    cooldown: 5,

    aliases: ["prefix", "changeprefix"],

  },

  async run({ api, event, args }) {

    const { threadID, messageID } = event;

    const newPrefix = args[0];

    if (!newPrefix) {

      return api.sendMessage("Please provide a new prefix (e.g., #setprefix $).", threadID, messageID);

    }

    try {

      const currentSettings = global.threadSettings.get(threadID) || {};

      await global.updateThreadSettings(threadID, { ...currentSettings, prefix: newPrefix });

      await api.sendMessage(`✅ Prefix updated to: ${newPrefix}`, threadID, messageID);

    } catch (error) {

      await api.sendMessage(`❌ Error updating prefix: ${error.message}`, threadID, messageID);

      await api.setMessageReaction("❌", messageID, () => {});

    }

  },

};
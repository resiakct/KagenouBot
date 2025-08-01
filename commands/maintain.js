module.exports = {

  config: {

    name: "maintain",

    description: "Enable or disable a command globally",

    role: 3,

    cooldown: 5,

    aliases: ["cmd", "disablecmd"],

  },

  async run({ api, event, args }) {

    const { threadID, messageID } = event;

    const commandName = args[0];

    const action = args[1]?.toLowerCase() || "disable";

    if (!commandName || !["enable", "disable"].includes(action)) {

      return api.sendMessage(

        "Usage:  <command> [enable|disable] (e.g., #togglecommand ping disable)",

        threadID,

        messageID

      );

    }

    try {

      let disabledCommands = global.disabledCommands.get("disabled") || [];

      if (action === "disable") {

        if (!disabledCommands.includes(commandName)) disabledCommands.push(commandName);

      } else {

        disabledCommands = disabledCommands.filter(cmd => cmd !== commandName);

      }

      global.disabledCommands.set("disabled", disabledCommands);

      await api.sendMessage(`✅ Command '${commandName}' has been ${action}d globally.`, threadID, messageID);

    } catch (error) {

      await api.sendMessage(`❌ Error toggling command: ${error.message}`, threadID, messageID);

      await api.setMessageReaction("❌", messageID, () => {});

    }

  },

};
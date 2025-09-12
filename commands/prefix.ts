import AuroraBetaStyler from "@aurora/styler";
import fs from "fs";
import path from "path";


const prefixCommand: ShadowBot.Command = {
  config: {
    name: "prefix",
    author: "Aljur Pogoy",
    nonPrefix: true,
    description: "Shows the bot's current prefix attach",
    cooldown: 5,
  },
  run: async ({ api, event, prefix }) => {
    const { threadID, messageID } = event;

    const mp4Path = path.join(__dirname, "cache", "cid12.mp4");

    try {
      if (!fs.existsSync(mp4Path)) {
        const errorMessage = AuroraBetaStyler.styleOutput({
          headerText: "Prefix",
          headerSymbol: "⚠️",
          headerStyle: "italic",
          bodyText: "ERROR.",
          bodyStyle: "sansSerif",
          footerText: "Developed by: **Aljur Pogoy**",
        });
        return api.sendMessage(errorMessage, threadID, messageID);
      }

      const successMessage = AuroraBetaStyler.styleOutput({
        headerText: "Prefix",
        headerSymbol: "🌐",
        headerStyle: "italic",
        bodyText: `Global Prefix: ${prefix}`,
        bodyStyle: "sansSerif",
        footerText: "Develope by **Aljur Pogoy**",
      });

      await api.sendMessage(
        {
          body: successMessage,
          attachment: fs.createReadStream(mp4Path),
        },
        threadID,
        messageID
      );
    } catch (error) {
      console.error("Error sending prefix with MP4:", error);

      const errorMessage = AuroraBetaStyler.styleOutput({
        headerText: "Prefix",
        headerSymbol: "❌",
        headerStyle: "double_struck",
        bodyText: "Failed to display the prefix. Mission failed.",
        bodyStyle: "sansSerif",
        footerText: "Developed by: **Aljur Pogoy**",
      });

      api.sendMessage(errorMessage, threadID, messageID);
    }
  },
};

export default prefixCommand;
import { createCanvas, CanvasRenderingContext2D } from "canvas";
import fs from "fs";
import path from "path";
import AuroraBetaStyler from "@aurora/styler";

const usageCommand: ShadowBot.Command = {
  config: {
    name: "usage",
    author: "Aljur Pogoy",
    aliases: ["usages", "commandusage"],
    description: "Show top 3 most used commands with percentage stats",
    cooldown: 5,
    role: 0,
  },
  run: async ({ api, event }) => {
    const { threadID, messageID } = event;

    try {
      const usageStats = global.getUsageStats();
      if (usageStats.length === 0) {
        return api.sendMessage("⚠️ No usage data yet.", threadID, messageID);
      }

      usageStats.sort((a, b) => b[1] - a[1]);
      const top = usageStats.slice(0, 3);
      const total = usageStats.reduce((sum, [, count]) => sum + count, 0);

      const width = 600, height = 300;
      const canvas = createCanvas(width, height);
      const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Sans";
      ctx.fillText("📊 Command Usage Stats", 20, 40);

      const barMaxWidth = 400;
      const barHeight = 30;
      const startY = 90;
      top.forEach(([cmd, count], i) => {
        const percent = ((count / total) * 100).toFixed(1);
        const barWidth = (count / top[0][1]) * barMaxWidth;
        const y = startY + i * 70;

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "20px Sans";
        ctx.fillText(`${cmd}`, 20, y + 20);

        ctx.fillStyle = "#334155";
        ctx.fillRect(150, y, barMaxWidth, barHeight);

        ctx.fillStyle = ["#3b82f6", "#22c55e", "#f97316"][i] || "#38bdf8";
        ctx.fillRect(150, y, barWidth, barHeight);

        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Sans";
        ctx.fillText(`${count} uses (${percent}%)`, 150 + barMaxWidth + 15, y + 22);
      });

      const filePath = path.join(__dirname, "usage_temp.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      const styledMessage = AuroraBetaStyler.styleOutput({
        headerText: "Usage Stats",
        headerSymbol: "📊",
        headerStyle: "bold",
        bodyText: "Here are the top 3 most used commands:",
        bodyStyle: "sansSerif",
        footerText: "Developed by: Aljur Pogoy",
      });

      api.sendMessage(
        {
          body: styledMessage,
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        (err) => {
          try { fs.unlinkSync(filePath); } catch {}
          if (err) console.error("Send error:", err);
        },
        messageID
      );
    } catch (error: any) {
      const errorMessage = AuroraBetaStyler.styleOutput({
        headerText: "Usage Stats",
        headerSymbol: "📊",
        headerStyle: "bold",
        bodyText: `Error: ${error.message}`,
        bodyStyle: "sansSerif",
        footerText: "Developed by: Aljur Pogoy",
      });

      api.sendMessage(errorMessage, threadID, messageID);
    }
  },
};

export default usageCommand;

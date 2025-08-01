const AuroraBetaStyler = require("../core/plugins/aurora-beta-styler");

module.exports = {
  name: "top",
  aliases: ["leaderboard"],
  author: "Aljur Pogoy",
  nonPrefix: false,
  description: "Display the top users by total balance (wallet + bank).",
  async run({ api, event, usersData }) {
    const { threadID, messageID } = event;

    try {
      const users = [];
      for (const [userID, user] of usersData.entries()) {
        const balance = (user.balance || 0) + (user.bank || 0);
        users.push({ userID, balance });
      }

      users.sort((a, b) => b.balance - a.balance);
      const topUsers = users.slice(0, 5);

 
      const userInfo = await api.getUserInfo(topUsers.map(u => u.userID));
      if (!userInfo || Object.keys(userInfo).length === 0) {
        throw new Error("Failed to fetch user info");
      }

      const leaderboard = topUsers.map((u, index) => {
        const name = userInfo[u.userID]?.name || `User ${u.userID.slice(0, 8)}...`; 
        return `  ${index + 1}. ${name} - ${u.balance} coins`;
      }).join("\n");

      const styledMessage = AuroraBetaStyler.styleOutput({
        headerText: "Top Leaderboard",
        headerSymbol: "🏆",
        headerStyle: "bold",
        bodyText: leaderboard || "No users with balances yet.",
        bodyStyle: "bold",
        footerText: "Developed by: **Aljur pogoy**",
      });

      await api.sendMessage(styledMessage, threadID, messageID);
    } catch (error) {
      console.error("Error in top command:", error);
      const styledMessage = AuroraBetaStyler.styleOutput({
        headerText: "Error",
        headerSymbol: "❌",
        headerStyle: "bold",
        bodyText: "An error occurred while fetching the leaderboard. Check console for details.",
        bodyStyle: "bold",
        footerText: "Developed by: **Aljur pogoy**",
      });
      await api.sendMessage(styledMessage, threadID, messageID);
    }
  }
};
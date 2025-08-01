const fs = require("fs-extra");

const path = require("path");

const bannedUsersFile = path.join(__dirname, "../database/bannedUsers.json");

const balanceFile = path.join(__dirname, "../database/balance.json");

module.exports = {

  name: "user",

  author: "Aljur Pogoy",

  version: "3.0.0",

  description: "Manage users (ban, unban, give coins) - Admin only",

  async run({ api, event, args, admins }) {

    const { threadID, messageID, senderID } = event;
    if (!admins.includes(senderID)) {
      return api.sendMessage(
        "════『 𝗨𝗦𝗘𝗥 』════\n\n❌ Only admins can use this command.",
        threadID,
        messageID
      );
    }


    if (args.length < 2) {

      return api.sendMessage(

        "════『 𝗨𝗦𝗘𝗥 』════\n\n❌ Usage: /user <action> <UID> [reason/amount]\nActions: ban, unban, give\nExample: /user ban 1234567890 Spamming\n/user give 1234567890 100",

        threadID,

        messageID

      );

    }

    const action = args[0].toLowerCase();

    const targetUID = args[1];

    let bannedUsers = {};


    try {

      bannedUsers = JSON.parse(fs.readFileSync(bannedUsersFile, "utf8"));

    } catch {

      bannedUsers = {};

    }

 

    switch (action) {

      case "ban": {

        if (args.length < 3) {

          return api.sendMessage(

            "════『 𝗨𝗦𝗘𝗥 』════\n\n❌ Please provide a reason for banning.\nUsage: /user ban <UID> <reason>",

            threadID,

            messageID

          );

        }

        const reason = args.slice(2).join(" ");

        bannedUsers[targetUID] = { reason, bannedAt: Date.now() };

        fs.writeFileSync(bannedUsersFile, JSON.stringify(bannedUsers, null, 2));

        return api.sendMessage(

          `════『 𝗨𝗦𝗘𝗥 』════\n\n✅ Successfully banned UID ${targetUID}.\nReason: ${reason} 🚫`,

          threadID,

          messageID

        );

      }

      case "unban": {

        if (!bannedUsers[targetUID]) {

          return api.sendMessage(

            `════『 𝗨𝗦𝗘𝗥 』════\n\n❌ UID ${targetUID} is not banned.`,

            threadID,

            messageID

          );

        }

        delete bannedUsers[targetUID];

        fs.writeFileSync(bannedUsersFile, JSON.stringify(bannedUsers, null, 2));

        return api.sendMessage(

          `════『 𝗨𝗦𝗘𝗥 』════\n\n✅ Successfully unbanned UID ${targetUID}. ✅`,

          threadID,

          messageID

        );

      }

      case "give": {

        if (args.length < 3 || isNaN(args[2])) {

          return api.sendMessage(

            "════『 𝗨𝗦𝗘𝗥 』════\n\n❌ Please provide a valid amount of coins.\nUsage: /user give <UID> <amount>",

            threadID,

            messageID

          );

        }

        const amount = parseInt(args[2]);

        if (amount <= 0) {

          return api.sendMessage(

            "════『 𝗨𝗦𝗘𝗥 』════\n\n❌ Amount must be greater than 0.",

            threadID,

            messageID

          );

        }

   

        let balanceData = {};

        try {

          if (!fs.existsSync(balanceFile)) {

            fs.writeFileSync(balanceFile, JSON.stringify({}, null, 2));

          }

          balanceData = JSON.parse(fs.readFileSync(balanceFile, "utf8"));

        } catch {

          balanceData = {};

        }

       

        if (!balanceData[targetUID]) {

          balanceData[targetUID] = { balance: 0, bank: 0 };

        }



        balanceData[targetUID].balance = (balanceData[targetUID].balance || 0) + amount;

        fs.writeFileSync(balanceFile, JSON.stringify(balanceData, null, 2));

        return api.sendMessage(

          `════『 𝗨𝗦𝗘𝗥 』════\n\n✅ Gave ${amount} coins to UID ${targetUID}. 💰\nNew wallet balance: ${balanceData[targetUID].balance} coins.`,

          threadID,

          messageID

        );

      }

      default: {

        return api.sendMessage(

          "════『 𝗨𝗦𝗘𝗥 』════\n\n❌ Invalid action. Available actions: ban, unban, give\nUsage: /user <action> <UID> [reason/amount]",

          threadID,

          messageID

        );

      }

    }

  },

};
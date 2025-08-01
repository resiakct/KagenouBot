const fs = require("fs");

const balanceFile = "./database/balance.json";

module.exports = {

  name: "toprich",

  category: "Economy",

  description: "Shows the top 5 richest players.",

  usage: "/toprich",

  author: "Aljur Pogoy",

  version: "3.0.0",

  async run({ api, event }) {

    const { threadID, messageID } = event;

    if (!fs.existsSync(balanceFile)) {

      return api.sendMessage(

        "⚠️ 𝗡𝗼 𝗯𝗮𝗹𝗮𝗻𝗰𝗲 𝗱𝗮𝘁𝗮 𝗳𝗼𝘂𝗻𝗱!",

        threadID,

        messageID

      );

    }

    let balanceData = JSON.parse(fs.readFileSync(balanceFile, "utf8"));

    let sortedUsers = Object.entries(balanceData)

      .map(([id, data]) => ({ id, ...data }))

      .sort((a, b) => (b.balance + b.bank) - (a.balance + a.bank))

      .slice(0, 5); // Top 5 instead of Top 10

    let message = "════『 𝗧𝗢𝗣 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗣𝗟𝗔𝗬𝗘𝗥𝗦 』════\n\n";

    let namePromises = sortedUsers.map(user =>

      new Promise(resolve => {

        api.getUserInfo(user.id, (err, info) => {

          if (err) return resolve(`❌ 𝗨𝗜𝗗: ${user.id} (𝗘𝗿𝗿𝗼𝗿)`);

          let name = info[user.id].name;

          resolve(`🏆 ${name} (UID: ${user.id})\n   🪙 𝗪𝗮𝗹𝗹𝗲𝘁: ${user.balance}\n   🏦 𝗕𝗮𝗻𝗸: ${user.bank}`);

        });

      })

    );

    Promise.all(namePromises).then(names => {

      message += names.join("\n\n");

      message += `\n\n> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗖𝗶𝗱 𝗞𝗮𝗴𝗲𝗻𝗼𝘂 𝗕𝗼𝘁\n`;

      message += `> 𝗖𝗼𝗻𝘁𝗮𝗰𝘁 𝗱𝗲𝘃: 𝗸𝗼𝗿𝗶𝘀𝗮𝘄𝗮𝘂𝗺𝘂𝗳𝘂@𝗴𝗺𝗮𝗶𝗹.𝗰𝗼𝗺`;

      api.sendMessage(message, threadID, messageID);

    });

  },

};
const axios = require("axios");

module.exports = {

    config: {

        name: "48law",

        description: "Get the 48 Laws of Power by law number.",

        usage: "/48law <number>",
        
        author: "aljur pogoy",

        nonPrefix: false,
        
        role: 3,

    },

    run: async ({ api, event, args }) => {

        const { threadID, messageID } = event;

        const number = args[0]?.trim();

        if (!number || isNaN(number) || number < 1 || number > 48) {

            return api.sendMessage("Please provide a valid law number (1-48).", threadID, messageID);

        }

        try {

            const response = await axios.get(`https://haji-mix.up.railway.app/api/law?number=${number}`);

            const lawData = response.data;

            const title = lawData.title || "Unknown Law";

            const message = `Law #${number}: ${title}\n\n${lawData.law || "No description available."}`;

            api.sendMessage(message, threadID, messageID);

        } catch (error) {

            console.error("Error fetching law:", error);

            api.sendMessage("An error occurred while fetching the law.", threadID, messageID);

        }

    }

};
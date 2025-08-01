const apiHandler = require("../utils/apiHandler");

module.exports = {

    name: "gpt3",

    author: "Aljur Pogoy",

    description: "Generates AI responses and images using GPT-3.",

    async run({ api, event, args }) {

        const { threadID } = event;

        if (!args.length) {

            return api.sendMessage("❌ Please provide a prompt!", threadID);

        }

        const query = encodeURIComponent(args.join(" "));

        const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt-3.5?q=${query}`;

        try {

            const response = await apiHandler.request(apiUrl);

            if (!response || response.error) {

                return api.sendMessage("⚠️ API request failed. Try again later!", threadID);

            }

            if (response.type === "image" && response.url) {

                const imageStream = await apiHandler.getStream(response.url);

                if (!imageStream) {

                    return api.sendMessage("⚠️ Failed to fetch image!", threadID);

                }

                return api.sendMessage(

                    { body: `🖼️ Generated image for: "${args.join(" ")}"`, attachment: imageStream },

                    threadID

                );

            }

            if (response.text) {

                return api.sendMessage(response.text, threadID);

            }

            return api.sendMessage("⚠️ Unexpected response format. Try again later!", threadID);

        } catch (error) {

            console.error("Error in gpt3.js:", error);

            return api.sendMessage("⚠️ An error occurred while processing your request.", threadID);

        }

    }

};
const AuroraBetaStyler = require('@aurora/styler');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const aibuuroCommand = {
  config: {
    name: 'aibuuro',
    description: 'Fetches a random image from Aibuuro API (NSFW).',
    usage: '/aibuuro',
    aliases: [],
    category: 'media',
    role: 4,
    author: 'Aljur Pogoy',
  },
  async run({ api, event, args }) {
    try {
      const { threadID, messageID } = event;
      if (!threadID || !messageID) {
        throw new Error('Missing threadID or messageID in event');
      }

      const response = await axios.get('https://haji-mix.up.railway.app/api/aibooru?stream=true', {
        responseType: 'arraybuffer',
      });

      console.log('API response status:', response.status, 'Content-Type:', response.headers['content-type']);

      const tempFilePath = path.join(__dirname, `temp_aibuuro_${Date.now()}.jpg`);
      fs.writeFileSync(tempFilePath, Buffer.from(response.data));
      const imageStream = fs.createReadStream(tempFilePath);

      await api.sendMessage(
        {
          body: AuroraBetaStyler.styleOutput({
            headerText: 'Aibuuro Image (NSFW)',
            headerSymbol: '🔞',
            headerStyle: 'bold',
            bodyText: 'Warning: This content is NSFW. Viewer discretion advised.',
            bodyStyle: 'sansSerif',
            footerText: 'Developed by: **Aljur Pogoy**',
          }),
          attachment: imageStream,
        },
        threadID,
        messageID,
      );

      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error('Aibuuro command error:', error.stack || error.message, {
        event,
        response: error.response?.data,
      });

      if (event.threadID && event.messageID) {
        await api.sendMessage(
          AuroraBetaStyler.styleOutput({
            headerText: 'Aibuuro Error',
            headerSymbol: '❌',
            headerStyle: 'bold',
            bodyText: 'Failed to fetch Aibuuro image. Please try again later.',
            bodyStyle: 'sansSerif',
            footerText: 'Developed by: **Aljur Pogoy**',
          }),
          event.threadID,
          event.messageID,
        );
      }
    }
  }
};

module.exports = aibuuroCommand;
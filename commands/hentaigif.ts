import AuroraBetaStyler from '@aurora/styler';
import axios from 'axios';

const hentaigifCommand: ShadowBot.Command = {
  config: {
    name: 'hentaigif',
    description: 'Sends a random hentai GIF',
    usage: 'hentaigif',
    aliases: [],
    category: 'nsfw',
    role: 4,
    author: 'Aljur Pogoy',
    nonPrefix: false,
  },
  run: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    if (!threadID || !messageID) {
      const errorMessage = AuroraBetaStyler.styleOutput({
        headerText: 'HentaiGIF Error',
        headerSymbol: '❌',
        headerStyle: 'bold',
        bodyText: 'Missing threadID or messageID in event',
        bodyStyle: 'sansSerif',
        footerText: 'Developed by: **Aljur Pogoy**',
      });
      return api.sendMessage(errorMessage, threadID, messageID);
    }
    try {
      const apiUrl = 'https://kaiz-apis.gleeze.com/api/hentaigif?apikey=5445ac64-628b-446a-a2a7-9fe803592176';
      const response = await axios.get(apiUrl);
      const gifs = response.data.gifs;
      if (!gifs || !Array.isArray(gifs) || gifs.length === 0) {
        const errorMessage = AuroraBetaStyler.styleOutput({
          headerText: 'HentaiGIF Error',
          headerSymbol: '❌',
          headerStyle: 'bold',
          bodyText: 'No GIFs found.',
          bodyStyle: 'sansSerif',
          footerText: 'Developed by: **Aljur Pogoy**',
        });
        return api.sendMessage(errorMessage, threadID, messageID);
      }
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      const gifResponse = await axios.get(randomGif, { responseType: 'stream' });
      await api.sendMessage(
        {
          body: AuroraBetaStyler.styleOutput({
            headerText: 'HentaiGIF Result',
            headerSymbol: '🔞',
            headerStyle: 'bold',
            bodyText: 'Here’s your random hentai GIF!',
            bodyStyle: 'sansSerif',
            footerText: 'Developed by: **Aljur Pogoy**',
          }),
          attachment: gifResponse.data,
        },
        threadID,
        messageID,
      );
    } catch (error) {
      console.error('HentaiGIF command error:', error.stack || error.message);
      const errorMessage = AuroraBetaStyler.styleOutput({
        headerText: 'HentaiGIF Error',
        headerSymbol: '❌',
        headerStyle: 'bold',
        bodyText: `Error: ${error.message || 'Unknown error'}`,
        bodyStyle: 'sansSerif',
        footerText: 'Developed by: **Aljur Pogoy**',
      });
      await api.sendMessage(errorMessage, threadID, messageID);
    }
  },
};

export default hentaigifCommand;
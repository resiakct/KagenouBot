
const AuroraBetaStyler = require('@aurora/styler');


module.exports = {
  config: {
    name: 'xp-event',
    description: 'Automatically grant XP based on user activity.',
    role: 0,
    category: 'System ⚡',
  },
  handleEvent: true,
  async handleEvent({ api, event }) {
    const { threadID, senderID, body } = event;
    if (!body) return;
    const userData = global.messageTracker.get(senderID) || { count: 0, lastGain: 0 };
    userData.count += 1;
    global.messageTracker.set(senderID, userData);
    const now = Date.now();
    if (userData.count >= 10 && now - userData.lastGain >= 5 * 60 * 1000) {
      const xpGain = Math.floor(Math.random() * 70) + 70; // 5–15 XP
      global.addXP(senderID, xpGain);

    
      userData.count = 0;
      userData.lastGain = now;
      global.messageTracker.set(senderID, userData);

      try {
        const userInfo = await api.getUserInfo([senderID]);
        const name = userInfo[senderID]?.name || 'Unknown User';
        await api.sendMessage(
          AuroraBetaStyler.styleOutput({
            headerText: 'XP System',
            headerSymbol: '✨',
            headerStyle: 'bold',
            bodyText: `🎉 ${name} earned ${xpGain} XP for being active!`,
            bodyStyle: 'sansSerif',
            footerText: '**Congratulations** 🫡🫡',
          }),
          threadID,
        );
      } catch (err) {
        console.error('Error sending XP gain message:', err);
      }
    }
  },
  run: async () => {
    // no manual run needed, event-only
  },
};
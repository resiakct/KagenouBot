module.exports = {

  name: "activity",

  handleEvent: true,

  async handleEvent({ api, event, db, usersData }) {

    const { threadID, senderID } = event;



    let userData = usersData ? usersData.get(senderID) || { messageCount: 0, balance: 0 } : { messageCount: 0, balance: 0 };



    userData.messageCount += 1;

   

    if (userData.messageCount % 10 === 0) {

      const rewardAmount = 5; // Balance reward

      userData.balance += rewardAmount;

      const message = `🏆 User ${senderID}, you've earned $${rewardAmount} for being active! New balance: $${userData.balance.toLocaleString()}.`;

      api.sendMessage(message, threadID);

    

      if (usersData) {

        usersData.set(senderID, userData);

      }

      

      if (db) {

        try {

          await db.db("activity").updateOne(

            { userId: senderID },

            { $set: { userId: senderID, messageCount: userData.messageCount, balance: userData.balance } },

            { upsert: true }

          );

        } catch (error) {

          console.warn(`[Activity] DB update failed for user ${senderID}: ${error.message}`);

        }

      }

    } else {



      if (usersData) {

        usersData.set(senderID, userData);

      }

    

      if (db) {

        try {

          await db.db("activity").updateOne(

            { userId: senderID },

            { $set: { userId: senderID, messageCount: userData.messageCount, balance: userData.balance } },

            { upsert: true }

          );

        } catch (error) {

          console.warn(`[Activity] DB update failed for user ${senderID}: ${error.message}`);

        }

      }

    }

  }

};
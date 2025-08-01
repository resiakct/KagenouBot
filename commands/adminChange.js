module.exports = {
    name: "adminChange",
    handleEvent: true,

    async handleEvent({ api, event }) {
        if (event.logMessageType === "log:thread-admins") {
            const threadID = event.threadID;
            const targetID = event.logMessageData.TARGET_ID;
            const adminStatus = event.logMessageData.ADMIN_EVENT === "add_admin" ? "promoted to admin" : "demoted from admin";

            try {
                const userInfo = await api.getUserInfo(targetID);
                const userName = userInfo[targetID]?.name || "Someone";

                api.sendMessage(`👑 ${userName} has been ${adminStatus}.`, threadID);
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        }
    }
};

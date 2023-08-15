const { Expo } = require("expo-server-sdk");

const sendPushNotification = async (targetExpoPushToken, message) => {
  const expo = new Expo();
  const chunks = expo.chunkPushNotifications([
    { to: targetExpoPushToken, sound: "default", body: message },
  ]);
};

module.exports = { sendPushNotification };

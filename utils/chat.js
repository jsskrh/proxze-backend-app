const createChatObject = (chat) => {
  return {
    id: chat._id,
    participants: chat.participants.map((participant) => {
      return {
        id: participant._id,
        name: `${participant.firstName} ${participant.lastName}`,
        avatar: participant.avatar ? particiapant.avatar : null,
      };
    }),
    lastMessage: {
      id: chat.messages[chat.messages.length - 1]._id,
      seen: chat.messages[chat.messages.length - 1].seen,
      read: chat.messages[chat.messages.length - 1].read,
      sender: chat.messages[chat.messages.length - 1].sender,
      deliveryTime: chat.messages[chat.messages.length - 1].deliveryTime,
      content: chat.messages[chat.messages.length - 1].content,
    },
    messageGroups: mapByDeliveryTime(chat.messages),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
};

function mapByDeliveryTime(messages) {
  const chatMap = {};

  messages.forEach((message) => {
    const deliveryDate = message.deliveryTime.toISOString().split("T")[0];

    if (!chatMap[deliveryDate]) {
      chatMap[deliveryDate] = {
        day: deliveryDate,
        messages: [],
      };
    }

    chatMap[deliveryDate].messages.push({
      seen: message.seen,
      read: message.read,
      sender: message.sender,
      deliveryTime: message.deliveryTime,
      content: message.content,
      id: message._id,
    });
  });

  // Sort messages within each day based on deliveryTime
  for (const day in chatMap) {
    chatMap[day].messages.sort(
      (a, b) => a.deliveryTime.getTime() - b.deliveryTime.getTime()
    );
  }

  // Convert the chatMap object into an array of day objects
  const mappedChat = Object.values(chatMap);

  // Sort days in ascending order based on the day value
  mappedChat.sort((a, b) => a.day.localeCompare(b.day));

  return mappedChat;
}

module.exports = {
  createChatObject,
};

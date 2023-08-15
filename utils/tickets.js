const createTicketObject = (ticket) => {
  return {
    id: ticket._id,
    subject: ticket.subject,
    content: ticket.content,
    file: ticket.file,
    correspondence: ticket.correspondence.map((message) => {
      return {
        content: message.content,
        from: {
          name: `${message.from.firstName} ${message.from.lastName}`,
          id: message.from._id,
        },
      };
    }),
    isResolved: ticket.isResolved,
    handler:
      ticket.handler.length > 0
        ? ticket.handler.map((handler) => {
            return {
              id: handler._id,
              name: `${handler.firstName} ${handler.lastName}`,
            };
          })
        : null,
    sender: {
      id: ticket.sender._id,
      name: `${ticket.sender.firstName} ${ticket.sender.lastName}`,
    },
    task: ticket.task
      ? { id: ticket.task._id, title: ticket.task.title }
      : null,
    createdAt: ticket.createdAt,
  };
};

module.exports = {
  createTicketObject,
};

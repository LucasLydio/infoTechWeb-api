// src/services/message.service.js
const prisma = require('../config/database.js');

class MessageService {
  async sendMessage(fromUserId, data) {
    if (fromUserId === data.to_user_id) {
      const error = new Error('Não é possível enviar mensagem para você mesmo');
      error.statusCode = 400;
      throw error;
    }

    const receiver = await prisma.users.findUnique({
      where: { id: data.to_user_id },
      select: { id: true },
    });

    if (!receiver) {
      const error = new Error('Destinatário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    const message = await prisma.private_messages.create({
      data: {
        from_user_id: fromUserId,
        to_user_id: data.to_user_id,
        body: data.body,
      },
    });

    return message;
  }

  async listInbox(userId, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [messages, total] = await Promise.all([
      prisma.private_messages.findMany({
        where: { to_user_id: userId },
        skip,
        take,
        orderBy: { sent_at: 'desc' },
        include: {
          from_user: { select: { id: true, name: true, avatar_url: true } },
        },
      }),
      prisma.private_messages.count({ where: { to_user_id: userId } }),
    ]);

    return {
      data: messages,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async listSent(userId, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [messages, total] = await Promise.all([
      prisma.private_messages.findMany({
        where: { from_user_id: userId },
        skip,
        take,
        orderBy: { sent_at: 'desc' },
        include: {
          to_user: { select: { id: true, name: true, avatar_url: true } },
        },
      }),
      prisma.private_messages.count({ where: { from_user_id: userId } }),
    ]);

    return {
      data: messages,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async markAsRead(userId, messageId) {
    const message = await prisma.private_messages.findFirst({
      where: {
        id: messageId,
        to_user_id: userId,
      },
    });

    if (!message) {
      const error = new Error('Mensagem não encontrada');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.private_messages.update({
      where: { id: messageId },
      data: { read_at: new Date() },
    });

    return updated;
  }
}

module.exports = new MessageService();

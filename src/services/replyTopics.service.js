// src/services/reply.service.js
const prisma = require('../config/database.js');

class ReplyService {
  async getByTopicId(topicId) {
    const reply_topics = await prisma.reply_topics.findMany({
      where: { topic_id: topicId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return reply_topics;
  }

  async createReply(userId, data) {
    const topicExists = await prisma.topics.findUnique({
      where: { id: data.topic_id },
      select: { id: true },
    });

    if (!topicExists) {
      const error = new Error('Tópico não encontrado');
      error.statusCode = 404;
      throw error;
    }

    const reply = await prisma.replies.create({
      data: {
        topic_id: data.topic_id,
        user_id: userId,
        body: data.body,
      },
      include: {
        user: { select: { id: true, name: true, avatar_url: true } },
      },
    });

    return reply;
  }
}

module.exports = new ReplyService();

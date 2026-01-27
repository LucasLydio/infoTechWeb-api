// src/services/replyNews.service.js
const prisma = require('../config/database.js');

class ReplyNewsService {
  async createReplyNews(userId, data) {
    const newsExists = await prisma.news.findUnique({
      where: { id: data.news_id },
      select: { id: true },
    });

    if (!newsExists) {
      const error = new Error('Notícia não encontrada');
      error.statusCode = 404;
      throw error;
    }

    const reply = await prisma.reply_news.create({
      data: {
        news_id: data.news_id,
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

module.exports = new ReplyNewsService();

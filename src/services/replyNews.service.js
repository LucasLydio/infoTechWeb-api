// src/services/replyNews.service.js
const prisma = require("../config/database.js");
const { bumpCacheVersion } = require("../utils/cache");

function forbidden() {
  const err = new Error("Você não tem permissão para alterar esta resposta");
  err.statusCode = 403;
  return err;
}

function notFound() {
  const err = new Error("Resposta não encontrada");
  err.statusCode = 404;
  return err;
}

class ReplyNewsService {
  async getByNewsId(newsId) {
    const reply_news = await prisma.reply_news.findMany({
      where: { news_id: newsId },
      select: {
        id: true,
        news_id: true,
        body: true,
        created_at: true,
        updated_at: true,
        user: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return reply_news;
  }

  async createReply(userId, data) {
    const newsExists = await prisma.news.findUnique({
      where: { id: data.news_id },
      select: { id: true },
    });

    if (!newsExists) {
      const error = new Error("Notícia não encontrada");
      error.statusCode = 404;
      throw error;
    }

    const reply = await prisma.reply_news.create({
      data: {
        news_id: data.news_id,
        user_id: userId,
        body: data.body,
      },
      select: {
        id: true,
        news_id: true,
        body: true,
        created_at: true,
        updated_at: true,
        user: { select: { id: true, name: true, avatar_url: true } },
      },
    });

    await bumpCacheVersion("news:list:version");
    await bumpCacheVersion(`news:detail:${data.news_id}:version`);

    return reply;
  }

  // ✅ Update (only owner can update)
  async updateReply(userId, replyId, data) {
    const existing = await prisma.reply_news.findUnique({
      where: { id: replyId },
      select: { id: true, user_id: true, news_id: true },
    });

    if (!existing) throw notFound();
    if (existing.user_id !== userId) throw forbidden();

    const updated = await prisma.reply_news.update({
      where: { id: replyId },
      data: { body: data.body },
      select: {
        id: true,
        news_id: true,
        body: true,
        created_at: true,
        updated_at: true,
        user: { select: { id: true, name: true, avatar_url: true } },
      },
    });

    await bumpCacheVersion("news:list:version");
    await bumpCacheVersion(`news:detail:${existing.news_id}:version`);

    return updated;
  }

  // ✅ Delete (only owner can delete)
  async deleteReply(userId, replyId) {
    const existing = await prisma.reply_news.findUnique({
      where: { id: replyId },
      select: { id: true, user_id: true, news_id: true },
    });

    if (!existing) throw notFound();
    if (existing.user_id !== userId) throw forbidden();

    await prisma.reply_news.delete({
      where: { id: replyId },
    });

    await bumpCacheVersion("news:list:version");
    await bumpCacheVersion(`news:detail:${existing.news_id}:version`);

    return { deleted: true };
  }
}

module.exports = new ReplyNewsService();

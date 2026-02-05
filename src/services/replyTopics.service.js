// src/services/replyTopics.service.js
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

class ReplyTopicsService {
  async getByTopicId(topicId) {
    const reply_topics = await prisma.reply_topics.findMany({
      where: { topic_id: topicId },
      select: {
        id: true,
        topic_id: true,
        body: true,
        created_at: true,
        user: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return reply_topics;
  }

  async createReply(userId, data) {
    const topicExists = await prisma.topics.findUnique({
      where: { id: data.topic_id },
      select: { id: true },
    });

    if (!topicExists) {
      const error = new Error("Tópico não encontrado");
      error.statusCode = 404;
      throw error;
    }

    const reply = await prisma.reply_topics.create({
      data: {
        topic_id: data.topic_id,
        user_id: userId,
        body: data.body,
      },
      select: {
        id: true,
        topic_id: true,
        body: true,
        created_at: true,
        user: { select: { id: true, name: true, avatar_url: true } },
      },
    });

    await bumpCacheVersion("topics:list:version");
    await bumpCacheVersion(`topics:detail:${data.topic_id}:version`);

    return reply;
  }

  
  async updateReply(userId, replyId, data) {
    const existing = await prisma.reply_topics.findUnique({
      where: { id: replyId },
      select: { id: true, user_id: true, topic_id: true },
    });

    if (!existing) throw notFound();
    if (existing.user_id !== userId) throw forbidden();

    const updated = await prisma.reply_topics.update({
      where: { id: replyId },
      data: { body: data.body },
      select: {
        id: true,
        topic_id: true,
        body: true,
        created_at: true,
        user: { select: { id: true, name: true, avatar_url: true } },
      },
    });

    await bumpCacheVersion("topics:list:version");
    await bumpCacheVersion(`topics:detail:${existing.topic_id}:version`);

    return updated;
  }

  
  async deleteReply(userId, replyId) {
    const existing = await prisma.reply_topics.findUnique({
      where: { id: replyId },
      select: { id: true, user_id: true, topic_id: true },
    });

    if (!existing) throw notFound();
    if (existing.user_id !== userId) throw forbidden();

    await prisma.reply_topics.delete({
      where: { id: replyId },
    });

    await bumpCacheVersion("topics:list:version");
    await bumpCacheVersion(`topics:detail:${existing.topic_id}:version`);

    return { deleted: true };
  }
}

module.exports = new ReplyTopicsService();

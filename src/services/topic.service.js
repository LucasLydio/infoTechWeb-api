// src/services/topic.service.js
const prisma = require("../config/database.js");
const {
  getCachedData,
  setCachedData,
  deleteCacheData,
  getCacheVersion,
  bumpCacheVersion,
} = require("../utils/cache");

const TOPICS_LIST_TTL = 60 * 2; // 2 min
const TOPIC_DETAIL_TTL = 60 * 2; // 2 min

class TopicService {
  async createTopic(userId, data) {
    const topic = await prisma.topics.create({
      data: {
        user_id: userId,
        title: data.title,
        body: data.body,
      },
    });

    // Invalidate list caches (all pages)
    await bumpCacheVersion("topics:list:version");

    // Optional: Invalidate this topic detail caches (future-proof)
    await bumpCacheVersion(`topics:detail:${topic.id}:version`);

    return topic;
  }

  async listTopics(page = 1, pageSize = 10) {
    const version = await getCacheVersion("topics:list:version", "1");
    const key = `topics:list:v${version}:p${page}:s${pageSize}`;

    let result = await getCachedData(key);
    if (result) return result;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [topics, total] = await Promise.all([
      prisma.topics.findMany({
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, avatar_url: true },
          },
          _count: {
            select: { reply_topics: true },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.topics.count(),
    ]);

    result = {
      data: topics,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    await setCachedData(key, result, TOPICS_LIST_TTL);
    return result;
  }

  async getTopicWithReplyTopics(topicId, page = 1, pageSize = 10) {
    const detailVersion = await getCacheVersion(
      `topics:detail:${topicId}:version`,
      "1"
    );

    const key = `topics:detail:${topicId}:v${detailVersion}:p${page}:s${pageSize}`;

    let result = await getCachedData(key);
    if (result) return result;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const topic = await prisma.topics.findUnique({
      where: { id: topicId },
      include: {
        user: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
    });

    if (!topic) {
      const error = new Error("Tópico não encontrado");
      error.statusCode = 404;
      throw error;
    }

    const [reply_topics, totalReplyTopics] = await Promise.all([
      prisma.reply_topics.findMany({
        where: { topic_id: topicId },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, avatar_url: true } },
        },
        orderBy: { created_at: "asc" },
      }),
      prisma.reply_topics.count({ where: { topic_id: topicId } }),
    ]);

    result = {
      topic,
      reply_topics,
      replyTopicsPagination: {
        page,
        pageSize,
        total: totalReplyTopics,
        totalPages: Math.ceil(totalReplyTopics / pageSize),
      },
    };

    await setCachedData(key, result, TOPIC_DETAIL_TTL);
    return result;
  }

  // Optional helper for future reply creation:
  // async invalidateTopic(topicId) {
  //   await bumpCacheVersion("topics:list:version");
  //   await bumpCacheVersion(`topics:detail:${topicId}:version`);
  // }
}

module.exports = new TopicService();

// src/services/topic.service.js
const prisma = require("../config/database.js");
const {
  getCachedData,
  setCachedData,
  getCacheVersion,
  bumpCacheVersion,
} = require("../utils/cache");

const TOPICS_LIST_TTL = 60 * 2; // 2 min
const TOPIC_DETAIL_TTL = 60 * 2; // 2 min
const TOPIC_ENTITY_TTL = 60 * 5; // 5 min (topic basic info)

function clampPagination(page, pageSize) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const sRaw = parseInt(pageSize, 10) || 10;
  const s = Math.min(Math.max(1, sRaw), 50); // cap
  return { page: p, pageSize: s };
}

class TopicService {
  async createTopic(userId, data) {
    const topic = await prisma.topics.create({
      data: {
        user_id: userId,
        title: data.title,
        body: data.body,
      },
    });

    await bumpCacheVersion("topics:list:version");

    await bumpCacheVersion(`topics:detail:${topic.id}:version`);

    
    await setCachedData(
      `topics:entity:${topic.id}`,
      {
        id: topic.id,
        user_id: topic.user_id,
        title: topic.title,
        body: topic.body,
        created_at: topic.created_at,
      },
      TOPIC_ENTITY_TTL
    );

    return topic;
  }

  async listTopics(page = 1, pageSize = 10) {
    const pg = clampPagination(page, pageSize);
    page = pg.page;
    pageSize = pg.pageSize;

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
        select: {
          id: true,
          title: true,
          body: true,
          created_at: true,
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

  async getTopicBase(topicId) {
    const key = `topics:entity:${topicId}`;

    let topic = await getCachedData(key);
    if (topic) return topic;

    topic = await prisma.topics.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        title: true,
        body: true,
        created_at: true,
        user: { select: { id: true, name: true, avatar_url: true } },
      },
    });

    if (!topic) {
      const error = new Error("Tópico não encontrado");
      error.statusCode = 404;
      throw error;
    }

    await setCachedData(key, topic, TOPIC_ENTITY_TTL);
    return topic;
  }

  async getTopicWithReplyTopics(topicId, page = 1, pageSize = 10) {
    const pg = clampPagination(page, pageSize);
    page = pg.page;
    pageSize = pg.pageSize;

    const detailVersion = await getCacheVersion(
      `topics:detail:${topicId}:version`,
      "1"
    );

    const key = `topics:detail:${topicId}:v${detailVersion}:p${page}:s${pageSize}`;

    let result = await getCachedData(key);
    if (result) return result;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

   
    const topic = await this.getTopicBase(topicId);

    const [reply_topics, totalReplyTopics] = await Promise.all([
      prisma.reply_topics.findMany({
        where: { topic_id: topicId },
        skip,
        take,
        select: {
          id: true,
          topic_id: true,
          body: true,
          created_at: true,
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

    
    const ttl = page === 1 ? TOPIC_DETAIL_TTL : 30;
    await setCachedData(key, result, ttl);

    return result;
  }

  
  async invalidateTopic(topicId) {
    await bumpCacheVersion("topics:list:version");
    await bumpCacheVersion(`topics:detail:${topicId}:version`);
  }
}

module.exports = new TopicService();

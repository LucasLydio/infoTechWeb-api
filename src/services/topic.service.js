// src/services/topic.service.js
const prisma = require("../config/database.js");
const {
  getCachedData,
  setCachedData,
  getCacheVersion,
  bumpCacheVersion,
} = require("../utils/cache");

const TOPICS_LIST_TTL = 60 * 2;
const TOPIC_DETAIL_TTL = 60 * 2;
const TOPIC_ENTITY_TTL = 60 * 5;

function clampPagination(page, pageSize) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const sRaw = parseInt(pageSize, 10) || 10;
  const s = Math.min(Math.max(1, sRaw), 50);
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

    // ✅ Don't warm topics:entity here (it would miss "user" shape)
    return topic;
  }

  async listTopics(page = 1, pageSize = 10) {
    const pg = clampPagination(page, pageSize);
    page = pg.page;
    pageSize = pg.pageSize;

    const version = await getCacheVersion("topics:list:version", "1");
    const key = `topics:list:v${version}:p${page}:s${pageSize}`;

    const cached = await getCachedData(key);
    if (cached) return cached;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [topics, total] = await Promise.all([
      prisma.topics.findMany({
        skip,
        take,
        select: {
          id: true,
          title: true,
          body: true, // (optional to remove later)
          created_at: true,
          user: { select: { id: true, name: true, avatar_url: true } },
          _count: { select: { reply_topics: true } },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.topics.count(),
    ]);

    const items = topics.map((t) => ({
      id: t.id,
      title: t.title,
      body: t.body,
      created_at: t.created_at,
      user: t.user,
      repliesCount: t._count.reply_topics,
    }));

    const result = {
      items,
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

    const cached = await getCachedData(key);
    if (cached) return cached;

    const topic = await prisma.topics.findUnique({
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

    const cached = await getCachedData(key);
    if (cached) return cached;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const topic = await this.getTopicBase(topicId);

    const [replies, totalReplies] = await Promise.all([
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

    const result = {
      topic,
      replies,
      repliesPagination: {
        page,
        pageSize,
        total: totalReplies,
        totalPages: Math.ceil(totalReplies / pageSize),
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

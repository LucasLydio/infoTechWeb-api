// src/services/news.service.js
const prisma = require("../config/database.js");
const {
  getCachedData,
  setCachedData,
  getCacheVersion,
  bumpCacheVersion,
} = require("../utils/cache");

const NEWS_LIST_TTL = 60 * 2; // 2 min
const NEWS_DETAIL_TTL = 60 * 2; // 2 min
const NEWS_ENTITY_TTL = 60 * 5; // 5 min

function clampPagination(page, pageSize) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const sRaw = parseInt(pageSize, 10) || 10;
  const s = Math.min(Math.max(1, sRaw), 50);
  return { page: p, pageSize: s };
}

class NewsService {
  async createNews(data) {
    const news = await prisma.news.create({
      data: {
        title: data.title,
        body: data.body,
      },
      select: {
        id: true,
        title: true,
        body: true,
        view: true,
        like: true,
        created_at: true,
      },
    });

    await bumpCacheVersion("news:list:version");
    await bumpCacheVersion(`news:detail:${news.id}:version`);

    await setCachedData(`news:entity:${news.id}`, news, NEWS_ENTITY_TTL);

    return news;
  }

  async listNews(page = 1, pageSize = 10) {
    const pg = clampPagination(page, pageSize);
    page = pg.page;
    pageSize = pg.pageSize;

    const version = await getCacheVersion("news:list:version", "1");
    const key = `news:list:v${version}:p${page}:s${pageSize}`;

    const cached = await getCachedData(key);
    if (cached) return cached;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [rows, total] = await Promise.all([
      prisma.news.findMany({
        skip,
        take,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          body: true, 
          view: true,
          like: true,
          created_at: true,
          _count: { select: { reply_news: true } },
        },
      }),
      prisma.news.count(),
    ]);

    
    const data = rows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      view: n.view,
      like: n.like,
      created_at: n.created_at,
      repliesCount: n._count.reply_news,
    }));

    const result = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    await setCachedData(key, result, NEWS_LIST_TTL);
    return result;
  }

  async getNewsBase(newsId) {
    const key = `news:entity:${newsId}`;

    const cached = await getCachedData(key);
    if (cached) return cached;

    const item = await prisma.news.findUnique({
      where: { id: newsId },
      select: {
        id: true,
        title: true,
        body: true,
        view: true,
        like: true,
        created_at: true,
      },
    });

    if (!item) {
      const error = new Error("Notícia não encontrada");
      error.statusCode = 404;
      throw error;
    }

    await setCachedData(key, item, NEWS_ENTITY_TTL);
    return item;
  }

  async getNewsWithReplies(newsId, page = 1, pageSize = 10) {
    const pg = clampPagination(page, pageSize);
    page = pg.page;
    pageSize = pg.pageSize;

    const detailVersion = await getCacheVersion(`news:detail:${newsId}:version`, "1");
    const key = `news:detail:${newsId}:v${detailVersion}:p${page}:s${pageSize}`;

    const cached = await getCachedData(key);
    if (cached) return cached;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const exists = await prisma.news.findUnique({
      where: { id: newsId },
      select: { id: true },
    });

    if (!exists) {
      const error = new Error("Notícia não encontrada");
      error.statusCode = 404;
      throw error;
    }

    const updatedForView = await prisma.news.update({
      where: { id: newsId },
      data: { view: { increment: 1 } },
      select: {
        id: true,
        title: true,
        body: true,
        view: true,
        like: true,
        created_at: true,
      },
    });

    await setCachedData(`news:entity:${newsId}`, updatedForView, NEWS_ENTITY_TTL);

    const [replies, totalReplies] = await Promise.all([
      prisma.reply_news.findMany({
        where: { news_id: newsId },
        skip,
        take,
        orderBy: { created_at: "asc" },
        select: {
          id: true,
          news_id: true,
          body: true,
          created_at: true,
          user: { select: { id: true, name: true, avatar_url: true } },
        },
      }),
      prisma.reply_news.count({ where: { news_id: newsId } }),
    ]);

    const result = {
      news: updatedForView,
      replies,
      repliesPagination: {
        page,
        pageSize,
        total: totalReplies,
        totalPages: Math.ceil(totalReplies / pageSize),
      },
    };

    const ttl = page === 1 ? NEWS_DETAIL_TTL : 30;
    await setCachedData(key, result, ttl);

    return result;
  }


  async likeNews(newsId) {
    const newsItem = await prisma.news.update({
      where: { id: newsId },
      data: { like: { increment: 1 } },
      select: {
        id: true,
        title: true,
        body: true,
        view: true,
        like: true,
        created_at: true,
      },
    });

    await bumpCacheVersion(`news:detail:${newsId}:version`);
    await bumpCacheVersion("news:list:version");
    await setCachedData(`news:entity:${newsId}`, newsItem, NEWS_ENTITY_TTL);

    return newsItem;
  }

  async invalidateNews(newsId) {
    await bumpCacheVersion("news:list:version");
    await bumpCacheVersion(`news:detail:${newsId}:version`);
  }
}

module.exports = new NewsService();

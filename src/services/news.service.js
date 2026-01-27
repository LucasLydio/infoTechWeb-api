// src/services/news.service.js
const prisma = require("../config/database.js");
const {
  getCachedData,
  setCachedData,
  getCacheVersion,
  bumpCacheVersion,
} = require("../utils/cache");

const NEWS_LIST_TTL = 60 * 2;   // 2 min
const NEWS_DETAIL_TTL = 60 * 2; // 2 min

class NewsService {
  async createNews(data) {
    const news = await prisma.news.create({
      data: {
        title: data.title,
        body: data.body,
      },
    });

    // Invalidate list caches (all pages)
    await bumpCacheVersion("news:list:version");

    // Optional future-proof (detail caches for this item)
    await bumpCacheVersion(`news:detail:${news.id}:version`);

    return news;
  }

  async listNews(page = 1, pageSize = 10) {
    const version = await getCacheVersion("news:list:version", "1");
    const key = `news:list:v${version}:p${page}:s${pageSize}`;

    let result = await getCachedData(key);
    if (result) return result;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: {
          _count: { select: { reply_news: true } },
        },
      }),
      prisma.news.count(),
    ]);

    result = {
      data: items,
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

  async getNewsWithReplies(newsId, page = 1, pageSize = 10) {
    const detailVersion = await getCacheVersion(`news:detail:${newsId}:version`, "1");
    const key = `news:detail:${newsId}:v${detailVersion}:p${page}:s${pageSize}`;

    let result = await getCachedData(key);
    if (result) return result;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const newsItem = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!newsItem) {
      const error = new Error("Notícia não encontrada");
      error.statusCode = 404;
      throw error;
    }

    // Increment view ONLY when cache miss (otherwise caching would block view increments)
    await prisma.news.update({
      where: { id: newsId },
      data: {
        view: { increment: 1 },
      },
    });

    const [replies, totalReplies] = await Promise.all([
      prisma.reply_news.findMany({
        where: { news_id: newsId },
        skip,
        take,
        orderBy: { created_at: "asc" },
        include: {
          user: { select: { id: true, name: true, avatar_url: true } },
        },
      }),
      prisma.reply_news.count({ where: { news_id: newsId } }),
    ]);

    result = {
      news: newsItem,
      replies,
      repliesPagination: {
        page,
        pageSize,
        total: totalReplies,
        totalPages: Math.ceil(totalReplies / pageSize),
      },
    };

    await setCachedData(key, result, NEWS_DETAIL_TTL);

    // Since view changed in DB, bump detail version so next request uses a new key
    // (prevents serving stale "view" values for long)
    await bumpCacheVersion(`news:detail:${newsId}:version`);

    return result;
  }

  async likeNews(newsId) {
    const newsItem = await prisma.news.update({
      where: { id: newsId },
      data: {
        like: { increment: 1 },
      },
    });

    // Invalidate this news detail caches (likes changed)
    await bumpCacheVersion(`news:detail:${newsId}:version`);

    // Also invalidates list pages if you show likes there
    await bumpCacheVersion("news:list:version");

    return newsItem;
  }
}

module.exports = new NewsService();

// src/controllers/news.controller.js
const NewsService = require("../services/news.service.js");
const validateSchema = require("../validators/validate.js");
const { CreateNewsDTO } = require("../validators/news.validators.js");
const async = require("../utils/async");
const { ok, created } = require("../utils/response");

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSizeRaw = parseInt(query.pageSize, 10) || 10;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), 50);
  return { page, pageSize };
}

class NewsController {
  create = async(async (req, res) => {
    const payload = await validateSchema(CreateNewsDTO, req.body);
    const news = await NewsService.createNews(payload);

    return created(res, news, undefined, "Notícia criada com sucesso");
  });

  list = async(async (req, res) => {
    const { page, pageSize } = parsePagination(req.query);
    const result = await NewsService.listNews(page, pageSize);

    // result = { data, pagination }
    return ok(res, result.data, { pagination: result.pagination });
  });

  getById = async(async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      const err = new Error("ID inválido");
      err.statusCode = 400;
      throw err;
    }

    const { page, pageSize } = parsePagination(req.query);
    const result = await NewsService.getNewsWithReplies(id, page, pageSize);

    return ok(
      res,
      {
        news: result.news,
        replies: result.replies,
      },
      {
        repliesPagination: result.repliesPagination,
      }
    );
  });

  like = async(async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      const err = new Error("ID inválido");
      err.statusCode = 400;
      throw err;
    }

    const updated = await NewsService.likeNews(id);

    return ok(res, updated, undefined, "Like adicionado");
  });
}

module.exports = new NewsController();

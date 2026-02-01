// src/controllers/news.controller.js
const NewsService = require("../services/news.service.js");
const validateSchema = require("../validators/validate.js");
const { CreateNewsDTO } = require("../validators/news.validators.js");
const async = require("../utils/async");

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
    return res.status(201).json(news);
  });

  list = async(async (req, res) => {
    const { page, pageSize } = parsePagination(req.query);
    const result = await NewsService.listNews(page, pageSize);
    return res.json(result);
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
    return res.json(result);
  });

  like = async(async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      const err = new Error("ID inválido");
      err.statusCode = 400;
      throw err;
    }

    const updated = await NewsService.likeNews(id);
    return res.json(updated);
  });
}

module.exports = new NewsController();

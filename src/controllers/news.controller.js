// src/controllers/news.controller.js
const NewsService = require('../services/news.service.js');
const validateSchema = require('../validators/validate.js');
const { CreateNewsDTO } = require('../validators/news.validators.js');

class NewsController {
  async create(req, res, next) {
    try {
      const payload = await validateSchema(CreateNewsDTO, req.body);
      const news = await NewsService.createNews(payload);
      return res.status(201).json(news);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = await NewsService.listNews(page, pageSize);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = await NewsService.getNewsWithReplies(id, page, pageSize);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async like(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await NewsService.likeNews(id);
      return res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NewsController();

// src/controllers/replyNews.controller.js
const ReplyNewsService = require('../services/replyNews.service.js');
const validateSchema = require('../validators/validate.js');
const { CreateReplyNewsDTO } = require('../validators/replyNews.validator.js');

class ReplyNewsController {
  async create(req, res, next) {
    try {
      const payload = await validateSchema(CreateReplyNewsDTO, {
        ...req.body,
        news_id: req.body.news_id || req.params.newsId,
      });

      const reply = await ReplyNewsService.createReplyNews(req.user.id, payload);
      return res.status(201).json(reply);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReplyNewsController();

// src/controllers/topic.controller.js
const TopicService = require('../services/topic.service');
const validateSchema = require('../validators/validate');
const { CreateTopicDTO } = require('../validators/topic.validator');

class TopicController {
  async create(req, res, next) {
    try {
      const payload = await validateSchema(CreateTopicDTO, req.body);
      const topic = await TopicService.createTopic(req.user.id, payload);
      return res.status(201).json(topic);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = await TopicService.listTopics(page, pageSize);
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

      const result = await TopicService.getTopicWithReplyTopics(id, page, pageSize);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TopicController();

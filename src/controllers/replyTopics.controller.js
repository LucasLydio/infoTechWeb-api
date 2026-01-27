// src/controllers/reply.controller.js
const ReplyService = require('../services/replyTopics.service');
const validateSchema = require('../validators/validate');
const { CreateReplyDTO } = require('../validators/reply.validator');

class ReplyTopicsController {
  async getByTopicId(req, res) {
    const { topic_id } = req.params;

    if (!topic_id) {
      return res.status(400).json({ error: 'topic_id é obrigatório' });
    }

    try {
      const replies = await ReplyService.getByTopicId(topic_id);
      return res.json(replies);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar respostas', details: err.message });
    }
  }

  async create(req, res, next) {
    try {
      const payload = await validateSchema(CreateReplyDTO, {
        ...req.body,
        topic_id: req.body.topic_id || req.params.topicId,
      });
      console.log('Payload validado para criação de resposta:', req.user.id, payload);
      const reply = await ReplyService.createReply(req.user.id, payload);
      return res.status(201).json(reply);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReplyTopicsController();

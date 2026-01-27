// src/controllers/message.controller.js
const MessageService = require('../services/message.service');
const validateSchema = require('../validators/validate');
const { SendPrivateMessageDTO } = require('../validators/message.validator');

class MessageController {
  async send(req, res, next) {
    try {
      const payload = await validateSchema(SendPrivateMessageDTO, req.body);
      const message = await MessageService.sendMessage(req.user.id, payload);
      return res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async inbox(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const result = await MessageService.listInbox(req.user.id, page, pageSize);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async sent(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const result = await MessageService.listSent(req.user.id, page, pageSize);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await MessageService.markAsRead(req.user.id, id);
      return res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();

// src/controllers/replyNews.controller.js
const ReplyNewsService = require("../services/replyNews.service.js");
const validateSchema = require("../validators/validate.js");
const {
  CreateReplyNewsDTO,
  UpdateReplyNewsDTO,
  DeleteReplyNewsDTO,
} = require("../validators/replyNews.validator.js");
const async = require("../utils/async");

function requireId(value, name) {
  if (!value || typeof value !== "string") {
    const err = new Error(`${name} é obrigatório`);
    err.statusCode = 400;
    throw err;
  }
  return value;
}

class ReplyNewsController {
  create = async(async (req, res) => {
    const news_id = req.body.news_id || req.params.news_id || req.params.newsId;
    requireId(news_id, "news_id");

    const payload = await validateSchema(CreateReplyNewsDTO, {
      ...req.body,
      news_id,
    });

    const reply = await ReplyNewsService.createReply(req.user.id, payload);
    return res.status(201).json(reply);
  });

  update = async(async (req, res) => {
    const id = req.params.id || req.body.id;
    requireId(id, "id");

    const payload = await validateSchema(UpdateReplyNewsDTO, req.body);

    const updated = await ReplyNewsService.updateReply(req.user.id, id, payload);
    return res.json(updated);
  });

  delete = async(async (req, res) => {
    const id = req.params.id || req.body.id;
    requireId(id, "id");

    await validateSchema(DeleteReplyNewsDTO, { id });

    const result = await ReplyNewsService.deleteReply(req.user.id, id);
    return res.json(result);
  });
}

module.exports = new ReplyNewsController();

// src/controllers/replyNews.controller.js
const ReplyNewsService = require("../services/replyNews.service.js");
const validateSchema = require("../validators/validate.js");
const {
  CreateReplyNewsDTO,
  UpdateReplyNewsDTO,
  DeleteReplyNewsDTO,
} = require("../validators/replyNews.validator.js");
const async = require("../utils/async");
const { ok, created } = require("../utils/response");

function requireId(value, name) {
  if (!value || typeof value !== "string") {
    const err = new Error(`${name} é obrigatório`);
    err.statusCode = 400;
    throw err;
  }
  return value;
}

class ReplyNewsController {
  list = async(async (req, res) => {
    const news_id = req.params.news_id;
    requireId(news_id, "news_id");

    const replies = await ReplyNewsService.getByNewsId(news_id);
    return ok(res, replies);
  });

  create = async(async (req, res) => {
    const news_id = req.params.news_id;
    requireId(news_id, "news_id");

    const payload = await validateSchema(CreateReplyNewsDTO, {
      ...req.body,
      news_id,
    });

    const reply = await ReplyNewsService.createReply(req.user.id, payload);

    return created(res, reply, undefined, "Resposta criada com sucesso");
  });

  update = async(async (req, res) => {
    const id = req.params.id;
    requireId(id, "id");

    const payload = await validateSchema(UpdateReplyNewsDTO, req.body);

    const updated = await ReplyNewsService.updateReply(req.user.id, id, payload);

    return ok(res, updated, undefined, "Resposta atualizada com sucesso");
  });

  delete = async(async (req, res) => {
    const id = req.params.id;
    requireId(id, "id");

    await validateSchema(DeleteReplyNewsDTO, { id });

    const result = await ReplyNewsService.deleteReply(req.user.id, id);

    return ok(res, result, undefined, "Resposta removida com sucesso");
  });
}

module.exports = new ReplyNewsController();

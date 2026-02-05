// src/controllers/replyTopics.controller.js
const ReplyTopicsService = require("../services/replyTopics.service");
const validateSchema = require("../validators/validate");
const {
  CreateReplyTopicDTO,
  UpdateReplyTopicDTO,
  DeleteReplyTopicDTO,
} = require("../validators/replyTopics.validator");
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

class ReplyTopicsController {
  list = async(async (req, res) => {
    const topic_id = req.params.topic_id;
    requireId(topic_id, "topic_id");

    const replies = await ReplyTopicsService.getByTopicId(topic_id);
    return ok(res, replies);
  });

  create = async(async (req, res) => {
    const topic_id = req.params.topic_id;
    requireId(topic_id, "topic_id");

    const payload = await validateSchema(CreateReplyTopicDTO, {
      ...req.body,
      topic_id,
    });

    const reply = await ReplyTopicsService.createReply(req.user.id, payload);

    return created(res, reply, undefined, "Resposta criada com sucesso");
  });

  update = async(async (req, res) => {
    const id = req.params.id;
    requireId(id, "id");

    const payload = await validateSchema(UpdateReplyTopicDTO, req.body);
    const updated = await ReplyTopicsService.updateReply(req.user.id, id, payload);

    return ok(res, updated, undefined, "Resposta atualizada com sucesso");
  });

  delete = async(async (req, res) => {
    const id = req.params.id;
    requireId(id, "id");

    await validateSchema(DeleteReplyTopicDTO, { id });
    const result = await ReplyTopicsService.deleteReply(req.user.id, id);

    return ok(res, result, undefined, "Resposta removida com sucesso");
  });
}

module.exports = new ReplyTopicsController();

// src/controllers/replyTopics.controller.js
const ReplyTopicsService = require("../services/replyTopics.service");
const validateSchema = require("../validators/validate");
const {
  CreateReplyTopicDTO,
  UpdateReplyTopicDTO,
  DeleteReplyTopicDTO,
} = require("../validators/replyTopics.validator");
const async = require("../utils/async");

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
    const topic_id = req.params.topic_id || req.params.topicId;
    requireId(topic_id, "topic_id");

    // validate uuid format (optional but useful)
    await validateSchema(CreateReplyTopicDTO.pick(["topic_id"]), { topic_id });
    // ^ if you prefer not using pick, you can remove this line

    const replies = await ReplyTopicsService.getByTopicId(topic_id);
    return res.json(replies);
  });

  create = async(async (req, res) => {
    const topic_id = req.body.topic_id || req.params.topic_id || req.params.topicId;
    requireId(topic_id, "topic_id");

    const payload = await validateSchema(CreateReplyTopicDTO, {
      ...req.body,
      topic_id,
    });

    const reply = await ReplyTopicsService.createReply(req.user.id, payload);
    return res.status(201).json(reply);
  });

  update = async(async (req, res) => {
    const id = req.params.id || req.body.id;
    requireId(id, "id");

    const payload = await validateSchema(UpdateReplyTopicDTO, req.body);
    const updated = await ReplyTopicsService.updateReply(req.user.id, id, payload);

    return res.json(updated);
  });

  delete = async(async (req, res) => {
    const id = req.params.id || req.body.id;
    requireId(id, "id");

    await validateSchema(DeleteReplyTopicDTO, { id });
    const result = await ReplyTopicsService.deleteReply(req.user.id, id);

    return res.json(result);
  });
}

module.exports = new ReplyTopicsController();

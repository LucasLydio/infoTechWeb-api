// src/controllers/topic.controller.js
const TopicService = require("../services/topic.service");
const validateSchema = require("../validators/validate");
const { CreateTopicDTO } = require("../validators/topic.validator");
const async = require("../utils/async");
const { ok, created } = require("../utils/response");

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSizeRaw = parseInt(query.pageSize, 10) || 10;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), 50);
  return { page, pageSize };
}

class TopicController {
  create = async(async (req, res) => {
    const payload = await validateSchema(CreateTopicDTO, req.body);
    const topic = await TopicService.createTopic(req.user.id, payload);

    return created(res, topic, undefined, "Tópico criado com sucesso");
  });

  list = async(async (req, res) => {
    const { page, pageSize } = parsePagination(req.query);
    const result = await TopicService.listTopics(page, pageSize);

    return ok(res, result.items, { pagination: result.pagination });
  });

  getById = async(async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      const err = new Error("ID inválido");
      err.statusCode = 400;
      throw err;
    }

    const { page, pageSize } = parsePagination(req.query);
    const result = await TopicService.getTopicWithReplyTopics(id, page, pageSize);

    return ok(
      res,
      {
        topic: result.topic,
        replies: result.replies,
      },
      {
        repliesPagination: result.repliesPagination,
      }
    );
  });

}

module.exports = new TopicController();

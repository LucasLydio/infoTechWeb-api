// src/routes/reply.routes.js
const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware.js');
const replyTopicsController = require('../controllers/replyTopics.controller.js');

const router = express.Router();

router.get('/topic/:topic_id', replyTopicsController.getByTopicId);

// POST /api/replies  (body: { topic_id, body }) OU /api/topics/:topicId/replies
router.post('/', authMiddleware, replyTopicsController.create);

// Opcional: rota aninhada
router.post(
  '/topic/:topicId',
  authMiddleware,
  replyTopicsController.create
);

module.exports = router;

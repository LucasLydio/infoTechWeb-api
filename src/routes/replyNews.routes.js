// src/routes/replyNews.routes.js
const express = require('express');
const ReplyNewsController = require('../controllers/replyNews.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

// Todas as rotas exigem usuário logado
router.use(authMiddleware);

/**
 * Criar resposta para notícia
 * POST /api/news-replies
 * body: { news_id, body }
 */
router.post('/', ReplyNewsController.create);

/**
 * Rota opcional aninhada
 * POST /api/news-replies/news/:newsId
 */
router.post('/news/:newsId', ReplyNewsController.create);

module.exports = router;

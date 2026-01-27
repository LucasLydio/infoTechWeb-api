// src/routes/news.routes.js
const express = require('express');
const NewsController = require('../controllers/news.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

/**
 * Public: listar notícias
 * GET /api/news?page=&pageSize=
 */
router.get('/', NewsController.list);

/**
 * Public: obter notícia + replies
 * GET /api/news/:id
 */
router.get('/:id', NewsController.getById);

/**
 * Protegido: criar notícia (se quiser pode trocar lógica de permissão depois)
 * POST /api/news
 */
router.post('/', authMiddleware, NewsController.create);

/**
 * Protegido: like na notícia
 * POST /api/news/:id/like
 */
router.post('/:id/like', authMiddleware, NewsController.like);

module.exports = router;

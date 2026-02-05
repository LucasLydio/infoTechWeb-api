// src/routes/news.routes.js
const express = require('express');
const NewsController = require('../controllers/news.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();


router.get('/', NewsController.list);

router.get('/:id', NewsController.getById);

router.post('/', authMiddleware, NewsController.create);

router.post('/:id/like', authMiddleware, NewsController.like);

module.exports = router;

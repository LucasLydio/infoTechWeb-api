// src/routes/topic.routes.js
const express = require('express');
const TopicController = require('../controllers/topic.controller');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

// /api/topics
router.get('/', TopicController.list);

// /api/topics/:id
router.get('/:id', TopicController.getById);

// /api/topics
router.post('/', authMiddleware, TopicController.create);

module.exports = router;

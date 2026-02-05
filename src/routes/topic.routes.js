// src/routes/topic.routes.js
const express = require('express');
const TopicController = require('../controllers/topic.controller');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.get('/', TopicController.list);

router.get('/:id', TopicController.getById);

router.post('/', authMiddleware, TopicController.create);

module.exports = router;

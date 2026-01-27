// src/routes/index.js
const express = require('express');
const userRoutes = require('./user.routes');
const topicRoutes = require('./topic.routes');
const replyTopics = require('./replyTopics.routes.js');
const messageRoutes = require('./message.routes');
const newsRoutes = require('./news.routes');
const replyNewsRoutes = require('./replyNews.routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/topics', topicRoutes);
router.use('/reply-topics', replyTopics);
router.use('/messages', messageRoutes);
router.use('/news', newsRoutes);
router.use('/reply-news', replyNewsRoutes);
// router.use('/news-replies', replyNewsRoutes);

module.exports = router;

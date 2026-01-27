// src/routes/message.routes.js
const express = require('express');
const MessageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.use(authMiddleware);

// POST /api/messages
router.post('/', authMiddleware, MessageController.send);

// GET /api/messages/inbox
router.get('/inbox', authMiddleware, MessageController.inbox);

// GET /api/messages/sent
router.get('/sent', authMiddleware, MessageController.sent);

// PATCH /api/messages/:id/read
router.patch('/:id/read', authMiddleware, MessageController.markAsRead);

module.exports = router;

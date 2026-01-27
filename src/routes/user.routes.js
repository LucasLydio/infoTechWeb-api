// src/routes/user.routes.js
const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

// /api/users/register
router.post('/register', UserController.register);

// /api/users/login
router.post('/login', UserController.login);

// /api/users/me
router.get('/me', authMiddleware, UserController.me);

// /api/users?page=1&pageSize=10
router.get('/', authMiddleware, UserController.list);

module.exports = router;

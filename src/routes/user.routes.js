// src/routes/user.routes.js
const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();


router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.get('/me', authMiddleware, UserController.me);

router.get('/', authMiddleware, UserController.list);

module.exports = router;

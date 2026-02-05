// src/routes/replyNews.routes.js
const express = require("express");
const ReplyNewsController = require("../controllers/replyNews.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get("/news/:news_id", ReplyNewsController.list);

router.post("/news/:news_id", authMiddleware, ReplyNewsController.create);

router.put("/:id", authMiddleware, ReplyNewsController.update);

router.delete("/:id", authMiddleware, ReplyNewsController.delete);

module.exports = router;

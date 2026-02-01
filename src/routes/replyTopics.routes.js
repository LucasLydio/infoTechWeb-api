// src/routes/replyTopics.routes.js
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware.js");
const replyTopicsController = require("../controllers/replyTopics.controller.js");

const router = express.Router();


router.get("/topic/:topic_id", replyTopicsController.list);


router.post("/", authMiddleware, replyTopicsController.create);


router.post("/topic/:topicId", authMiddleware, replyTopicsController.create);


router.put("/:id", authMiddleware, replyTopicsController.update);


router.delete("/:id", authMiddleware, replyTopicsController.delete);

module.exports = router;

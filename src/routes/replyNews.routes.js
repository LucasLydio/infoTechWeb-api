// src/routes/replyNews.routes.js
const express = require("express");
const ReplyNewsController = require("../controllers/replyNews.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.use(authMiddleware);


router.post("/", ReplyNewsController.create);
router.post("/news/:newsId", ReplyNewsController.create);


router.put("/:id", ReplyNewsController.update);


router.delete("/:id", ReplyNewsController.delete);

module.exports = router;

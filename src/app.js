// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// CORS (configurable)
const origins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : true,
    credentials: true,
  })
);

app.use(express.json());

// Health check (useful for uptime / load balancers)
app.get("/health", (req, res) => res.status(200).json({ ok: true }));

app.use("/api", routes);

app.use(errorMiddleware);

module.exports = app;

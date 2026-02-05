// src/server.js
require("dotenv").config();
const app = require("./app");

const prisma = require("./config/database");
const { ensureRedis } = require("./utils/redis");

const PORT = process.env.PORT || 3000;

async function warmup() {

  try {
const t0 = Date.now();
await prisma.$queryRaw`SELECT 1`;
console.log("[db] select 1 ms:", Date.now() - t0);

  } catch (err) {
    console.error("[db] warmup failed:", err.message);
  }

  if (process.env.REDIS_DISABLED === "true") {
    console.log("[redis] disabled (REDIS_DISABLED=true)");
    return;
  }

  try {
    await ensureRedis();
  } catch {
    console.log("[redis] unavailable (cache will be bypassed)");
  }
}

async function bootstrap() {
  await warmup();

  app.listen(PORT, () => {
    console.log(`🚀 Server rodando na porta ${PORT}`);
  });
}

bootstrap();


async function shutdown() {
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

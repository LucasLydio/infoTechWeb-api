const { createClient } = require("redis");

let client;
let connectPromise;

function getRedis() {
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  client.on("error", (err) => {
    console.error("[redis] error:", err);
  });

  // connect only once (lazy connect)
  connectPromise = client.connect().catch((err) => {
    console.error("[redis] connect failed:", err);
    client = null;
    connectPromise = null;
    throw err;
  });

  console.log('Redis is On!!')

  return client;
}

async function ensureRedis() {
  const c = getRedis();
  if (connectPromise) await connectPromise;
  return c;
}

module.exports = { getRedis, ensureRedis };

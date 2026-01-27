const { ensureRedis } = require("./redis");

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

async function getRedisOrNull() {
  if (process.env.REDIS_DISABLED === "true") return null;

  try {
    return await ensureRedis();
  } catch {
    return null; 
  }
}


async function getCachedData(key) {
  const redis = await getRedisOrNull();
  if (!redis) return null;

  const cached = await redis.get(key);
  if (!cached) return null;

  return safeJsonParse(cached);
}


async function setCachedData(key, value, ttlSeconds) {
  const redis = await getRedisOrNull();
  if (!redis) return;

  if (ttlSeconds && Number.isFinite(ttlSeconds)) {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }

  await redis.set(key, JSON.stringify(value));
}


async function deleteCacheData(keys) {
  const redis = await getRedisOrNull();
  if (!redis) return;

  const arr = Array.isArray(keys) ? keys : [keys];
  if (!arr.length) return;

  await redis.del(arr);
}


async function getCacheVersion(versionKey, fallback = "1") {
  const redis = await getRedisOrNull();
  if (!redis) return fallback;

  const v = await redis.get(versionKey);
  return v || fallback;
}

async function bumpCacheVersion(versionKey) {
  const redis = await getRedisOrNull();
  if (!redis) return;

  await redis.incr(versionKey);
}

module.exports = {
  getCachedData,
  setCachedData,
  deleteCacheData,
  getCacheVersion,
  bumpCacheVersion,
};

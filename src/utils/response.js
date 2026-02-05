// src/utils/response.js
function ok(res, data, meta = {}, message) {
  const payload = { success: true, data, meta: meta ?? {} };
  if (message) payload.message = message;
  return res.status(200).json(payload);
}

function created(res, data, meta = {}, message) {
  const payload = { success: true, data, meta: meta ?? {} };
  if (message) payload.message = message;
  return res.status(201).json(payload);
}

module.exports = { ok, created };

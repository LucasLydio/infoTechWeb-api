// src/middlewares/error.middleware.js
function errorMiddleware(err, req, res, next) {
  console.error(err);

  if (err?.name === "PrismaClientValidationError") {
    return res.status(400).json({
      success: false,
      data: null,
      meta: { details: null },
      message: "UUID inválido",
    });
  }


  if (err?.name === "PrismaClientKnownRequestError" && err?.code === "P2023") {
    return res.status(400).json({
      success: false,
      data: null,
      meta: { details: err?.meta || null },
      message: "UUID inválido",
    });
  }

  if (err?.name === "PrismaClientKnownRequestError" && err?.code === "P2025") {
    return res.status(404).json({
      success: false,
      data: null,
      meta: { details: err?.meta || null },
      message: "Recurso não encontrado",
    });
  }

  const statusCode = err.statusCode || 500;

  const message =
    statusCode === 500 ? "Erro interno do servidor" : err.message || "Erro";

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      data: null,
      meta: {
        details: err.errors || [],
      },
      message: "Erro de validação",
    });
  }

  return res.status(statusCode).json({
    success: false,
    data: null,
    meta: {
      details: err.details || null,
    },
    message,
  });
}

module.exports = errorMiddleware;

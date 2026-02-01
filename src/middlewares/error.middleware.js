// src/middlewares/error.middleware.js
function errorMiddleware(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erro de validação',
      details: err.errors,
    });
  }

  return res.status(statusCode).json({
    message,
    details: err.details || null,
  });
}

module.exports = errorMiddleware;

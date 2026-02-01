async function validateSchema(schema, data) {
  try {
    return await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (err) {
    
    err.statusCode = 400;
    err.message = "Erro de validação";
    err.details = err.errors || null;
    throw err;
  }
}

module.exports = validateSchema;

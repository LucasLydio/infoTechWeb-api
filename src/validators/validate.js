async function validateSchema(schema, data) {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

module.exports = validateSchema;

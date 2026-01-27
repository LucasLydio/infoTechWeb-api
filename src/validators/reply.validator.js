// src/validators/reply.validator.js
const yup = require('yup');

const CreateReplyDTO = yup.object({
  topic_id: yup.string().uuid('ID de tópico inválido').required('topic_id é obrigatório'),
  body: yup.string().min(1, 'Resposta não pode ser vazia').required('Corpo é obrigatório'),
});

module.exports = {
  CreateReplyDTO,
};

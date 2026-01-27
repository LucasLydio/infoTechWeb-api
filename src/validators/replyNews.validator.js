// src/validators/replyNews.validator.js
const yup = require('yup');

const CreateReplyNewsDTO = yup.object({
  news_id: yup
    .string()
    .uuid('ID da notícia inválido')
    .required('news_id é obrigatório'),
  body: yup
    .string()
    .min(1, 'Resposta não pode ser vazia')
    .required('Corpo é obrigatório'),
});

module.exports = {
  CreateReplyNewsDTO,
};

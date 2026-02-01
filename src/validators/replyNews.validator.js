// src/validators/replyNews.validator.js
const yup = require("yup");

const CreateReplyNewsDTO = yup.object({
  news_id: yup
    .string()
    .uuid("ID da notícia inválido")
    .required("news_id é obrigatório"),
  body: yup
    .string()
    .min(1, "Resposta não pode ser vazia")
    .required("Corpo é obrigatório"),
});

const UpdateReplyNewsDTO = yup.object({
  body: yup
    .string()
    .min(1, "Resposta não pode ser vazia")
    .required("Corpo é obrigatório"),
});

const DeleteReplyNewsDTO = yup.object({
  id: yup
    .string()
    .uuid("ID da resposta inválido")
    .required("id é obrigatório"),
});

module.exports = {
  CreateReplyNewsDTO,
  UpdateReplyNewsDTO,
  DeleteReplyNewsDTO,
};

// src/validators/replyTopics.validator.js
const yup = require("yup");

const CreateReplyTopicDTO = yup.object({
  topic_id: yup
    .string()
    .uuid("ID de tópico inválido")
    .required("topic_id é obrigatório"),
  body: yup
    .string()
    .min(1, "Resposta não pode ser vazia")
    .required("Corpo é obrigatório"),
});

const UpdateReplyTopicDTO = yup.object({
  body: yup
    .string()
    .min(1, "Resposta não pode ser vazia")
    .required("Corpo é obrigatório"),
});

const DeleteReplyTopicDTO = yup.object({
  id: yup
    .string()
    .uuid("ID da resposta inválido")
    .required("id é obrigatório"),
});

const ListReplyTopicsDTO = yup.object({
  topic_id: yup
    .string()
    .uuid("ID de tópico inválido")
    .required("topic_id é obrigatório"),
});

module.exports = {
  CreateReplyTopicDTO,
  UpdateReplyTopicDTO,
  DeleteReplyTopicDTO,
  ListReplyTopicsDTO,
};

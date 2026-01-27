// src/validators/topic.validator.js
const yup = require('yup');

const CreateTopicDTO = yup.object({
  title: yup.string().min(3, 'Título muito curto').required('Título é obrigatório'),
  body: yup.string().min(5, 'Corpo muito curto').required('Corpo é obrigatório'),
});

module.exports = {
  CreateTopicDTO,
};

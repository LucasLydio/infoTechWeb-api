// src/validators/message.validator.js
const yup = require('yup');

const SendPrivateMessageDTO = yup.object({
  to_user_id: yup.string().uuid('ID de destinatário inválido').required('to_user_id é obrigatório'),
  body: yup.string().min(1, 'Mensagem não pode ser vazia').required('Mensagem é obrigatória'),
});

module.exports = {
  SendPrivateMessageDTO,
};

// src/validators/user.validator.js
const yup = require('yup');

const RegisterUserDTO = yup.object({
  name: yup.string().min(3, 'Nome deve ter ao menos 3 caracteres').required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().min(6, 'Senha deve ter ao menos 6 caracteres').required('Senha é obrigatória'),
  avatar_url: yup.string().url('URL do avatar inválida').nullable().optional(),
});

const LoginDTO = yup.object({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().required('Senha é obrigatória'),
});

module.exports = {
  RegisterUserDTO,
  LoginDTO,
};

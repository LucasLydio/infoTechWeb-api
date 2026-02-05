// src/controllers/user.controller.js
const UserService = require("../services/user.service");
const validateSchema = require("../validators/validate");
const { RegisterUserDTO, LoginDTO } = require("../validators/user.validator");
const async = require("../utils/async");
const { ok, created } = require("../utils/response");

class UserController {
  register = async(async (req, res) => {
    const payload = await validateSchema(RegisterUserDTO, req.body);
    const user = await UserService.register(payload);

    return created(res, user, undefined, "Usuário criado com sucesso");
  });

  login = async(async (req, res) => {
    const payload = await validateSchema(LoginDTO, req.body);
    const result = await UserService.login(payload.email, payload.password);

    return ok(res, result);
  });

  me = async(async (req, res) => {
    const user = await UserService.getProfile(req.user.id);
    return ok(res, user);
  });

  list = async(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await UserService.listUsers(page, pageSize);

    return ok(res, result.data, { pagination: result.pagination });
  });
}

module.exports = new UserController();

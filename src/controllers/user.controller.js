// src/controllers/user.controller.js
const UserService = require('../services/user.service');
const validateSchema = require('../validators/validate');
const { RegisterUserDTO, LoginDTO } = require('../validators/user.validator');

class UserController {
  async register(req, res, next) {
    try {
      const payload = await validateSchema(RegisterUserDTO, req.body);
      const user = await UserService.register(payload);
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const payload = await validateSchema(LoginDTO, req.body);
      const result = await UserService.login(payload.email, payload.password);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const result = await UserService.listUsers(page, pageSize);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

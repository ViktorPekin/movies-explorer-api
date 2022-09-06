const loginRoutes = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userControllers = require('../controllers/users');

loginRoutes.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  userControllers.login,
);

module.exports = loginRoutes;

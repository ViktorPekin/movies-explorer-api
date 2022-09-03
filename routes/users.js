const userRoutes = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userControllers = require('../controllers/users');

userRoutes.get('/users/me', userControllers.getUserMe);

userRoutes.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().email(),
    }),
  }),
  userControllers.patchUser,
);

module.exports = userRoutes;

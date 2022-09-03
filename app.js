require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');

const { ERROR_INTERNAL_SERVER } = require('./utils/errors');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./utils/NotFoundError');
const users = require('./routes/users');
const movies = require('./routes/movies');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/moviedb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
    }),
  }),
  createUser,
);

app.use(auth);

app.use(users);
app.use(movies);

app.use(errors());

app.use('*', (req, res, next) => {
  const err = new NotFoundError('Неверный путь');
  next(err);
});

app.use((err, req, res, next) => {
  const { statusCode = ERROR_INTERNAL_SERVER, message } = err;
  res.status(statusCode).send({
    message: statusCode === ERROR_INTERNAL_SERVER
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

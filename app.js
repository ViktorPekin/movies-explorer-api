require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');

const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const postErrors = require('./middlewares/postErrors');
const NotFoundError = require('./utils/NotFoundError');
const users = require('./routes/users');
const movies = require('./routes/movies');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const limiter = require('./utils/rateLimiter');

const app = express();

app.use(bodyParser.json());

app.use(limiter.limiter);

const allowedCors = [
  'https://movies41.students.nomoredomains.sbs',
  'http://movies41.students.nomoredomains.sbs',
];

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    next();
  }
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.end();
  }

  next();
});

mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(requestLogger);

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

app.use(errorLogger);

app.use(errors());

app.use('*', (req, res, next) => {
  const err = new NotFoundError('Неверный путь');
  next(err);
});

app.use(postErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

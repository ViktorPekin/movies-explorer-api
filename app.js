require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const auth = require('./middlewares/auth');
const postErrors = require('./middlewares/postErrors');
const NotFoundError = require('./utils/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, NODE_ENV, ADDRESS_DB } = process.env;
const limiter = require('./utils/rateLimiter');

const app = express();

app.use(bodyParser.json());

app.use(requestLogger);

const allowedCors = [
  'https://movies41.students.nomoredomains.sbs',
  'http://movies41.students.nomoredomains.sbs',
  'localhost:3000',
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

app.use(limiter.limiter);

mongoose.connect(NODE_ENV === 'production' ? ADDRESS_DB : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(require('./routes/login'));

app.use(require('./routes/registration'));

app.use(auth);

app.use(require('./routes/users'));

app.use(require('./routes/movies'));

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

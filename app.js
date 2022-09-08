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

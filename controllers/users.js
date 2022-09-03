const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;
const RepetitionError = require('../utils/RepetitionError');
const BadRequestError = require('../utils/BadRequestError');
const NotFoundError = require('../utils/NotFoundError');

exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id).then((user) => res.send({ user }))
    .catch(next);
};

exports.patchUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      } else {
        res.send({ user });
      }
    })
    .catch(next);
};

exports.createUser = (req, res, next) => {
  const { name } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create(
      {
        email: req.body.email,
        password: hash,
        name,
      },
    ))
    .then((user) => res.send(
      {
        user: {
          email: user.email,
          name: user.name,
          _id: user._id,
        },
      },
    ))
    .catch((err) => {
      if (err.code === 11000) {
        next(new RepetitionError('Пользователь с таким Email уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Неправельно введены данные'));
      } else {
        next(err);
      }
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};

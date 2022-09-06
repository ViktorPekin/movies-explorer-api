const movieRoutes = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const movieControllers = require('../controllers/movies');
const { linkRegular } = require('../utils/regularExpressions');

movieRoutes.get('/movies', movieControllers.getMovies);
movieRoutes.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().pattern(linkRegular),
      trailerLink: Joi.string().required().pattern(linkRegular),
      thumbnail: Joi.string().required().pattern(linkRegular),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  movieControllers.postMovies,
);
movieRoutes.delete(
  '/movies/:moviesId',
  celebrate({
    params: Joi.object().keys({
      moviesId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  movieControllers.checkId,
  movieControllers.deleteMovies,
);

module.exports = movieRoutes;

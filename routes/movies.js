const movieRoutes = require('express').Router();
const movieControllers = require('../controllers/movies');

movieRoutes.post('/movies', movieControllers.postMovies);
movieRoutes.get('/movies', movieControllers.getMovies);
movieRoutes.delete('/movies/:moviesId', movieControllers.checkId);
movieRoutes.delete('/movies/:moviesId', movieControllers.deleteMovies);

module.exports = movieRoutes;

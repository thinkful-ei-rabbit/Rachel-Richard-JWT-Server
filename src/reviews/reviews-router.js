const express = require('express');
const path = require('path');
const ReviewsService = require('./reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');

const reviewsRouter = express.Router();
const jsonBodyParser = express.json();

reviewsRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const { thing_id, rating, text } = req.body;
    let user_id = req.user.id;
    const newReview = { thing_id, rating, text, user_id };
    for (const [key, value] of Object.entries(newReview))
      if (!value)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    ReviewsService.insertReview(req.app.get('db'), newReview)
      .then((review) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${review.id}`))
          .json(ReviewsService.serializeReview(review));
      })
      .catch(next);
  });

module.exports = reviewsRouter;

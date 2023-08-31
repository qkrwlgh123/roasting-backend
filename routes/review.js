// 후기에 관련된 API
const express = require('express');
const router = express.Router();
const reviewController = require('../database/controllers/ReviewController');

router.get('/list', reviewController.seeReviews);

router.post('/submit', reviewController.addReview);

module.exports = router;

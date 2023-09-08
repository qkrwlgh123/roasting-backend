// 후기 답변에 관련된 API
const express = require('express');
const router = express.Router();
const answerController = require('../database/controllers/AnswerController');

router.post('/create', answerController.addAnswer);

module.exports = router;

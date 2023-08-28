// 유저에 관련된 API
const express = require('express');
const router = express.Router();
const userController = require('../database/controllers/UserController');

router.post('/sign-up', userController.addUser);

module.exports = router;

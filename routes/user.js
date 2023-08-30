// 유저에 관련된 API
const express = require('express');
const router = express.Router();
const userController = require('../database/controllers/UserController');
const { upload } = require('../utils/uploads');

router.post('/login', userController.loginUser);

router.post('/sign-up', upload.single('image'), userController.addUser);

router.get('/validate', userController.validateToken);

module.exports = router;

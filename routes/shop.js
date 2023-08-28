// 유저에 관련된 API
const express = require('express');
const router = express.Router();
const shopController = require('../database/controllers/ShopController');

router.post('/create', shopController.addShop);

router.get('/shops', shopController.seeAllShops);

module.exports = router;

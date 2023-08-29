// 유저에 관련된 API
const express = require('express');
const router = express.Router();
const shopController = require('../database/controllers/ShopController');
const { upload } = require('../utils/uploads');

router.post('/create', upload.single('image'), shopController.addShop);

router.get('/shops', shopController.seeAllShops);

router.get('/detail', shopController.seeShopDetail);

router.get(`/shopsByLocation`, shopController.seeRecommendedByLocationShops);

module.exports = router;

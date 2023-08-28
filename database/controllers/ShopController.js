const { Shop } = require('../models');

// 카페 샵 신규 등록
const addShop = async (req, res) => {
  const shopInfo = {
    ...req.body,
  };

  const shop = await Shop.create(shopInfo).catch((err) => console.log(err));
  res.status(200).send(shop);
};

// 카페 샵 목록 조회
const seeAllShops = async (req, res) => {
  const shop = await Shop.findAll().catch((err) => console.log(err));
  res.status(200).send(shop);
};

module.exports = {
  addShop,
  seeAllShops,
};

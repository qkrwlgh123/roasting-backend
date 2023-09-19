const { Shop, Sequelize } = require('../models');

const { User } = require('../models');
const { Review } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const TOKEN_KEY = process.env.AUTH_SECRET_KEY;

// 카페 샵 신규 등록
const addShop = async (req, res) => {
  try {
    // 헤더에 담긴 토큰을 이용하여 사용자 인증
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: '인증되지 않음' });
    }
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, TOKEN_KEY);
    const userId = Number(decoded.id);
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: '인증되지 않음' });
    }
    // 업로드된 파일 처리
    const urls = req.files;

    // 전송된 데이터 처리
    const dataObject = JSON.parse(req.body.data);

    const shop = await Shop.create(dataObject).catch((err) => console.log(err));
    const imagesArr = [];
    urls.forEach((current) => {
      imagesArr.push(current.location);
    });
    const stringifiedImgArr = JSON.stringify(imagesArr);

    await Shop.update(
      { images: stringifiedImgArr, userId: user.id },
      { where: { id: shop.id } }
    );
    res.status(201).send(shop);
  } catch (err) {
    console.log(err);
  }
};

// 단일 카페 샵 정보 조회
const seeShopDetail = async (req, res) => {
  try {
    const shopId = req.query.id;
    const shop = await Shop.findOne({
      where: {
        id: shopId,
      },
    });
    // 헤더에 담긴 토큰을 이용하여 작성자인지 확인
    let isCreator = false;
    let token = req.headers?.authorization;

    if (token && token.split(' ')[1] !== 'null') {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, TOKEN_KEY);
      const userId = Number(decoded.id);
      const user = await User.findByPk(userId);
      user.id === shop.userId && (isCreator = true);
    }

    shop.images = JSON.parse(shop.images);
    shop.menu = JSON.parse(shop.menu);
    shop.keywords = JSON.parse(shop.keywords);
    shop.isCreator = isCreator;
    res.status(200).send(shop);
  } catch (err) {
    console.log(err);
  }
};

// 카페 샵 전체 목록 조회
const seeAllShops = async (req, res) => {
  const shop = await Shop.findAll().catch((err) => console.log(err));
  const parsedShop = shop.map((item) => ({
    ...item.dataValues,
    images: JSON.parse(item.images), // 이미지 배열을 파싱하여 다시 배열로 변환
    keywords: JSON.parse(item.keywords),
  }));
  res.status(200).send(parsedShop);
};

// 내가 등록한 카페 리스트 조회
const seeMyShops = async (req, res) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: '인증되지 않음' });
    }
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, TOKEN_KEY);
    const userId = Number(decoded.id);
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: '인증되지 않음' });
    }
    const shop = await Shop.findAll({
      where: { userId: user.id },
      include: [{ model: Review, as: 'shop_review' }],
    });
    const parsedShop = shop.map((item) => ({
      ...item.dataValues,
      images: JSON.parse(item.images), // 이미지 배열을 파싱하여 다시 배열로 변환
      keywords: JSON.parse(item.keywords),
      isCreator: item.userId === user.id ? true : false,
    }));
    res.status(200).send(parsedShop);
  } catch (err) {
    console.log(err);
  }
};

// 전달받은 위도, 경도를 이용하여 반경 1km 이내 커피샵 목록 조회
const seeRecommendedByLocationShops = async (req, res) => {
  // const shop = await Shop.findAll().catch((err) => console.log(err));

  const currentLat = req.query.latitude;
  const currentLong = req.query.longitude;
  const haversineDistance = (curLat, curLong, shopLat, shopLong) => {
    const degToRad = (deg) => {
      return deg * (Math.PI / 180);
    };
    const R = 6371; // 지구의 반지름 (단위: km)

    const dLat = degToRad(shopLat - curLat);
    const dLon = degToRad(shopLong - curLong);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(curLat)) *
        Math.cos(degToRad(shopLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // 거리 (단위: km)
    return distance;
  };

  const shops = await Shop.findAll();

  const calculatedDistanceShops = shops.map((shop) => {
    const shopLat = shop.latitude;
    const shopLong = shop.longitude;

    const distance = haversineDistance(
      currentLat,
      currentLong,
      shopLat,
      shopLong
    );

    return {
      ...shop.dataValues,
      images: JSON.parse(shop.images),
      keywords: JSON.parse(shop.keywords),
      distance,
    };
  });

  const filteredDistanceShop = calculatedDistanceShops.filter((shop) => {
    return shop.distance <= 3;
  });

  res.status(200).send(filteredDistanceShop);
};

// 카페 또는 지역 검색 함수
const searchByKeyword = async (req, res) => {
  const { keyword } = req.query;

  try {
    // 작성자가 작성한 게시물인지 확인
    let token = req.headers?.authorization;
    let userId;
    if (token && token.split(' ')[1] !== 'null') {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, TOKEN_KEY);
      userId = Number(decoded.id);
    }

    const result = await Shop.findAll({
      where: {
        [Sequelize.Op.or]: [
          { shopName: { [Sequelize.Op.iLike]: `%${keyword}%` } },
          { roadAddress: { [Sequelize.Op.iLike]: `%${keyword}%` } },
          { parcelAddress: { [Sequelize.Op.iLike]: `%${keyword}%` } },
        ],
      },
      include: [{ model: Review, as: 'shop_review' }],
    });
    const parsedShop = result.map((item) => ({
      ...item.dataValues,
      images: JSON.parse(item.images), // 이미지 배열을 파싱하여 다시 배열로 변환
      keywords: JSON.parse(item.keywords),
      isCreator: Number(item.userId) === userId ? true : false,
    }));
    res.status(200).send(parsedShop);
  } catch (err) {
    res.status(500).send('서버 에러');
  }
};

module.exports = {
  addShop,
  seeShopDetail,
  seeAllShops,
  seeMyShops,
  seeRecommendedByLocationShops,
  searchByKeyword,
};

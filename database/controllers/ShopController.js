const { Shop, Sequelize } = require('../models');

// 카페 샵 신규 등록 - Create
const addShop = async (req, res) => {
  try {
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
      { images: stringifiedImgArr },
      { where: { id: shop.id } }
    );
    res.status(201).send(shop);
  } catch (err) {
    console.log(err);
  }
};

// 단일 카페 샵 정보 조회 - Read
const seeShopDetail = async (req, res) => {
  try {
    const shopId = req.query.id;
    const shop = await Shop.findOne({
      where: {
        id: shopId,
      },
    });
    shop.images = JSON.parse(shop.images);
    shop.menu = JSON.parse(shop.menu);
    shop.keywords = JSON.parse(shop.keywords);
    res.status(200).send(shop);
  } catch (err) {
    console.log(err);
  }
};

// 카페 샵 전체 목록 조회 - Read
const seeAllShops = async (req, res) => {
  const shop = await Shop.findAll().catch((err) => console.log(err));
  const parsedShop = shop.map((item) => ({
    ...item.dataValues,
    images: JSON.parse(item.images), // 이미지 배열을 파싱하여 다시 배열로 변환
    keywords: JSON.parse(item.keywords),
  }));
  res.status(200).send(parsedShop);
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
    const result = await Shop.findAll({
      where: {
        [Sequelize.Op.or]: [
          { shopName: { [Sequelize.Op.iLike]: `%${keyword}%` } },
          { roadAddress: { [Sequelize.Op.iLike]: `%${keyword}%` } },
          { parcelAddress: { [Sequelize.Op.iLike]: `%${keyword}%` } },
        ],
      },
    });
    const parsedShop = result.map((item) => ({
      ...item.dataValues,
      images: JSON.parse(item.images), // 이미지 배열을 파싱하여 다시 배열로 변환
      keywords: JSON.parse(item.keywords),
    }));
    res.status(200).send(parsedShop);
    // case 1 +  case 2 + case 3 데이터 전송하기
  } catch (err) {
    res.status(500).send('서버 에러');
  }
};

module.exports = {
  addShop,
  seeShopDetail,
  seeAllShops,
  seeRecommendedByLocationShops,
  searchByKeyword,
};

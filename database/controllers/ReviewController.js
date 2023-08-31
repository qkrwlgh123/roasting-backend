const { Review } = require('../models');
const { Shop } = require('../models');
const { User } = require('../models');

// 후기 등록
const addReview = async (req, res) => {
  try {
    const { content, rate, userId, shopId } = req.body;

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    const createdReview = await Review.create({ content, rate });

    await createdReview.update({
      username: user.username,
      profileImage: user.profileImage,
      userId,
      shopId,
    });

    const shop = await Shop.findOne({
      where: {
        id: shopId,
      },
      include: {
        model: Review,
        as: 'shop_review',
      },
    });

    const shopsReviews = shop.get('shop_review');

    // 모든 리뷰들의 평점 합
    const accumulatedRate = shopsReviews.reduce(
      (accumulator, currentValue) => accumulator + currentValue.dataValues.rate,
      0
    );
    // shopId에 해당하는 Shop이 가지고 있는 후기를 쓴 유저 수 불러오기 = n
    const shopsReviewsLength = shopsReviews.length;

    // review의 rate 컬럼에 (accmulated rate / n) 값 업데이트하기
    await shop.update({
      rate: accumulatedRate / shopsReviewsLength,
    });

    // 후기 작성 사람 수 +1
    await shop.increment('participants', { by: 1 });

    res.status(201).send('리뷰 등록 성공');
  } catch (err) {
    res.status(500).send('서버 에러');
  }
};

// 후기 목록 조회
const seeReviews = async (req, res) => {
  try {
    const { shopId } = req.query;
    const shop = await Shop.findOne({
      where: {
        id: shopId,
      },
      include: {
        model: Review,
        as: 'shop_review',
      },
    });
    const reviewList = shop.get('shop_review');

    res.status(200).send(reviewList);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addReview,
  seeReviews,
};

const { Review } = require('../models');
const { Shop } = require('../models');
const { User } = require('../models');
const { Answer } = require('../models');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const TOKEN_KEY = process.env.AUTH_SECRET_KEY;

// 후기 등록 - Create
const addReview = async (req, res) => {
  try {
    const { content, rate, shopId } = req.body;

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

    const createdReview = await Review.create({ content, rate });

    await createdReview.update({
      username: user.username,
      profileImage: user.profileImage,
      userId: user.id,
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

    // shop의 rate 컬럼에 (accmulated rate / n) 값 업데이트하기
    // shop의 firstReview 컬럼에 방금 만든 리뷰 content 등록하기
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

// 후기 목록 조회 - Read
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
    // 1. reviewList forEach 메서드 => 위에꺼처럼 findOne 메서드로 Answer모델 데이터 찾기
    // 2. reviewList의 forEach 메서드로 "answer" key 값에 answewr 모델의 데이터 value로 설정하기
    for (const review of reviewList) {
      const reviewId = review.dataValues.id;
      const reviewAnswer = await Answer.findOne({
        where: {
          reviewId,
        },
      });
      review.dataValues.answer = reviewAnswer?.dataValues;
    }
    res.status(200).send(reviewList);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addReview,
  seeReviews,
};

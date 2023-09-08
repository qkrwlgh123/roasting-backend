const { Answer } = require('../models');
const { Review } = require('../models');

// 후기 답변 등록 - Create
const addAnswer = async (req, res) => {
  try {
    const { reviewId, content } = req.body;
    const review = await Review.findOne({
      where: {
        id: reviewId,
      },
    });
    const createdAnswer = await Answer.create({
      content,
    });
    await createdAnswer.setReview(review);
    res.status(201).send('성공적으로 등록되었습니다.');
  } catch (err) {
    res.status(500).send('서버 에러');
  }
};

module.exports = {
  addAnswer,
};

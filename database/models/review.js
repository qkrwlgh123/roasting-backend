'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // User : Review = 1 : N , Shop : Review = 1 : N
    static associate(models) {
      // define association here
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user_review',
      });
      Review.belongsTo(models.Shop, {
        foreignKey: 'shopId',
        as: 'shop_review',
      });
      Review.hasOne(models.Answer, {
        foreignKey: 'reviewId', // Answer 모델에서 Review 모델을 참조하기 위한 외래 키
        onDelete: 'CASCADE', // Review 모델이 삭제될 때 연결된 Answer 모델도 삭제
        onUpdate: 'CASCADE', // Review 모델이 업데이트될 때 연결된 Answer 모델도 업데이트
      });
    }
  }
  Review.init(
    {
      username: DataTypes.STRING,
      profileImage: DataTypes.STRING,
      content: DataTypes.TEXT,
      rate: DataTypes.FLOAT,
      userId: DataTypes.BIGINT,
      shopId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );
  return Review;
};

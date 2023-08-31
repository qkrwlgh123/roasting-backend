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
    }
  }
  Review.init(
    {
      username: DataTypes.STRING,
      profileImage: DataTypes.STRING,
      content: DataTypes.STRING,
      rate: DataTypes.FLOAT,
      userId: DataTypes.INTEGER,
      shopId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );
  return Review;
};

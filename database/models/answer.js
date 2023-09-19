'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // User : Review = 1 : N , Shop : Review = 1 : N
    static associate(models) {
      // define association here
      Answer.belongsTo(models.Review, {
        foreignKey: 'reviewId', // Review 모델을 참조하는 외래 키
      });
    }
  }
  Answer.init(
    {
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Answer',
    }
  );
  return Answer;
};

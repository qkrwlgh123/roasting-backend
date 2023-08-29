'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Shop.init({
    shopName: DataTypes.STRING,
    description: DataTypes.STRING,
    desertType: DataTypes.STRING,
    roadAddress: DataTypes.STRING,
    parcelAddress: DataTypes.STRING,
    telNumber: DataTypes.STRING,
    priceRange: DataTypes.STRING,
    parkingType: DataTypes.STRING,
    openTime: DataTypes.STRING,
    breakTime: DataTypes.STRING,
    holiday: DataTypes.STRING,
    rate: DataTypes.FLOAT,
    images: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    website: DataTypes.STRING,
    menu: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Shop',
  });
  return Shop;
};
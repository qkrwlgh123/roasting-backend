require('dotenv').config();
const env = process.env;

const development = {
  username: env.SEQUELIZE_USERNAM,
  password: env.SEQUELIZED_DEV_PASSWORD,
  database: env.SEQUELIZE_DEV_DATABASE,
  host: env.SEQUELIZE_HOST,
  dialect: env.SEQUELIZE_DIALECT,
};

const test = {
  username: env.SEQUELIZE_USERNAME,
  password: env.SEQUELIZED_DEV_PASSWORD,
  database: env.SEQUELIZE_DEV_DATABASE,
  host: env.SEQUELIZE_HOST,
  dialect: env.SEQUELIZE_DIALECT,
};

const production = {
  username: env.SEQUELIZE_USERNAME,
  password: env.SEQUELIZED_DEV_PASSWORD,
  host: env.SEQUELIZE_HOST,
  connection: env.SEQUELIZE_HOST_DB_URL,
  dialect: env.SEQUELIZE_DIALECT,
};

module.exports = { development, test, production };

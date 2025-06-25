require('dotenv').config();

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY,
  DB_URI: process.env.MONGODB_URI,
};

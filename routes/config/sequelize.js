const Sequelize = require("sequelize");

const sequelize = new Sequelize("fees_collection", "root", "", {
  host: "localhost",
  dialect: "mysql",
  // Additional options as needed
});

module.exports = sequelize;

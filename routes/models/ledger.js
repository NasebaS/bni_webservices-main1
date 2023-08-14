const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize"); 

const Ledger = sequelize.define("ledger_master", {
  ledger_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ledger_name: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  ledger_type: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    // allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    // allowNull: false,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  modified_by: {
    type: DataTypes.INTEGER,
    // allowNull: true,
  },
  modified_at: {
    type: DataTypes.DATE,
    // allowNull: true,
  },
});

module.exports = Ledger;

const { DataTypes } = require('sequelize');
const sequelize = require('../db');



const CaptchaConfig = sequelize.define('CaptchaConfig', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  updateInterval: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = CaptchaConfig;

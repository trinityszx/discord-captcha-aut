const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // ajuste se o caminho for diferente

const UserInfo = sequelize.define('UserInfo', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discriminator: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAtDiscord: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isBot: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = UserInfo;

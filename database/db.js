// database/db.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Conexão com o banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false, // Desativa logs de SQL (para produção)
});

module.exports = sequelize;

const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost:5432/zior_db', { logging: false });

module.exports = db;

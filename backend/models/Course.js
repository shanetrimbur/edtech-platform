// models/Course.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  educatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Course;

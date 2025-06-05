const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'danger', 'success'),
    allowNull: false,
    defaultValue: 'info'
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  relatedSection: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  paranoid: true
});

module.exports = Notification;
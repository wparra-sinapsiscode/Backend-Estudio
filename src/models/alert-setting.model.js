const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AlertSetting = sequelize.define('AlertSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstAlert: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      min: 1,
      max: 30
    }
  },
  secondAlert: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 30
    }
  },
  emailAlerts: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  systemAlerts: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'alert_settings',
  timestamps: true,
  paranoid: true
});

module.exports = AlertSetting;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanySetting = sequelize.define('CompanySetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  ruc: {
    type: DataTypes.STRING(11),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [11, 11]
    }
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
}, {
  tableName: 'company_settings',
  timestamps: true,
  paranoid: true
});

module.exports = CompanySetting;
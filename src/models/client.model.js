const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
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
    unique: true,
    validate: {
      notEmpty: true,
      len: [11, 11] // RUC en Perú tiene 11 dígitos
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
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo'
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'clients',
  timestamps: true, // Crea createdAt y updatedAt
  paranoid: true    // Soft delete (deletedAt)
});

module.exports = Client;
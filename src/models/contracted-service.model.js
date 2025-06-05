const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContractedService = sequelize.define('ContractedService', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    },
    field: 'client_id'
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    },
    field: 'service_id'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  nextPayment: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('activo', 'pendiente', 'alerta'),
    allowNull: false,
    defaultValue: 'activo'
  },
  invoiceDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  billingAlertSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'contracted_services',
  timestamps: true,
  paranoid: true
});

module.exports = ContractedService;
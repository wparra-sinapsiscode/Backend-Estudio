const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CollectionTracking = sequelize.define('CollectionTracking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entityType: {
    type: DataTypes.ENUM('invoice', 'contracted_service'),
    allowNull: false,
    comment: 'Tipo de entidad (factura o servicio contratado)'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID de la factura o servicio contratado'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  actionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de la acción'
  },
  actionType: {
    type: DataTypes.ENUM('llamada', 'email', 'visita', 'whatsapp', 'carta', 'otro'),
    allowNull: false,
    comment: 'Tipo de acción realizada'
  },
  actionDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción de lo que se hizo'
  },
  contactMade: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si se logró contactar con el cliente'
  },
  clientResponse: {
    type: DataTypes.TEXT,
    comment: 'Respuesta o compromiso del cliente'
  },
  nextActionDate: {
    type: DataTypes.DATE,
    comment: 'Fecha para próximo seguimiento'
  },
  nextActionNotes: {
    type: DataTypes.TEXT,
    comment: 'Notas sobre qué hacer en el próximo contacto'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que realizó la acción'
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_progreso', 'promesa_pago', 'pagado', 'sin_respuesta', 'rechazado'),
    defaultValue: 'pendiente',
    comment: 'Estado actual del seguimiento'
  },
  promiseDate: {
    type: DataTypes.DATE,
    comment: 'Fecha de promesa de pago si aplica'
  },
  promiseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Monto prometido si aplica'
  }
}, {
  tableName: 'collection_trackings',
  timestamps: true,
  indexes: [
    {
      fields: ['entityType', 'entityId']
    },
    {
      fields: ['clientId']
    },
    {
      fields: ['actionDate']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = CollectionTracking;
// Importar modelos
const User = require('./user.model');
const Client = require('./client.model');
const Service = require('./service.model');
const ContractedService = require('./contracted-service.model');
const Invoice = require('./invoice.model');
const Notification = require('./notification.model');
const CompanySetting = require('./company-setting.model');
const AlertSetting = require('./alert-setting.model');
const CollectionTracking = require('./collection-tracking.model');

// Definir asociaciones entre modelos
const setupAssociations = () => {
  // Relaciones Client
  Client.hasMany(ContractedService, { 
    foreignKey: 'clientId',
    as: 'contractedServices'
  });
  Client.hasMany(Invoice, { 
    foreignKey: 'clientId',
    as: 'invoices'
  });

  // Relaciones Service
  Service.hasMany(ContractedService, { 
    foreignKey: 'serviceId',
    as: 'contractedInstances'
  });
  Service.hasMany(Invoice, { 
    foreignKey: 'serviceId',
    as: 'invoices'
  });

  // Relaciones ContractedService
  ContractedService.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client'
  });
  ContractedService.belongsTo(Service, {
    foreignKey: 'serviceId',
    as: 'service'
  });

  // Relaciones Invoice
  Invoice.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client'
  });
  Invoice.belongsTo(Service, {
    foreignKey: 'serviceId',
    as: 'service'
  });
  
  // Relaciones Notification (para entidades asociadas)
  // Las notificaciones pueden estar relacionadas con diferentes entidades
  // como facturas, servicios contratados, etc.
  Notification.belongsTo(Invoice, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'invoice',
    scope: {
      entityType: 'invoice'
    }
  });
  
  Notification.belongsTo(ContractedService, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'contractedService',
    scope: {
      entityType: 'contracted_service'
    }
  });

  // Relaciones CollectionTracking
  CollectionTracking.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client'
  });
  
  CollectionTracking.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  // Relación polimórfica con Invoice
  CollectionTracking.belongsTo(Invoice, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'invoice',
    scope: {
      entityType: 'invoice'
    }
  });
  
  // Relación polimórfica con ContractedService
  CollectionTracking.belongsTo(ContractedService, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'contractedService',
    scope: {
      entityType: 'contracted_service'
    }
  });
  
  // Relaciones inversas
  Client.hasMany(CollectionTracking, {
    foreignKey: 'clientId',
    as: 'collectionTrackings'
  });
  
  Invoice.hasMany(CollectionTracking, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'trackings',
    scope: {
      entityType: 'invoice'
    }
  });
  
  ContractedService.hasMany(CollectionTracking, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'trackings',
    scope: {
      entityType: 'contracted_service'
    }
  });
};

module.exports = {
  User,
  Client,
  Service,
  ContractedService,
  Invoice,
  Notification,
  CompanySetting,
  AlertSetting,
  CollectionTracking,
  setupAssociations
};
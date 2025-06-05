const { CollectionTracking, Client, Invoice, ContractedService, User } = require('../models');
const { Op } = require('sequelize');

// Obtener historial de seguimiento para una entidad específica
exports.getTrackingHistory = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const trackings = await CollectionTracking.findAll({
      where: {
        entityType,
        entityId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'ruc']
        }
      ],
      order: [['actionDate', 'DESC']]
    });

    res.json({
      success: true,
      data: trackings
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de seguimiento'
    });
  }
};

// Crear nuevo registro de seguimiento
exports.createTracking = async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      clientId,
      actionType,
      actionDescription,
      contactMade,
      clientResponse,
      nextActionDate,
      nextActionNotes,
      status,
      promiseDate,
      promiseAmount
    } = req.body;

    // Validar que la entidad existe
    let entity;
    if (entityType === 'invoice') {
      entity = await Invoice.findByPk(entityId);
    } else if (entityType === 'contracted_service') {
      entity = await ContractedService.findByPk(entityId);
    }

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entidad no encontrada'
      });
    }

    const tracking = await CollectionTracking.create({
      entityType,
      entityId,
      clientId,
      actionDate: new Date(),
      actionType,
      actionDescription,
      contactMade,
      clientResponse,
      nextActionDate,
      nextActionNotes,
      userId: req.user.id,
      status,
      promiseDate,
      promiseAmount
    });

    // Cargar datos relacionados
    const trackingWithRelations = await CollectionTracking.findByPk(tracking.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'ruc']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: trackingWithRelations
    });
  } catch (error) {
    console.error('Error creando seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear registro de seguimiento'
    });
  }
};

// Obtener seguimientos pendientes por usuario
exports.getPendingTrackings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trackings = await CollectionTracking.findAll({
      where: {
        userId: req.user.id,
        nextActionDate: {
          [Op.lte]: today
        },
        status: {
          [Op.notIn]: ['pagado', 'rechazado']
        }
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'ruc', 'phone', 'email']
        }
      ],
      order: [['nextActionDate', 'ASC']]
    });

    res.json({
      success: true,
      data: trackings
    });
  } catch (error) {
    console.error('Error obteniendo seguimientos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener seguimientos pendientes'
    });
  }
};

// Obtener resumen de seguimientos por cliente
exports.getClientTrackingSummary = async (req, res) => {
  try {
    const { clientId } = req.params;

    const trackings = await CollectionTracking.findAll({
      where: { clientId },
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: ['id', 'number', 'amount', 'status']
        },
        {
          model: ContractedService,
          as: 'contractedService',
          attributes: ['id', 'price', 'status']
        }
      ],
      order: [['actionDate', 'DESC']],
      limit: 10
    });

    const summary = {
      totalContacts: trackings.length,
      successfulContacts: trackings.filter(t => t.contactMade).length,
      lastContact: trackings[0]?.actionDate || null,
      pendingPromises: trackings.filter(t => 
        t.status === 'promesa_pago' && 
        t.promiseDate && 
        new Date(t.promiseDate) > new Date()
      ).length
    };

    res.json({
      success: true,
      data: {
        summary,
        recentTrackings: trackings
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de seguimientos'
    });
  }
};
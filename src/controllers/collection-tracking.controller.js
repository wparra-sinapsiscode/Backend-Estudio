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
    console.log('🔍 BACKEND - Petición recibida en createTracking');
    console.log('🔍 BACKEND - Headers:', req.headers);
    console.log('🔍 BACKEND - Body completo:', req.body);
    console.log('🔍 BACKEND - Usuario autenticado:', req.user);

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

    console.log('🔍 BACKEND - Datos extraídos:', {
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
    });

    // Validar que la entidad existe
    console.log(`🔍 BACKEND - Verificando existencia de ${entityType} con ID ${entityId}`);
    let entity;
    if (entityType === 'invoice') {
      entity = await Invoice.findByPk(entityId);
      console.log('🔍 BACKEND - Factura encontrada:', !!entity);
    } else if (entityType === 'contracted_service') {
      entity = await ContractedService.findByPk(entityId);
      console.log('🔍 BACKEND - Servicio contratado encontrado:', !!entity);
    }

    if (!entity) {
      console.log('❌ BACKEND - Entidad no encontrada');
      return res.status(404).json({
        success: false,
        message: 'Entidad no encontrada'
      });
    }

    console.log('🔍 BACKEND - Preparando datos para crear tracking...');
    const trackingData = {
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
    };
    
    console.log('🔍 BACKEND - Datos finales para insertar:', trackingData);
    
    const tracking = await CollectionTracking.create(trackingData);
    console.log('✅ BACKEND - Tracking creado exitosamente:', tracking.id);

    // Cargar datos relacionados
    console.log('🔍 BACKEND - Cargando datos relacionados...');
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

    console.log('✅ BACKEND - Enviando respuesta exitosa');
    res.status(201).json({
      success: true,
      data: trackingWithRelations
    });
  } catch (error) {
    console.error('❌ BACKEND - Error completo:', error);
    console.error('❌ BACKEND - Error message:', error.message);
    console.error('❌ BACKEND - Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error al crear registro de seguimiento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
const { ContractedService, Client, Service } = require('../models');
const { Op } = require('sequelize');
const { createSystemNotification } = require('./notification.controller');

// Controlador para Servicios Contratados

/**
 * Crear un nuevo servicio contratado
 * @route POST /api/contracted-services
 */
const createContractedService = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { 
      clientId, 
      serviceId, 
      startDate, 
      nextPayment, 
      price, 
      status, 
      invoiceDays 
    } = req.body;

    // Validar datos requeridos
    if (!clientId || !serviceId || !startDate || !nextPayment || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios (clientId, serviceId, startDate, nextPayment, price)' 
      });
    }

    // Validar que el cliente exista
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el cliente con ID ${clientId}`
      });
    }

    // Validar que el servicio exista
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el servicio con ID ${serviceId}`
      });
    }

    // Validar precio
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número positivo'
      });
    }

    // Validar estado (opcional)
    const validStatus = ['activo', 'pendiente', 'alerta'];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser uno de: activo, pendiente, alerta'
      });
    }

    // Crear nuevo servicio contratado
    const newContractedService = await ContractedService.create({
      clientId,
      serviceId,
      startDate,
      nextPayment,
      price,
      status: status || 'activo',
      invoiceDays: invoiceDays || 0
    });

    // Cargar las relaciones para la respuesta
    const contractedServiceWithRelations = await ContractedService.findByPk(
      newContractedService.id,
      {
        include: [
          { model: Client, as: 'client' },
          { model: Service, as: 'service' }
        ]
      }
    );
    
    // Crear notificación del sistema
    await createSystemNotification({
      title: 'Nuevo Servicio Contratado',
      message: `El cliente ${contractedServiceWithRelations.client.name} ha contratado el servicio "${contractedServiceWithRelations.service.name}" por un monto de ${price}`,
      type: 'success',
      relatedSection: 'contracted_services',
      relatedId: newContractedService.id
    });

    // Responder con el servicio contratado creado
    return res.status(201).json({
      success: true,
      data: contractedServiceWithRelations,
      message: 'Servicio contratado creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear servicio contratado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el servicio contratado',
      error: error.message
    });
  }
};

/**
 * Obtener todos los servicios contratados
 * @route GET /api/contracted-services
 */
const getAllContractedServices = async (req, res) => {
  try {
    // Parámetros de consulta opcionales
    const { clientId, serviceId, status } = req.query;
    let whereClause = {};

    // Filtrar por cliente si se proporciona
    if (clientId) {
      whereClause.clientId = clientId;
    }

    // Filtrar por servicio si se proporciona
    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    // Filtrar por estado si se proporciona
    if (status) {
      whereClause.status = status;
    }

    // Obtener servicios contratados con opciones de filtrado e incluyendo relaciones
    const contractedServices = await ContractedService.findAll({
      where: whereClause,
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ],
      order: [['nextPayment', 'ASC']] // Ordenar por próximo pago
    });

    return res.status(200).json({
      success: true,
      count: contractedServices.length,
      data: contractedServices
    });
  } catch (error) {
    console.error('Error al obtener servicios contratados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de servicios contratados',
      error: error.message
    });
  }
};

/**
 * Obtener un servicio contratado por su ID
 * @route GET /api/contracted-services/:id
 */
const getContractedServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio contratado inválido'
      });
    }

    // Buscar servicio contratado por ID incluyendo relaciones
    const contractedService = await ContractedService.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    // Verificar si el servicio contratado existe
    if (!contractedService) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el servicio contratado con ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: contractedService
    });
  } catch (error) {
    console.error(`Error al obtener servicio contratado con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el servicio contratado',
      error: error.message
    });
  }
};

/**
 * Actualizar un servicio contratado existente
 * @route PUT /api/contracted-services/:id
 */
const updateContractedService = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      clientId, 
      serviceId, 
      startDate, 
      nextPayment, 
      price, 
      status, 
      invoiceDays 
    } = req.body;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio contratado inválido'
      });
    }

    // Buscar servicio contratado por ID con relaciones
    const contractedService = await ContractedService.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    // Verificar si el servicio contratado existe
    if (!contractedService) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el servicio contratado con ID ${id}`
      });
    }

    // Si se está actualizando el cliente, verificar que exista
    let updatedClient = contractedService.client;
    if (clientId && clientId !== contractedService.clientId) {
      updatedClient = await Client.findByPk(clientId);
      if (!updatedClient) {
        return res.status(404).json({
          success: false,
          message: `No se encontró el cliente con ID ${clientId}`
        });
      }
    }

    // Si se está actualizando el servicio, verificar que exista
    let updatedService = contractedService.service;
    if (serviceId && serviceId !== contractedService.serviceId) {
      updatedService = await Service.findByPk(serviceId);
      if (!updatedService) {
        return res.status(404).json({
          success: false,
          message: `No se encontró el servicio con ID ${serviceId}`
        });
      }
    }

    // Validar precio si se proporciona
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número positivo'
      });
    }

    // Validar estado si se proporciona
    const validStatus = ['activo', 'pendiente', 'alerta'];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser uno de: activo, pendiente, alerta'
      });
    }

    // Detectar cambios para notificaciones y control de alertas
    const isStatusChanged = status && status !== contractedService.status;
    const previousStatus = contractedService.status;
    const isNextPaymentChanged = nextPayment && new Date(nextPayment).getTime() !== new Date(contractedService.nextPayment).getTime();
    
    // Preparar campos a actualizar
    const updateFields = {
      clientId: clientId || contractedService.clientId,
      serviceId: serviceId || contractedService.serviceId,
      startDate: startDate || contractedService.startDate,
      nextPayment: nextPayment || contractedService.nextPayment,
      price: price !== undefined ? price : contractedService.price,
      status: status || contractedService.status,
      invoiceDays: invoiceDays !== undefined ? invoiceDays : contractedService.invoiceDays
    };
    
    // Si cambia la fecha de próximo pago, reiniciar el marcador de alerta
    if (isNextPaymentChanged) {
      updateFields.billingAlertSent = false;
    }
    
    // Actualizar servicio contratado
    await contractedService.update(updateFields);

    // Generar notificación si cambió el estado
    if (isStatusChanged) {
      // Formatear monto para la notificación
      const formattedPrice = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(contractedService.price);
      
      let notificationType, notificationTitle, notificationMessage;
      
      if (status === 'activo' && previousStatus !== 'activo') {
        notificationType = 'success';
        notificationTitle = 'Servicio Activado';
        notificationMessage = `El servicio "${updatedService.name}" del cliente ${updatedClient.name} ha sido activado con un costo de ${formattedPrice}`;
      } else if (status === 'alerta') {
        notificationType = 'warning';
        notificationTitle = 'Servicio en Alerta';
        notificationMessage = `El servicio "${updatedService.name}" del cliente ${updatedClient.name} ha sido marcado en estado de alerta`;
      } else if (status === 'pendiente') {
        notificationType = 'info';
        notificationTitle = 'Servicio en Espera';
        notificationMessage = `El servicio "${updatedService.name}" del cliente ${updatedClient.name} ha sido marcado como pendiente`;
      }
      
      await createSystemNotification({
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        relatedSection: 'contracted_services',
        relatedId: contractedService.id
      });
    }

    // Cargar el servicio contratado actualizado con sus relaciones
    const updatedContractedService = await ContractedService.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    return res.status(200).json({
      success: true,
      data: updatedContractedService,
      message: 'Servicio contratado actualizado correctamente'
    });
  } catch (error) {
    console.error(`Error al actualizar servicio contratado con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el servicio contratado',
      error: error.message
    });
  }
};

/**
 * Eliminar un servicio contratado
 * @route DELETE /api/contracted-services/:id
 */
const deleteContractedService = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio contratado inválido'
      });
    }

    // Buscar servicio contratado por ID con relaciones para notificación
    const contractedService = await ContractedService.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    // Verificar si el servicio contratado existe
    if (!contractedService) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el servicio contratado con ID ${id}`
      });
    }

    // Crear notificación antes de eliminar
    await createSystemNotification({
      title: 'Servicio Cancelado',
      message: `El servicio "${contractedService.service.name}" del cliente ${contractedService.client.name} ha sido cancelado`,
      type: 'warning',
      relatedSection: 'contracted_services',
      relatedId: contractedService.id
    });

    // Eliminar servicio contratado (borrado lógico si paranoid: true)
    await contractedService.destroy();

    return res.status(200).json({
      success: true,
      message: 'Servicio contratado eliminado correctamente'
    });
  } catch (error) {
    console.error(`Error al eliminar servicio contratado con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el servicio contratado',
      error: error.message
    });
  }
};

module.exports = {
  createContractedService,
  getAllContractedServices,
  getContractedServiceById,
  updateContractedService,
  deleteContractedService
};
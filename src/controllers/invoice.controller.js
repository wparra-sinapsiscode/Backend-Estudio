const { Invoice, Client, Service } = require('../models');
const { Op } = require('sequelize');
const { createSystemNotification } = require('./notification.controller');

// Controlador para Facturas/Proformas

/**
 * Crear una nueva factura/proforma
 * @route POST /api/invoices
 */
const createInvoice = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { 
      number, 
      clientId, 
      serviceId, 
      issueDate, 
      dueDate, 
      amount, 
      status, 
      document,
      documentType,
      paidAmount,
      payments
    } = req.body;

    // Validar datos requeridos
    if (!number || !clientId || !serviceId || !issueDate || !dueDate || amount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios (number, clientId, serviceId, issueDate, dueDate, amount)' 
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

    // Validar número de documento único
    const existingInvoice = await Invoice.findOne({ where: { number } });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una factura/proforma con el número ${number}`
      });
    }

    // Validar monto
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un número positivo mayor que cero'
      });
    }

    // Validar fechas
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
    
    const issueDateObj = new Date(issueDate);
    issueDateObj.setHours(0, 0, 0, 0);
    
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    
    if (issueDateObj > currentDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de emisión no puede ser posterior a hoy'
      });
    }
    
    if (dueDateObj <= issueDateObj) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de vencimiento debe ser posterior a la fecha de emisión'
      });
    }

    // Validar tipo de documento
    const validDocumentTypes = ['factura', 'rhe'];
    if (documentType && !validDocumentTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de documento debe ser "factura" o "rhe"'
      });
    }

    // Validar estado
    const validStatus = ['pendiente', 'pagada', 'vencida'];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser uno de: pendiente, pagada, vencida'
      });
    }

    // Crear nueva factura/proforma
    const newInvoice = await Invoice.create({
      number,
      clientId,
      serviceId,
      issueDate,
      dueDate,
      amount,
      status: status || 'pendiente',
      document: document || null,
      documentType: documentType || 'factura',
      paidAmount: paidAmount || 0,
      payments: payments || []
    });

    // Cargar las relaciones para la respuesta
    const invoiceWithRelations = await Invoice.findByPk(
      newInvoice.id,
      {
        include: [
          { model: Client, as: 'client' },
          { model: Service, as: 'service' }
        ]
      }
    );
    
    // Crear notificación del sistema
    await createSystemNotification({
      title: 'Nueva Factura/Proforma Creada',
      message: `Se creó la factura ${number} para el cliente ${invoiceWithRelations.client.name}`,
      type: 'info',
      relatedSection: 'invoices',
      relatedId: newInvoice.id
    });

    // Responder con la factura/proforma creada
    return res.status(201).json({
      success: true,
      data: invoiceWithRelations,
      message: 'Factura/Proforma creada correctamente'
    });
  } catch (error) {
    console.error('Error al crear factura/proforma:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear la factura/proforma',
      error: error.message
    });
  }
};

/**
 * Obtener todas las facturas/proformas
 * @route GET /api/invoices
 */
const getAllInvoices = async (req, res) => {
  try {
    // Parámetros de consulta opcionales
    const { 
      clientId, 
      serviceId, 
      status, 
      startDate, 
      endDate,
      dateType = 'issueDate' // 'issueDate' o 'dueDate'
    } = req.query;
    
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
      const validStatuses = ['pendiente', 'pagada', 'vencida'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Los estados válidos son: pendiente, pagada, vencida'
        });
      }
      whereClause.status = status;
    }

    // Filtrar por rango de fechas si se proporciona
    if (startDate || endDate) {
      const dateField = dateType === 'dueDate' ? 'dueDate' : 'issueDate';
      whereClause[dateField] = {};
      
      if (startDate) {
        whereClause[dateField][Op.gte] = startDate;
      }
      
      if (endDate) {
        whereClause[dateField][Op.lte] = endDate;
      }
    }

    // Obtener facturas/proformas con opciones de filtrado e incluyendo relaciones
    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ],
      order: [['dueDate', 'ASC']] // Ordenar por fecha de vencimiento
    });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error al obtener facturas/proformas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de facturas/proformas',
      error: error.message
    });
  }
};

/**
 * Obtener una factura/proforma por su ID
 * @route GET /api/invoices/:id
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de factura/proforma inválido'
      });
    }

    // Buscar factura/proforma por ID incluyendo relaciones
    const invoice = await Invoice.findByPk(id, {
      include: [
        { 
          model: Client, 
          as: 'client',
          required: false // Permitir facturas sin cliente (LEFT JOIN)
        },
        { 
          model: Service, 
          as: 'service',
          required: false // Permitir facturas sin servicio (LEFT JOIN)
        }
      ]
    });
    
    // 🔍 DEBUG: Log para verificar qué se está devolviendo
    console.log('🔍 getInvoiceById - Invoice encontrada:', {
      id: invoice?.id,
      clientId: invoice?.clientId,
      serviceId: invoice?.serviceId,
      hasClient: !!invoice?.client,
      hasService: !!invoice?.service,
      clientData: invoice?.client ? { id: invoice.client.id, name: invoice.client.name } : null
    });

    // Verificar si la factura/proforma existe
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la factura/proforma con ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error(`Error al obtener factura/proforma con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la factura/proforma',
      error: error.message
    });
  }
};

/**
 * Actualizar una factura/proforma existente
 * @route PUT /api/invoices/:id
 */
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      number, 
      clientId, 
      serviceId, 
      issueDate, 
      dueDate, 
      amount, 
      status, 
      document,
      documentType
    } = req.body;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de factura/proforma inválido'
      });
    }

    // Buscar factura/proforma por ID
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    // Verificar si la factura/proforma existe
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la factura/proforma con ID ${id}`
      });
    }

    // Si se está actualizando el número, verificar que sea único
    if (number && number !== invoice.number) {
      const existingInvoice = await Invoice.findOne({ where: { number } });
      if (existingInvoice) {
        return res.status(400).json({
          success: false,
          message: `Ya existe una factura/proforma con el número ${number}`
        });
      }
    }

    // Si se está actualizando el cliente, verificar que exista
    if (clientId && clientId !== invoice.clientId) {
      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: `No se encontró el cliente con ID ${clientId}`
        });
      }
    }

    // Si se está actualizando el servicio, verificar que exista
    if (serviceId && serviceId !== invoice.serviceId) {
      const service = await Service.findByPk(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: `No se encontró el servicio con ID ${serviceId}`
        });
      }
    }

    // Si se está actualizando el monto, validar que sea positivo
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un número positivo mayor que cero'
      });
    }

    // Validar fechas si se proporcionan
    let issueDateObj = invoice.issueDate;
    let dueDateObj = invoice.dueDate;
    
    if (issueDate) {
      issueDateObj = new Date(issueDate);
      issueDateObj.setHours(0, 0, 0, 0);
      
      const currentDate = new Date();
      currentDate.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
      
      if (issueDateObj > currentDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de emisión no puede ser posterior a hoy'
        });
      }
    }
    
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);
    }
    
    if (issueDate || dueDate) {
      if (dueDateObj <= issueDateObj) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de vencimiento debe ser posterior a la fecha de emisión'
        });
      }
    }

    // Validar tipo de documento si se proporciona
    if (documentType) {
      const validDocumentTypes = ['factura', 'rhe'];
      if (!validDocumentTypes.includes(documentType)) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de documento debe ser "factura" o "rhe"'
        });
      }
    }

    // Validar estado si se proporciona
    if (status) {
      const validStatus = ['pendiente', 'pagada', 'vencida'];
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'El estado debe ser uno de: pendiente, pagada, vencida'
        });
      }
    }

    // Detectar si hay cambio de estado de 'pendiente' a 'pagada'
    const isStatusChangeToPayment = invoice.status === 'pendiente' && status === 'pagada';
    
    // Detectar cambios que afectan a las alertas
    const isDueDateChanged = dueDate && new Date(dueDate).getTime() !== new Date(invoice.dueDate).getTime();
    const isStatusChanged = status && status !== invoice.status;
    
    // Preparar los campos a actualizar
    const updateFields = {
      number: number || invoice.number,
      clientId: clientId || invoice.clientId,
      serviceId: serviceId || invoice.serviceId,
      issueDate: issueDate || invoice.issueDate,
      dueDate: dueDate || invoice.dueDate,
      amount: amount !== undefined ? amount : invoice.amount,
      status: status || invoice.status,
      document: document !== undefined ? document : invoice.document,
      documentType: documentType || invoice.documentType
    };
    
    // Si cambia la fecha de vencimiento o el estado, reiniciar los marcadores de alerta
    if (isDueDateChanged || isStatusChanged) {
      updateFields.firstAlertSent = false;
      updateFields.secondAlertSent = false;
      updateFields.overdueAlertSent = false;
    }
    
    // Actualizar factura/proforma
    await invoice.update(updateFields);

    // Crear notificación si la factura cambia de pendiente a pagada
    if (isStatusChangeToPayment) {
      // Formatear monto para la notificación
      const formattedAmount = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(invoice.amount);

      await createSystemNotification({
        title: 'Factura Pagada',
        message: `La factura ${invoice.number} del cliente ${invoice.client.name} ha sido marcada como pagada por un monto de ${formattedAmount}`,
        type: 'success',
        relatedSection: 'invoices',
        relatedId: invoice.id
      });
    }

    // Cargar la factura/proforma actualizada con sus relaciones
    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    return res.status(200).json({
      success: true,
      data: updatedInvoice,
      message: 'Factura/Proforma actualizada correctamente'
    });
  } catch (error) {
    console.error(`Error al actualizar factura/proforma con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la factura/proforma',
      error: error.message
    });
  }
};

/**
 * Eliminar una factura/proforma
 * @route DELETE /api/invoices/:id
 */
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de factura/proforma inválido'
      });
    }

    // Buscar factura/proforma por ID
    const invoice = await Invoice.findByPk(id);

    // Verificar si la factura/proforma existe
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la factura/proforma con ID ${id}`
      });
    }

    // Verificar si la factura tiene pagos
    if (invoice.paidAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una factura/proforma que ya tiene pagos registrados'
      });
    }

    // Eliminar factura/proforma (borrado lógico si paranoid: true)
    await invoice.destroy();

    return res.status(200).json({
      success: true,
      message: 'Factura/Proforma eliminada correctamente'
    });
  } catch (error) {
    console.error(`Error al eliminar factura/proforma con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la factura/proforma',
      error: error.message
    });
  }
};

/**
 * Agregar un pago a una factura/proforma
 * @route POST /api/invoices/:id/payments
 */
const addPaymentToInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, method, voucher, notes } = req.body;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de factura/proforma inválido'
      });
    }

    // Validar datos requeridos
    if (!date || amount === undefined || !method) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (date, amount, method)'
      });
    }

    // Validar monto del pago
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto del pago debe ser un número positivo mayor que cero'
      });
    }

    // Validar método de pago
    const validMethods = ['efectivo', 'yape', 'plin', 'transferencia', 'tarjeta', 'otro'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'El método de pago debe ser uno de: efectivo, yape, plin, transferencia, tarjeta, otro'
      });
    }

    // Buscar factura/proforma por ID
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    // Verificar si la factura/proforma existe
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la factura/proforma con ID ${id}`
      });
    }

    // Verificar que el pago no exceda el monto pendiente
    const pendingAmount = invoice.amount - invoice.paidAmount;
    if (amount > pendingAmount) {
      return res.status(400).json({
        success: false,
        message: `El monto del pago (${amount}) excede el monto pendiente (${pendingAmount})`
      });
    }

    // Crear nuevo pago
    const newPayment = {
      id: invoice.payments.length > 0 ? Math.max(...invoice.payments.map(p => p.id)) + 1 : 1,
      date,
      amount,
      method,
      voucher: voucher || null,
      notes: notes || ""
    };

    // Actualizar array de pagos y monto pagado
    const updatedPayments = [...invoice.payments, newPayment];
    const updatedPaidAmount = parseFloat(invoice.paidAmount) + amount;
    
    // Determinar nuevo estado (convertir a números para comparación correcta)
    let newStatus = invoice.status;
    const totalAmount = parseFloat(invoice.amount);
    const isBecomingPaid = updatedPaidAmount >= totalAmount && invoice.status !== 'pagada';
    
    console.log('🔍 DEBUG Payment: Comparación de montos:', {
      updatedPaidAmount,
      totalAmount, 
      isBecomingPaid,
      currentStatus: invoice.status
    });
    
    if (isBecomingPaid) {
      newStatus = 'pagada';
      console.log('✅ DEBUG Payment: Cambiando estado a "pagada"');
    }

    // Preparar campos para actualizar
    const updateFields = {
      payments: updatedPayments,
      paidAmount: updatedPaidAmount,
      status: newStatus
    };
    
    // Si la factura pasa a pagada, reiniciar los marcadores de alerta
    if (isBecomingPaid) {
      updateFields.firstAlertSent = false;
      updateFields.secondAlertSent = false;
      updateFields.overdueAlertSent = false;
    }
    
    // Actualizar factura/proforma
    await invoice.update(updateFields);

    // Crear notificación si la factura cambia a pagada con este pago
    if (isBecomingPaid) {
      // Formatear monto para la notificación
      const formattedAmount = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(invoice.amount);

      await createSystemNotification({
        title: 'Factura Pagada Completamente',
        message: `La factura ${invoice.number} del cliente ${invoice.client.name} ha sido pagada completamente por un monto total de ${formattedAmount}`,
        type: 'success',
        relatedSection: 'invoices',
        relatedId: invoice.id
      });
    } else {
      // Notificación de pago parcial
      const formattedPayment = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(amount);
      
      const formattedRemaining = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(invoice.amount - updatedPaidAmount);

      await createSystemNotification({
        title: 'Pago Parcial Recibido',
        message: `Se ha registrado un pago de ${formattedPayment} para la factura ${invoice.number} del cliente ${invoice.client.name}. Monto pendiente: ${formattedRemaining}`,
        type: 'info',
        relatedSection: 'invoices',
        relatedId: invoice.id
      });
    }

    // Cargar la factura/proforma actualizada
    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' }
      ]
    });

    return res.status(200).json({
      success: true,
      data: updatedInvoice,
      message: 'Pago agregado correctamente',
      payment: newPayment
    });
  } catch (error) {
    console.error(`Error al agregar pago a factura/proforma con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al agregar el pago',
      error: error.message
    });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  addPaymentToInvoice
};
const { Client, Invoice } = require('../models');
const { Op } = require('sequelize');
const { createSystemNotification } = require('./notification.controller');
const { deleteClientFiles, cleanupInvoiceFiles } = require('../utils/fileCleanup');

// Controlador para Clientes

/**
 * Crear un nuevo cliente
 * @route POST /api/clients
 */
const createClient = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { name, ruc, phone, email, address, status, joinDate } = req.body;

    // Validar datos requeridos
    if (!name || !ruc || !phone || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios (nombre, RUC, teléfono, email)' 
      });
    }

    // Verificar si ya existe un cliente con el mismo RUC
    const existingClient = await Client.findOne({ where: { ruc } });
    if (existingClient) {
      return res.status(400).json({ 
        success: false, 
        message: `Ya existe un cliente con el RUC ${ruc}` 
      });
    }

    // Crear nuevo cliente
    const newClient = await Client.create({
      name,
      ruc,
      phone,
      email,
      address,
      status,
      joinDate
    });

    // Crear notificación del sistema
    await createSystemNotification({
      title: 'Nuevo Cliente Registrado',
      message: `Se ha registrado el cliente: ${name} (RUC: ${ruc})`,
      type: 'info',
      relatedSection: 'clients',
      relatedId: newClient.id
    });

    // Responder con el cliente creado
    return res.status(201).json({
      success: true,
      data: newClient,
      message: 'Cliente creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Error de validación en los datos del cliente',
        errors: validationErrors
      });
    }
    
    // Manejar otros errores específicos de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con esos datos únicos (RUC/Email)'
      });
    }
    
    // Error genérico del servidor
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el cliente',
      error: error.message
    });
  }
};

/**
 * Obtener todos los clientes
 * @route GET /api/clients
 */
const getAllClients = async (req, res) => {
  try {
    // Parámetros de consulta opcionales
    const { status, search } = req.query;
    let whereClause = {};

    // Filtrar por estado si se proporciona
    if (status) {
      whereClause.status = status;
    }

    // Búsqueda por nombre, RUC o email si se proporciona
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { ruc: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    // Obtener clientes con opciones de filtrado
    const clients = await Client.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de clientes',
      error: error.message
    });
  }
};

/**
 * Obtener un cliente por su ID
 * @route GET /api/clients/:id
 */
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    // Buscar cliente por ID
    const client = await Client.findByPk(id, {
      include: ['contractedServices', 'invoices'] // Incluir relaciones si es necesario
    });

    // Verificar si el cliente existe
    if (!client) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el cliente con ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(`Error al obtener cliente con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el cliente',
      error: error.message
    });
  }
};

/**
 * Actualizar un cliente existente
 * @route PUT /api/clients/:id
 */
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ruc, phone, email, address, status } = req.body;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    // Buscar cliente por ID
    const client = await Client.findByPk(id);

    // Verificar si el cliente existe
    if (!client) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el cliente con ID ${id}`
      });
    }

    // Si se está actualizando el RUC, verificar que no exista otro cliente con ese RUC
    if (ruc && ruc !== client.ruc) {
      const existingClient = await Client.findOne({ where: { ruc } });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: `Ya existe otro cliente con el RUC ${ruc}`
        });
      }
    }

    // Actualizar cliente
    await client.update({
      name: name || client.name,
      ruc: ruc || client.ruc,
      phone: phone || client.phone,
      email: email || client.email,
      address: address || client.address,
      status: status || client.status
    });

    return res.status(200).json({
      success: true,
      data: client,
      message: 'Cliente actualizado correctamente'
    });
  } catch (error) {
    console.error(`Error al actualizar cliente con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el cliente',
      error: error.message
    });
  }
};

/**
 * Eliminar un cliente
 * @route DELETE /api/clients/:id
 */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    // Buscar cliente por ID
    const client = await Client.findByPk(id);

    // Verificar si el cliente existe
    if (!client) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el cliente con ID ${id}`
      });
    }

    // Buscar todos los pagos del cliente para limpiar sus archivos
    console.log(`🔍 Buscando pagos del cliente ${id} para limpieza de archivos...`);
    const clientInvoices = await Invoice.findAll({
      where: { clientId: id },
      paranoid: false // Incluir eliminados también
    });

    // Limpiar archivos de todos los pagos del cliente
    if (clientInvoices.length > 0) {
      console.log(`🗑️ Limpiando archivos de ${clientInvoices.length} pagos del cliente ${id}`);
      
      for (const invoice of clientInvoices) {
        if (invoice.document && invoice.document.path) {
          console.log(`🗑️ Limpiando archivo del pago ${invoice.id}: ${invoice.document.path}`);
          cleanupInvoiceFiles(invoice);
        }
      }
      
      // Eliminar pagos del cliente
      await Invoice.destroy({
        where: { clientId: id },
        force: true // Eliminación física para limpiar completamente
      });
      
      console.log(`🗑️ ${clientInvoices.length} pagos del cliente ${id} eliminados`);
    }

    // Eliminar carpetas completas del cliente
    console.log(`🗑️ Eliminando carpetas del cliente ${id}...`);
    deleteClientFiles(id);

    // Eliminar cliente (borrado lógico si paranoid: true)
    await client.destroy();

    return res.status(200).json({
      success: true,
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    console.error(`Error al eliminar cliente con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el cliente',
      error: error.message
    });
  }
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
};
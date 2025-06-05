const { Service } = require('../models');
const { Op } = require('sequelize');

// Controlador para Servicios

/**
 * Crear un nuevo servicio
 * @route POST /api/services
 */
const createService = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { name, type, price, description } = req.body;

    // Validar datos requeridos
    if (!name || !type || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios (nombre, tipo, precio)' 
      });
    }

    // Validar tipo de servicio
    if (type !== 'mensual' && type !== 'temporal') {
      return res.status(400).json({
        success: false,
        message: 'El tipo de servicio debe ser "mensual" o "temporal"'
      });
    }

    // Validar precio
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número positivo'
      });
    }

    // Verificar si ya existe un servicio con el mismo nombre
    const existingService = await Service.findOne({ where: { name } });
    if (existingService) {
      return res.status(400).json({ 
        success: false, 
        message: `Ya existe un servicio con el nombre "${name}"` 
      });
    }

    // Crear nuevo servicio
    const newService = await Service.create({
      name,
      type,
      price,
      description
    });

    // Responder con el servicio creado
    return res.status(201).json({
      success: true,
      data: newService,
      message: 'Servicio creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el servicio',
      error: error.message
    });
  }
};

/**
 * Obtener todos los servicios
 * @route GET /api/services
 */
const getAllServices = async (req, res) => {
  try {
    // Parámetros de consulta opcionales
    const { type, search } = req.query;
    let whereClause = {};

    // Filtrar por tipo si se proporciona
    if (type) {
      whereClause.type = type;
    }

    // Búsqueda por nombre o descripción si se proporciona
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    // Obtener servicios con opciones de filtrado
    const services = await Service.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de servicios',
      error: error.message
    });
  }
};

/**
 * Obtener un servicio por su ID
 * @route GET /api/services/:id
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }

    // Buscar servicio por ID
    const service = await Service.findByPk(id, {
      include: ['contractedInstances'] // Incluir relaciones si es necesario
    });

    // Verificar si el servicio existe
    if (!service) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el servicio con ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error(`Error al obtener servicio con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el servicio',
      error: error.message
    });
  }
};

/**
 * Actualizar un servicio existente
 * @route PUT /api/services/:id
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, price, description } = req.body;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }

    // Buscar servicio por ID
    const service = await Service.findByPk(id);

    // Verificar si el servicio existe
    if (!service) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el servicio con ID ${id}`
      });
    }

    // Validar tipo de servicio si se proporciona
    if (type && type !== 'mensual' && type !== 'temporal') {
      return res.status(400).json({
        success: false,
        message: 'El tipo de servicio debe ser "mensual" o "temporal"'
      });
    }

    // Validar precio si se proporciona
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número positivo'
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otro servicio con ese nombre
    if (name && name !== service.name) {
      const existingService = await Service.findOne({ where: { name } });
      if (existingService) {
        return res.status(400).json({
          success: false,
          message: `Ya existe otro servicio con el nombre "${name}"`
        });
      }
    }

    // Actualizar servicio
    await service.update({
      name: name || service.name,
      type: type || service.type,
      price: price !== undefined ? price : service.price,
      description: description !== undefined ? description : service.description
    });

    return res.status(200).json({
      success: true,
      data: service,
      message: 'Servicio actualizado correctamente'
    });
  } catch (error) {
    console.error(`Error al actualizar servicio con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el servicio',
      error: error.message
    });
  }
};

/**
 * Eliminar un servicio
 * @route DELETE /api/services/:id
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }

    // Buscar servicio por ID
    const service = await Service.findByPk(id);

    // Verificar si el servicio existe
    if (!service) {
      return res.status(404).json({
        success: false,
        message: `No se encontró el servicio con ID ${id}`
      });
    }

    // TODO: Verificar si el servicio está siendo utilizado en servicios contratados o facturas
    // Si es necesario, se puede implementar una lógica para bloquear la eliminación de servicios en uso

    // Eliminar servicio (borrado lógico si paranoid: true)
    await service.destroy();

    return res.status(200).json({
      success: true,
      message: 'Servicio eliminado correctamente'
    });
  } catch (error) {
    console.error(`Error al eliminar servicio con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el servicio',
      error: error.message
    });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};
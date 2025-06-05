const { Notification } = require('../models');
const { Op } = require('sequelize');

// Controlador para Notificaciones

/**
 * Obtener todas las notificaciones
 * @route GET /api/notifications
 */
const getAllNotifications = async (req, res) => {
  try {
    // Parámetros de consulta opcionales
    const { read, type, limit = 50 } = req.query;
    let whereClause = {};

    // Filtrar por estado de lectura si se proporciona
    if (read !== undefined) {
      whereClause.read = read === 'true';
    }

    // Filtrar por tipo si se proporciona
    if (type) {
      whereClause.type = type;
    }

    // Obtener notificaciones con opciones de filtrado
    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['time', 'DESC']], // Ordenar por tiempo descendente (más recientes primero)
      limit: parseInt(limit)     // Limitar el número de resultados
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de notificaciones',
      error: error.message
    });
  }
};

/**
 * Obtener una notificación por su ID
 * @route GET /api/notifications/:id
 */
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificación inválido'
      });
    }

    // Buscar notificación por ID
    const notification = await Notification.findByPk(id);

    // Verificar si la notificación existe
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la notificación con ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error(`Error al obtener notificación con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la notificación',
      error: error.message
    });
  }
};

/**
 * Crear una nueva notificación
 * @route POST /api/notifications
 */
const createNotification = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { title, message, type, relatedSection, relatedId } = req.body;

    // Validar datos requeridos
    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios (título, mensaje)' 
      });
    }

    // Validar tipo de notificación
    const validTypes = ['info', 'warning', 'danger', 'success'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de notificación debe ser uno de: info, warning, danger, success'
      });
    }

    // Crear nueva notificación
    const newNotification = await Notification.create({
      title,
      message,
      time: new Date(),
      type: type || 'info',
      read: false,
      relatedSection,
      relatedId
    });

    return res.status(201).json({
      success: true,
      data: newNotification,
      message: 'Notificación creada correctamente'
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear la notificación',
      error: error.message
    });
  }
};

/**
 * Marcar una notificación como leída
 * @route PUT /api/notifications/:id/read
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificación inválido'
      });
    }

    // Buscar notificación por ID
    const notification = await Notification.findByPk(id);

    // Verificar si la notificación existe
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la notificación con ID ${id}`
      });
    }

    // Verificar si la notificación ya está marcada como leída
    if (notification.read) {
      return res.status(200).json({
        success: true,
        data: notification,
        message: 'La notificación ya estaba marcada como leída'
      });
    }

    // Marcar notificación como leída
    await notification.update({ read: true });

    return res.status(200).json({
      success: true,
      data: notification,
      message: 'Notificación marcada como leída correctamente'
    });
  } catch (error) {
    console.error(`Error al marcar notificación con ID ${req.params.id} como leída:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar la notificación como leída',
      error: error.message
    });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 * @route PUT /api/notifications/read-all
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    // Contar notificaciones no leídas
    const unreadCount = await Notification.count({
      where: { read: false }
    });

    // Si no hay notificaciones sin leer, informar
    if (unreadCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay notificaciones sin leer'
      });
    }

    // Marcar todas las notificaciones como leídas
    await Notification.update(
      { read: true },
      { where: { read: false } }
    );

    return res.status(200).json({
      success: true,
      count: unreadCount,
      message: `${unreadCount} notificación(es) marcada(s) como leída(s) correctamente`
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones como leídas',
      error: error.message
    });
  }
};

/**
 * Eliminar una notificación
 * @route DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificación inválido'
      });
    }

    // Buscar notificación por ID
    const notification = await Notification.findByPk(id);

    // Verificar si la notificación existe
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la notificación con ID ${id}`
      });
    }

    // Eliminar notificación (borrado lógico si paranoid: true)
    await notification.destroy();

    return res.status(200).json({
      success: true,
      message: 'Notificación eliminada correctamente'
    });
  } catch (error) {
    console.error(`Error al eliminar notificación con ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la notificación',
      error: error.message
    });
  }
};

// Función de utilidad para crear notificaciones desde otros módulos del sistema
// Esta función no es un endpoint de API, sino una función que puede ser utilizada
// por otros controladores para generar notificaciones automáticamente
const createSystemNotification = async (notificationData) => {
  try {
    const { title, message, type, relatedSection, relatedId } = notificationData;
    
    if (!title || !message) {
      console.error('Datos de notificación incompletos:', notificationData);
      return null;
    }
    
    const notification = await Notification.create({
      title,
      message,
      time: new Date(),
      type: type || 'info',
      read: false,
      relatedSection,
      relatedId
    });
    
    return notification;
  } catch (error) {
    console.error('Error al crear notificación del sistema:', error);
    return null;
  }
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createSystemNotification
};
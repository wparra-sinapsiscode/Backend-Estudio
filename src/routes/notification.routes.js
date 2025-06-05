const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

/**
 * @route   GET /api/notifications
 * @desc    Obtener todas las notificaciones (con filtros opcionales)
 * @access  Private
 */
router.get('/', notificationController.getAllNotifications);

/**
 * @route   GET /api/notifications/:id
 * @desc    Obtener una notificación por su ID
 * @access  Private
 */
router.get('/:id', notificationController.getNotificationById);

/**
 * @route   POST /api/notifications
 * @desc    Crear una nueva notificación
 * @access  Private
 */
router.post('/', notificationController.createNotification);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar una notificación como leída
 * @access  Private
 */
router.put('/:id/read', notificationController.markNotificationAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private
 */
router.put('/read-all', notificationController.markAllNotificationsAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Eliminar una notificación
 * @access  Private
 */
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
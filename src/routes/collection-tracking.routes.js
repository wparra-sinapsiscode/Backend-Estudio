const express = require('express');
const router = express.Router();
const collectionTrackingController = require('../controllers/collection-tracking.controller');
const { protect } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener historial de seguimiento para una entidad
router.get('/history/:entityType/:entityId', collectionTrackingController.getTrackingHistory);

// Crear nuevo registro de seguimiento
router.post('/', collectionTrackingController.createTracking);

// Obtener seguimientos pendientes del usuario
router.get('/pending', collectionTrackingController.getPendingTrackings);

// Obtener resumen de seguimientos por cliente
router.get('/client/:clientId/summary', collectionTrackingController.getClientTrackingSummary);

module.exports = router;
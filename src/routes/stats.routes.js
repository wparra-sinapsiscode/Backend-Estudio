const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { protect } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// GET /api/stats/monthly-revenue - Obtener ingresos mensuales
router.get('/monthly-revenue', statsController.getMonthlyRevenue);

// GET /api/stats/revenue-by-service - Obtener ingresos por servicio
router.get('/revenue-by-service', statsController.getRevenueByService);

// GET /api/stats/dashboard-summary - Obtener resumen completo del dashboard
router.get('/dashboard-summary', statsController.getDashboardSummary);

module.exports = router;
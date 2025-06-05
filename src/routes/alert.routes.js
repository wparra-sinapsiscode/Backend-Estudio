const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');

/**
 * @route   POST /api/alerts/generate
 * @desc    Genera manualmente todas las alertas del sistema
 * @access  Private (Futuro: Solo administradores)
 */
router.post('/generate', alertController.generateAlerts);

module.exports = router;
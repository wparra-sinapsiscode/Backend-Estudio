const express = require('express');
const router = express.Router();
const alertSettingController = require('../controllers/alertSetting.controller');

/**
 * @route   GET /api/settings/alerts
 * @desc    Obtener la configuración de alertas
 * @access  Private
 */
router.get('/', alertSettingController.getAlertSettings);

/**
 * @route   PUT /api/settings/alerts
 * @desc    Actualizar o crear la configuración de alertas
 * @access  Private
 */
router.put('/', alertSettingController.updateAlertSettings);

/**
 * @route   POST /api/settings/alerts
 * @desc    Alias para actualizar o crear la configuración (mismo que PUT)
 * @access  Private
 */
router.post('/', alertSettingController.updateAlertSettings);

module.exports = router;
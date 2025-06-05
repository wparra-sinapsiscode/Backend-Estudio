const express = require('express');
const router = express.Router();
const companySettingController = require('../controllers/companySetting.controller');

/**
 * @route   GET /api/settings/company
 * @desc    Obtener la configuración de la empresa
 * @access  Private
 */
router.get('/', companySettingController.getCompanySettings);

/**
 * @route   PUT /api/settings/company
 * @desc    Actualizar o crear la configuración de la empresa
 * @access  Private
 */
router.put('/', companySettingController.updateCompanySettings);

/**
 * @route   POST /api/settings/company
 * @desc    Alias para actualizar o crear la configuración (mismo que PUT)
 * @access  Private
 */
router.post('/', companySettingController.updateCompanySettings);

module.exports = router;
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');

/**
 * @route   POST /api/services
 * @desc    Crear un nuevo servicio
 * @access  Private
 */
router.post('/', serviceController.createService);

/**
 * @route   GET /api/services
 * @desc    Obtener todos los servicios
 * @access  Private
 */
router.get('/', serviceController.getAllServices);

/**
 * @route   GET /api/services/:id
 * @desc    Obtener un servicio por su ID
 * @access  Private
 */
router.get('/:id', serviceController.getServiceById);

/**
 * @route   PUT /api/services/:id
 * @desc    Actualizar un servicio
 * @access  Private
 */
router.put('/:id', serviceController.updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Eliminar un servicio
 * @access  Private
 */
router.delete('/:id', serviceController.deleteService);

module.exports = router;
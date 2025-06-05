const express = require('express');
const router = express.Router();
const contractedServiceController = require('../controllers/contracted-service.controller');

/**
 * @route   POST /api/contracted-services
 * @desc    Crear un nuevo servicio contratado
 * @access  Private
 */
router.post('/', contractedServiceController.createContractedService);

/**
 * @route   GET /api/contracted-services
 * @desc    Obtener todos los servicios contratados
 * @access  Private
 */
router.get('/', contractedServiceController.getAllContractedServices);

/**
 * @route   GET /api/contracted-services/:id
 * @desc    Obtener un servicio contratado por su ID
 * @access  Private
 */
router.get('/:id', contractedServiceController.getContractedServiceById);

/**
 * @route   PUT /api/contracted-services/:id
 * @desc    Actualizar un servicio contratado
 * @access  Private
 */
router.put('/:id', contractedServiceController.updateContractedService);

/**
 * @route   DELETE /api/contracted-services/:id
 * @desc    Eliminar un servicio contratado
 * @access  Private
 */
router.delete('/:id', contractedServiceController.deleteContractedService);

module.exports = router;
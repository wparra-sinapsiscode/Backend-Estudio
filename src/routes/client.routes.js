const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

/**
 * @route   POST /api/clients
 * @desc    Crear un nuevo cliente
 * @access  Private
 */
router.post('/', clientController.createClient);

/**
 * @route   GET /api/clients
 * @desc    Obtener todos los clientes
 * @access  Private
 */
router.get('/', clientController.getAllClients);

/**
 * @route   GET /api/clients/:id
 * @desc    Obtener un cliente por su ID
 * @access  Private
 */
router.get('/:id', clientController.getClientById);

/**
 * @route   PUT /api/clients/:id
 * @desc    Actualizar un cliente
 * @access  Private
 */
router.put('/:id', clientController.updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Eliminar un cliente
 * @access  Private
 */
router.delete('/:id', clientController.deleteClient);

module.exports = router;
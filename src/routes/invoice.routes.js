const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

/**
 * @route   POST /api/invoices
 * @desc    Crear una nueva factura/proforma
 * @access  Private
 */
router.post('/', invoiceController.createInvoice);

/**
 * @route   GET /api/invoices
 * @desc    Obtener todas las facturas/proformas con filtros opcionales
 * @access  Private
 */
router.get('/', invoiceController.getAllInvoices);

/**
 * @route   GET /api/invoices/:id
 * @desc    Obtener una factura/proforma por su ID
 * @access  Private
 */
router.get('/:id', invoiceController.getInvoiceById);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Actualizar una factura/proforma
 * @access  Private
 */
router.put('/:id', invoiceController.updateInvoice);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Eliminar una factura/proforma
 * @access  Private
 */
router.delete('/:id', invoiceController.deleteInvoice);

/**
 * @route   POST /api/invoices/:id/payments
 * @desc    Agregar un pago a una factura/proforma
 * @access  Private
 */
router.post('/:id/payments', invoiceController.addPaymentToInvoice);

module.exports = router;
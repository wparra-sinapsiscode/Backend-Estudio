const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { uploadInvoiceDocuments } = require('../middleware/upload.middleware');

/**
 * @route   POST /api/invoices
 * @desc    Crear un nuevo pago
 * @access  Private
 */
router.post('/', uploadInvoiceDocuments, invoiceController.createInvoice);

/**
 * @route   GET /api/invoices
 * @desc    Obtener todos los pagos con filtros opcionales
 * @access  Private
 */
router.get('/', invoiceController.getAllInvoices);

/**
 * @route   GET /api/invoices/:id
 * @desc    Obtener un pago por su ID
 * @access  Private
 */
router.get('/:id', invoiceController.getInvoiceById);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Actualizar un pago
 * @access  Private
 */
router.put('/:id', uploadInvoiceDocuments, invoiceController.updateInvoice);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Eliminar un pago
 * @access  Private
 */
router.delete('/:id', invoiceController.deleteInvoice);

/**
 * @route   POST /api/invoices/:id/payments
 * @desc    Agregar un pago parcial a un documento
 * @access  Private
 */
router.post('/:id/payments', invoiceController.addPaymentToInvoice);

module.exports = router;
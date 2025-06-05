const alertService = require('../services/alert.service');

/**
 * Genera manualmente todas las alertas del sistema
 * @route POST /api/alerts/generate
 */
const generateAlerts = async (req, res) => {
  try {
    // Ejecutar ambos servicios de generación de alertas
    const invoiceAlerts = await alertService.generateInvoiceDueDateAlerts();
    const billingAlerts = await alertService.generateNextBillingAlerts();
    
    const totalAlerts = (invoiceAlerts.generated || 0) + (billingAlerts.generated || 0);
    
    // Verificar si hubo errores
    if (!invoiceAlerts.success || !billingAlerts.success) {
      return res.status(500).json({
        success: false,
        message: 'Error en la generación de alertas',
        details: {
          invoiceAlerts,
          billingAlerts
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      totalGenerated: totalAlerts,
      details: {
        invoiceAlerts,
        billingAlerts
      },
      message: `Se generaron ${totalAlerts} alertas en total`
    });
  } catch (error) {
    console.error('Error al generar alertas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar alertas',
      error: error.message
    });
  }
};

module.exports = {
  generateAlerts
};
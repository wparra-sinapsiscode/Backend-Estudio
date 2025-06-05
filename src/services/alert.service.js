const { Invoice, Client, AlertSetting, ContractedService, Service } = require('../models');
const { createSystemNotification } = require('../controllers/notification.controller');
const { Op } = require('sequelize');

/**
 * Servicio para manejar la generación de alertas automáticas
 * basadas en fechas de vencimiento y configuraciones de alertas
 */

/**
 * Genera alertas para facturas próximas a vencer según la configuración de alertas
 * @returns {Promise<Object>} Resultado de la operación con conteo de alertas generadas
 */
const generateInvoiceDueDateAlerts = async () => {
  try {
    // Obtener configuración de alertas
    const alertSettings = await AlertSetting.findOne();
    
    if (!alertSettings || !alertSettings.systemAlerts) {
      console.log('Las alertas del sistema están desactivadas');
      return { success: true, generated: 0, message: 'Alertas del sistema desactivadas' };
    }
    
    const today = new Date();
    const alertResults = {
      firstAlert: 0,
      secondAlert: 0,
      overdue: 0
    };
    
    // Calcular fechas para las alertas
    const firstAlertDate = new Date(today);
    firstAlertDate.setDate(today.getDate() + alertSettings.firstAlert);
    
    const secondAlertDate = new Date(today);
    secondAlertDate.setDate(today.getDate() + alertSettings.secondAlert);
    
    // Buscar facturas pendientes
    const pendingInvoices = await Invoice.findAll({
      where: {
        status: 'pendiente',
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'ruc']
        }
      ]
    });
    
    // Procesar cada factura pendiente
    for (const invoice of pendingInvoices) {
      const dueDate = new Date(invoice.dueDate);
      const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      // Facturas vencidas
      if (daysDiff < 0) {
        // Solo generar alertas para facturas recién vencidas (hoy) y que no se haya enviado alerta
        if (dueDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0) && !invoice.overdueAlertSent) {
          // Formatear monto para la notificación
          const formattedAmount = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
          }).format(invoice.amount);
          
          await createSystemNotification({
            title: 'Factura vencida',
            message: `La factura ${invoice.number} del cliente ${invoice.client.name} por un monto de ${formattedAmount} ha vencido hoy. Requiere atención inmediata.`,
            type: 'danger',
            relatedSection: 'invoices',
            relatedId: invoice.id
          });
          
          // Marcar la factura como alertada por vencimiento
          await invoice.update({ overdueAlertSent: true });
          
          alertResults.overdue++;
        }
      }
      // Primera alerta (corresponde a firstAlert días antes)
      else if (daysDiff === alertSettings.firstAlert && !invoice.firstAlertSent) {
        await createSystemNotification({
          title: 'Factura próxima a vencer',
          message: `La factura ${invoice.number} del cliente ${invoice.client.name} vencerá en ${alertSettings.firstAlert} días`,
          type: 'info',
          relatedSection: 'invoices',
          relatedId: invoice.id
        });
        
        // Marcar la factura como alertada (nivel 1)
        await invoice.update({ firstAlertSent: true });
        
        alertResults.firstAlert++;
      }
      // Segunda alerta (corresponde a secondAlert días antes)
      else if (daysDiff === alertSettings.secondAlert && !invoice.secondAlertSent) {
        await createSystemNotification({
          title: 'Factura próxima a vencer',
          message: `La factura ${invoice.number} del cliente ${invoice.client.name} vencerá en ${alertSettings.secondAlert} días`,
          type: 'warning',
          relatedSection: 'invoices',
          relatedId: invoice.id
        });
        
        // Marcar la factura como alertada (nivel 2)
        await invoice.update({ secondAlertSent: true });
        
        alertResults.secondAlert++;
      }
    }
    
    const totalAlerts = alertResults.firstAlert + alertResults.secondAlert + alertResults.overdue;
    
    console.log(`Alertas generadas: ${totalAlerts} (Primera alerta: ${alertResults.firstAlert}, Segunda alerta: ${alertResults.secondAlert}, Vencidas: ${alertResults.overdue})`);
    
    return {
      success: true,
      generated: totalAlerts,
      details: alertResults,
      message: `${totalAlerts} alertas generadas correctamente`
    };
  } catch (error) {
    console.error('Error al generar alertas de facturas:', error);
    return {
      success: false,
      generated: 0,
      message: 'Error al generar alertas',
      error: error.message
    };
  }
};

/**
 * Genera alertas para próximos pagos de servicios contratados
 * @returns {Promise<Object>} Resultado de la operación con conteo de alertas generadas
 */
const generateNextBillingAlerts = async () => {
  try {
    // Obtener configuración de alertas
    const alertSettings = await AlertSetting.findOne();
    
    if (!alertSettings || !alertSettings.systemAlerts) {
      console.log('Las alertas del sistema están desactivadas');
      return { success: true, generated: 0, message: 'Alertas del sistema desactivadas' };
    }
    
    const today = new Date();
    let generatedAlerts = 0;
    
    // Calcular fechas para las alertas
    const firstAlertDate = new Date(today);
    firstAlertDate.setDate(today.getDate() + alertSettings.firstAlert);
    
    const secondAlertDate = new Date(today);
    secondAlertDate.setDate(today.getDate() + alertSettings.secondAlert);
    
    // Buscar servicios contratados activos con próxima fecha de facturación cercana
    const contractedServices = await ContractedService.findAll({
      where: {
        status: 'activo',
        nextBillingDate: {
          [Op.and]: [
            { [Op.gt]: today }, // Fecha futura
            {
              [Op.or]: [
                { [Op.eq]: firstAlertDate }, // Primera alerta
                { [Op.eq]: secondAlertDate }  // Segunda alerta
              ]
            }
          ]
        }
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Procesar cada servicio contratado
    for (const service of contractedServices) {
      const billingDate = new Date(service.nextBillingDate);
      const daysDiff = Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24));
      
      // Determinar tipo de alerta
      let alertType, alertMessage;
      
      // Solo generar alerta si no se ha enviado ya
      if (!service.billingAlertSent) {
        if (daysDiff === alertSettings.firstAlert) {
          alertType = 'info';
          alertMessage = `Próxima facturación para el servicio "${service.service.name}" del cliente ${service.client.name} en ${alertSettings.firstAlert} días`;
        } else if (daysDiff === alertSettings.secondAlert) {
          alertType = 'warning';
          alertMessage = `Próxima facturación para el servicio "${service.service.name}" del cliente ${service.client.name} en ${alertSettings.secondAlert} días`;
        }
        
        // Crear notificación
        if (alertMessage) {
          await createSystemNotification({
            title: 'Próxima facturación',
            message: alertMessage,
            type: alertType,
            relatedSection: 'contracted_services',
            relatedId: service.id
          });
          
          // Marcar el servicio contratado como alertado
          await service.update({ billingAlertSent: true });
          
          generatedAlerts++;
        }
      }
    }
    
    console.log(`Alertas de facturación generadas: ${generatedAlerts}`);
    
    return {
      success: true,
      generated: generatedAlerts,
      message: `${generatedAlerts} alertas de facturación generadas correctamente`
    };
  } catch (error) {
    console.error('Error al generar alertas de facturación:', error);
    return {
      success: false,
      generated: 0,
      message: 'Error al generar alertas de facturación',
      error: error.message
    };
  }
};

module.exports = {
  generateInvoiceDueDateAlerts,
  generateNextBillingAlerts
};
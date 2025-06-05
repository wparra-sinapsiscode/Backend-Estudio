const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Invoice, ContractedService, Client, Service } = require('../models');

/**
 * Obtener eventos de calendario
 * @route GET /api/calendar/events
 * @description Retorna eventos de calendario para un mes específico, incluyendo:
 * - Facturas pendientes (status !== 'pagada' Y pendingAmount > 0)
 * - Servicios contratados activos (status = 'activo')
 * @param {string} month - Mes (1-12)
 * @param {string} year - Año (YYYY)
 */
const getCalendarEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Validar parámetros
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Los parámetros month y year son requeridos'
      });
    }
    
    // Calcular rango de fechas para el mes solicitado
    const startDate = new Date(year, month - 1, 1); // month - 1 porque los meses en JS van de 0-11
    const endDate = new Date(year, month, 0); // Último día del mes
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    let events = [];
    
    // Obtener facturas con fecha de vencimiento en el mes solicitado
    // Excluir facturas pagadas (status !== 'pagada' Y pendingAmount > 0)
    const invoices = await Invoice.findAll({
      where: {
        dueDate: {
          [Op.between]: [startDateStr, endDateStr]
        },
        [Op.and]: [
          {
            status: {
              [Op.ne]: 'pagada'
            }
          },
          // Solo mostrar facturas con monto pendiente mayor a 0
          sequelize.where(
            sequelize.literal('(amount - COALESCE("paidAmount", 0))'),
            Op.gt,
            0
          )
        ]
      },
      include: [
        { 
          model: Client, 
          as: 'client', 
          attributes: ['id', 'name'],
          required: true // INNER JOIN para asegurar que existe el cliente
        },
        { 
          model: Service, 
          as: 'service', 
          attributes: ['id', 'name', 'price'],
          required: true // INNER JOIN para asegurar que existe el servicio
        }
      ]
    });
    
    // Agregar eventos de facturas
    invoices.forEach(invoice => {
      // Validar que client y service existan
      if (invoice.client && invoice.service) {
        const pendingAmount = parseFloat(invoice.amount) - parseFloat(invoice.paidAmount);
        events.push({
          id: `invoice-${invoice.id}`,
          entityId: invoice.id,
          title: `Factura: ${invoice.client.name} - ${invoice.service.name}`,
          date: invoice.dueDate,
          type: 'invoice',
          status: invoice.status,
          clientName: invoice.client.name,
          amount: parseFloat(invoice.amount),
          paidAmount: parseFloat(invoice.paidAmount),
          pendingAmount: pendingAmount
        });
      } else {
        console.warn(`Invoice ${invoice.id} missing client or service association`);
      }
    });
    
    // Obtener servicios contratados con próxima fecha de pago en el mes solicitado
    const contractedServices = await ContractedService.findAll({
      where: {
        nextPayment: {
          [Op.between]: [startDateStr, endDateStr]
        },
        status: 'activo'
      },
      include: [
        { 
          model: Client, 
          as: 'client', 
          attributes: ['id', 'name'],
          required: true // INNER JOIN para asegurar que existe el cliente
        },
        { 
          model: Service, 
          as: 'service', 
          attributes: ['id', 'name', 'price'],
          required: true // INNER JOIN para asegurar que existe el servicio
        }
      ]
    });
    
    // Agregar eventos de servicios contratados
    contractedServices.forEach(cs => {
      // Validar que client y service existan
      if (cs.client && cs.service) {
        events.push({
          id: `contractPayment-${cs.id}`,
          entityId: cs.id,
          title: `Pago: ${cs.client.name} - ${cs.service.name}`,
          date: cs.nextPayment,
          type: 'contractPayment',
          status: cs.status,
          clientName: cs.client.name,
          amount: parseFloat(cs.price || cs.service.price)
        });
      } else {
        console.warn(`ContractedService ${cs.id} missing client or service association`);
      }
    });
    
    // Ordenar eventos por fecha
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
    
  } catch (error) {
    console.error('Error al obtener eventos de calendario:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener eventos de calendario',
      error: error.message,
      details: error.stack
    });
  }
};

module.exports = {
  getCalendarEvents
};
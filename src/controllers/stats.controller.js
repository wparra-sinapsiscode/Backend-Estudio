const { Invoice, Client, Service } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// GET /api/stats/monthly-revenue
const getMonthlyRevenue = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Si no se especifica año/mes, usar el actual
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    
    // Calcular fechas de inicio y fin del mes
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    // Obtener ingresos del mes de facturas pagadas
    const monthlyRevenue = await Invoice.sum('paidAmount', {
      where: {
        status: 'pagada',
        updatedAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    // Obtener estadísticas adicionales
    const totalInvoices = await Invoice.count({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    const paidInvoices = await Invoice.count({
      where: {
        status: 'pagada',
        updatedAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        totalRevenue: monthlyRevenue || 0,
        totalInvoices,
        paidInvoices,
        month: targetMonth,
        year: targetYear,
        period: `${targetYear}-${targetMonth.toString().padStart(2, '0')}`
      }
    });
  } catch (error) {
    console.error('Error calculating monthly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculando ingresos mensuales',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/stats/revenue-by-service
const getRevenueByService = async (req, res) => {
  try {
    const { year, month, startDate, endDate } = req.query;
    
    let whereCondition = {
      status: 'pagada'
    };
    
    // Agregar filtros de fecha si se proporcionan
    if (startDate && endDate) {
      whereCondition.updatedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (year && month) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0);
      whereCondition.updatedAt = {
        [Op.between]: [start, end]
      };
    }
    
    // Obtener ingresos agrupados por servicio
    const revenueByService = await Invoice.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Invoice.paidAmount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('Invoice.id')), 'invoiceCount']
      ],
      where: whereCondition,
      include: [{
        model: Service,
        as: 'service',
        attributes: ['id', 'name', 'type', 'price'],
        required: true
      }],
      group: ['service.id', 'service.name', 'service.type', 'service.price'],
      order: [[sequelize.fn('SUM', sequelize.col('Invoice.paidAmount')), 'DESC']]
    });
    
    // Formatear la respuesta
    const formattedData = revenueByService.map(item => ({
      serviceId: item.service.id,
      serviceName: item.service.name,
      serviceType: item.service.type,
      basePrice: parseFloat(item.service.price),
      totalRevenue: parseFloat(item.dataValues.totalRevenue) || 0,
      invoiceCount: parseInt(item.dataValues.invoiceCount) || 0
    }));
    
    // Calcular totales
    const totalRevenue = formattedData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalInvoices = formattedData.reduce((sum, item) => sum + item.invoiceCount, 0);
    
    res.json({
      success: true,
      data: {
        services: formattedData,
        totals: {
          totalRevenue,
          totalInvoices,
          serviceCount: formattedData.length
        }
      }
    });
  } catch (error) {
    console.error('Error calculating revenue by service:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculando ingresos por servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/stats/dashboard-summary
const getDashboardSummary = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    
    // Ejecutar consultas en paralelo
    const [
      totalClients,
      activeServices,
      monthlyInvoices,
      monthlyRevenue,
      pendingInvoices,
      overdueInvoices
    ] = await Promise.all([
      // Total de clientes activos
      Client.count({ where: { status: 'activo' } }),
      
      // Servicios contratados activos
      Service.count({ where: { status: 'activo' } }),
      
      // Facturas del mes actual
      Invoice.count({
        where: {
          createdAt: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }),
      
      // Ingresos del mes actual
      Invoice.sum('paidAmount', {
        where: {
          status: 'pagada',
          updatedAt: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }),
      
      // Facturas pendientes
      Invoice.count({ where: { status: 'pendiente' } }),
      
      // Facturas vencidas
      Invoice.count({ where: { status: 'vencida' } })
    ]);
    
    res.json({
      success: true,
      data: {
        totalClients: totalClients || 0,
        activeServices: activeServices || 0,
        monthlyInvoices: monthlyInvoices || 0,
        monthlyRevenue: monthlyRevenue || 0,
        pendingInvoices: pendingInvoices || 0,
        overdueInvoices: overdueInvoices || 0,
        period: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen del dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getMonthlyRevenue,
  getRevenueByService,
  getDashboardSummary
};
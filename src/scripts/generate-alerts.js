/**
 * Script para generar todas las alertas del sistema.
 * Este script puede ser ejecutado mediante un cron job para generar alertas diariamente.
 * 
 * Modo de uso:
 * node src/scripts/generate-alerts.js
 */

// Importar módulos necesarios
require('dotenv').config();
const { sequelize } = require('../config/database');
const { setupAssociations } = require('../models');
const alertService = require('../services/alert.service');

// Configurar asociaciones entre modelos
setupAssociations();

// Función para generar alertas
const generateAllAlerts = async () => {
  try {
    console.log('=== GENERADOR DE ALERTAS AUTOMÁTICAS ===');
    console.log(`Inicio: ${new Date().toISOString()}`);
    
    // Verificar conexión a la base de datos
    try {
      await sequelize.authenticate();
      console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
      console.error('No se pudo conectar a la base de datos:', error);
      process.exit(1);
    }
    
    // Generar alertas de facturas
    console.log('\nGenerando alertas de facturas por vencer...');
    const invoiceAlerts = await alertService.generateInvoiceDueDateAlerts();
    console.log(`Resultado: ${invoiceAlerts.message}`);
    
    // Generar alertas de próximas facturaciones
    console.log('\nGenerando alertas de próximas facturaciones...');
    const billingAlerts = await alertService.generateNextBillingAlerts();
    console.log(`Resultado: ${billingAlerts.message}`);
    
    // Total de alertas generadas
    const totalAlerts = (invoiceAlerts.generated || 0) + (billingAlerts.generated || 0);
    console.log(`\nSe generaron ${totalAlerts} alertas en total.`);
    
    console.log(`\nFin: ${new Date().toISOString()}`);
    console.log('=====================================');
    
    // Cerrar conexión a la base de datos
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al generar alertas:', error);
    
    // Cerrar conexión a la base de datos en caso de error
    try {
      await sequelize.close();
    } catch (err) {
      console.error('Error al cerrar conexión a la base de datos:', err);
    }
    
    process.exit(1);
  }
};

// Ejecutar función principal
generateAllAlerts();
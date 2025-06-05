const { AlertSetting } = require('../models');

// Controlador para Configuración de Alertas

/**
 * Obtener la configuración de alertas
 * @route GET /api/settings/alerts
 */
const getAlertSettings = async (req, res) => {
  try {
    // Buscar la configuración de alertas (asumimos que solo hay un registro)
    let alertSettings = await AlertSetting.findOne();
    
    // Si no hay configuración, devolver un objeto vacío o un mensaje
    if (!alertSettings) {
      return res.status(404).json({
        success: false,
        message: 'No se ha configurado las alertas',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      data: alertSettings
    });
  } catch (error) {
    console.error('Error al obtener configuración de alertas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración de alertas',
      error: error.message
    });
  }
};

/**
 * Actualizar o crear la configuración de alertas
 * @route PUT /api/settings/alerts
 */
const updateAlertSettings = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { 
      firstAlert, 
      secondAlert, 
      emailAlerts, 
      systemAlerts 
    } = req.body;

    // Validar datos requeridos
    if (firstAlert === undefined || secondAlert === undefined || 
        emailAlerts === undefined || systemAlerts === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (firstAlert, secondAlert, emailAlerts, systemAlerts)'
      });
    }

    // Validar valores numéricos para alertas (días)
    if (isNaN(firstAlert) || firstAlert < 1 || firstAlert > 30 ||
        isNaN(secondAlert) || secondAlert < 1 || secondAlert > 30) {
      return res.status(400).json({
        success: false,
        message: 'Los días de alerta deben ser números entre 1 y 30'
      });
    }

    // Validar que la primera alerta sea mayor que la segunda (más días de anticipación)
    if (firstAlert <= secondAlert) {
      return res.status(400).json({
        success: false,
        message: 'La primera alerta debe tener más días de anticipación que la segunda'
      });
    }

    // Validar valores booleanos
    if (typeof emailAlerts !== 'boolean' || typeof systemAlerts !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Los campos emailAlerts y systemAlerts deben ser valores booleanos'
      });
    }

    // Buscar si ya existe una configuración
    let alertSettings = await AlertSetting.findOne();
    
    // Si existe, actualizarla
    if (alertSettings) {
      await alertSettings.update({
        firstAlert,
        secondAlert,
        emailAlerts,
        systemAlerts
      });
      
      return res.status(200).json({
        success: true,
        data: alertSettings,
        message: 'Configuración de alertas actualizada correctamente'
      });
    } 
    // Si no existe, crearla
    else {
      alertSettings = await AlertSetting.create({
        firstAlert,
        secondAlert,
        emailAlerts,
        systemAlerts
      });
      
      return res.status(201).json({
        success: true,
        data: alertSettings,
        message: 'Configuración de alertas creada correctamente'
      });
    }
  } catch (error) {
    console.error('Error al actualizar configuración de alertas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración de alertas',
      error: error.message
    });
  }
};

module.exports = {
  getAlertSettings,
  updateAlertSettings
};
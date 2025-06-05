const { CompanySetting } = require('../models');

// Controlador para Configuración de la Empresa

/**
 * Obtener la configuración de la empresa
 * @route GET /api/settings/company
 */
const getCompanySettings = async (req, res) => {
  try {
    // Buscar la configuración de la empresa (asumimos que solo hay un registro)
    let companySettings = await CompanySetting.findOne();
    
    // Si no hay configuración, devolver un objeto vacío o un mensaje
    if (!companySettings) {
      return res.status(404).json({
        success: false,
        message: 'No se ha configurado la información de la empresa',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      data: companySettings
    });
  } catch (error) {
    console.error('Error al obtener configuración de la empresa:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración de la empresa',
      error: error.message
    });
  }
};

/**
 * Actualizar o crear la configuración de la empresa
 * @route PUT /api/settings/company
 */
const updateCompanySettings = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { name, ruc, address, phone, email } = req.body;

    // Validar datos requeridos
    if (!name || !ruc || !address || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (name, ruc, address, phone, email)'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email es inválido'
      });
    }

    // Validar RUC (11 dígitos para Perú)
    if (!/^\d{11}$/.test(ruc)) {
      return res.status(400).json({
        success: false,
        message: 'El RUC debe contener 11 dígitos numéricos'
      });
    }

    // Buscar si ya existe una configuración
    let companySettings = await CompanySetting.findOne();
    
    // Si existe, actualizarla
    if (companySettings) {
      await companySettings.update({
        name,
        ruc,
        address,
        phone,
        email
      });
      
      return res.status(200).json({
        success: true,
        data: companySettings,
        message: 'Configuración de la empresa actualizada correctamente'
      });
    } 
    // Si no existe, crearla
    else {
      companySettings = await CompanySetting.create({
        name,
        ruc,
        address,
        phone,
        email
      });
      
      return res.status(201).json({
        success: true,
        data: companySettings,
        message: 'Configuración de la empresa creada correctamente'
      });
    }
  } catch (error) {
    console.error('Error al actualizar configuración de la empresa:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración de la empresa',
      error: error.message
    });
  }
};

module.exports = {
  getCompanySettings,
  updateCompanySettings
};
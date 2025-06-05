const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

/**
 * Controlador para la autenticación de usuarios
 */

/**
 * Login de usuario
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Permitir login con email o username para compatibilidad
    const loginField = email || username;

    // Validar que se proporcionen ambos campos
    if (!loginField || !password) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere email/usuario y contraseña'
      });
    }

    // Buscar usuario en la base de datos por email o name
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: loginField },
          { name: loginField }
        ]
      }
    });

    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (user.status !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    await user.updateLastLogin();

    // Crear payload del token JWT
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Generar token JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Responder con token y datos básicos del usuario
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Verificar estado de autenticación actual
 * @route GET /api/auth/verify
 */
const verify = async (req, res) => {
  // Esta ruta simplemente devuelve el usuario actual desde req.user
  // El middleware de autenticación ya habrá verificado el token
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    message: 'Token válido'
  });
};

/**
 * Validar token de autenticación
 * @route GET /api/auth/validate
 */
const validate = async (req, res) => {
  try {
    // Si llegamos aquí, el token es válido (verificado por el middleware)
    const user = await User.findByPk(req.user.id);
    
    if (!user || user.status !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }
    
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Token válido'
    });
  } catch (error) {
    console.error('Error al validar token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  login,
  verify,
  validate
};
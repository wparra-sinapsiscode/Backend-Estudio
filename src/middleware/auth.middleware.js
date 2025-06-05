const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar tokens JWT y proteger rutas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const protect = (req, res, next) => {
  try {
    // Obtener token del encabezado Authorization
    const authHeader = req.headers.authorization;
    
    // Verificar si el token está presente
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado'
      });
    }
    
    // Extraer el token (quitar 'Bearer ')
    const token = authHeader.split(' ')[1];
    
    // Verificar token JWT
    try {
      // Decodificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      
      // Añadir información del usuario a req.user
      req.user = decoded;
      
      // Continuar con el siguiente middleware
      next();
    } catch (error) {
      // Si el token es inválido o ha expirado
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token inválido o expirado'
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar roles de usuario
 * @param {Array} roles - Array de roles permitidos
 * @returns {Function} Middleware que verifica el rol del usuario
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Verificar si req.user existe (protect middleware debe ejecutarse primero)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Usuario no autenticado'
      });
    }
    
    // Verificar si el rol del usuario está en los roles permitidos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Prohibido - No tiene permisos para esta acción'
      });
    }
    
    // Si el rol es permitido, continuar
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión y obtener token JWT
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT actual
 * @access  Private (requiere token válido)
 */
router.get('/verify', protect, authController.verify);

/**
 * @route   GET /api/auth/validate
 * @desc    Validar token JWT y estado del usuario
 * @access  Private (requiere token válido)
 */
router.get('/validate', protect, authController.validate);

module.exports = router;
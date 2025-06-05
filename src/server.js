const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, testConnection, syncModels } = require('./config/database');
const { setupAssociations } = require('./models');
const { protect } = require('./middleware/auth.middleware');

// Cargar variables de entorno
dotenv.config();

// Configurar asociaciones entre modelos
setupAssociations();

// Crear instancia de Express
const app = express();

// Middleware para parsear JSON y permitir CORS
app.use(express.json());
app.use(cors());

// Servir archivos estáticos del frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../../')));

// Puerto para el servidor
const PORT = process.env.PORT || 5000;

// Ruta base para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API de Estudio Contable - Servidor funcionando correctamente' });
});

// Rutas públicas (la ruta de login no requiere autenticación)
app.use('/api/auth', require('./routes/auth.routes'));

// Middleware de autenticación para las rutas protegidas
// Aplicamos el middleware a rutas específicas

// Rutas protegidas de la API (todas requieren autenticación)
app.use('/api/clients', protect, require('./routes/client.routes'));
app.use('/api/services', protect, require('./routes/service.routes'));
app.use('/api/contracted-services', protect, require('./routes/contracted-service.routes'));
app.use('/api/invoices', protect, require('./routes/invoice.routes'));
app.use('/api/notifications', protect, require('./routes/notification.routes'));
app.use('/api/settings/company', protect, require('./routes/companySetting.routes'));
app.use('/api/settings/alerts', protect, require('./routes/alertSetting.routes'));
app.use('/api/alerts', protect, require('./routes/alert.routes'));
app.use('/api/stats', protect, require('./routes/stats.routes'));
app.use('/api/calendar', protect, require('./routes/calendar.routes'));
// Log específico para collection-tracking
app.use('/api/collection-tracking', (req, res, next) => {
  console.log(`🔍 SERVER - Petición ${req.method} a collection-tracking:`, req.url);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('🔍 SERVER - Body:', JSON.stringify(req.body));
  }
  next();
}, protect, require('./routes/collection-tracking.routes'));

// Función para inicializar la base de datos
const initializeDatabase = async (force = false) => {
  try {
    // Verificar conexión
    const connected = await testConnection();
    if (!connected) {
      console.error('No se pudo conectar a la base de datos. Abortando...');
      return false;
    }
    
    // Sincronizar modelos con la base de datos
    // NOTA: { force: true } elimina y recrea todas las tablas - ¡Usar solo en desarrollo!
    await syncModels(force);
    
    console.log('Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return false;
  }
};

// Iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar la base de datos
    // ADVERTENCIA: Cambia el parámetro a 'true' si necesitas recrear todas las tablas
    // o usa npm run db:reset para resetear la base de datos y npm run db:seed para cargar datos de prueba
    const dbInitialized = await initializeDatabase(process.env.NODE_ENV === 'development' && process.env.DB_RESET === 'true');
    
    if (!dbInitialized) {
      console.error('No se pudo inicializar la base de datos. Abortando el inicio del servidor.');
      process.exit(1);
    }
    
    // Iniciar el servidor HTTP
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar todo el sistema
startServer();
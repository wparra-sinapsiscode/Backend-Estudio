const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a la base de datos PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development', // Mostrar logs SQL solo en desarrollo
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para verificar la conexión a la base de datos
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    return false;
  }
};

// Función para sincronizar los modelos con la base de datos
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log(`Modelos sincronizados ${force ? '(tablas recreadas)' : ''}`);
    return true;
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncModels
};
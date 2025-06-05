const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Conexión a PostgreSQL sin especificar base de datos
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Conectamos a la base de datos por defecto
  });

  try {
    console.log('Conectando a PostgreSQL...');
    await client.connect();
    
    // Verificar si la base de datos ya existe
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );
    
    if (checkDb.rows.length > 0) {
      console.log(`La base de datos '${process.env.DB_NAME}' ya existe.`);
    } else {
      // Crear la base de datos
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`Base de datos '${process.env.DB_NAME}' creada exitosamente.`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
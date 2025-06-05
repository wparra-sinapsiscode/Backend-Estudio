const { sequelize } = require('./src/config/database');

async function debugDatabase() {
  try {
    console.log('🔍 Conectando y verificando datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si existen las tablas
    console.log('\n📊 Verificando tablas...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tablas encontradas:', tables.map(t => t.table_name));

    // Verificar datos en contracted_services
    console.log('\n📋 Datos en contracted_services:');
    try {
      const [contractedServices] = await sequelize.query('SELECT * FROM contracted_services LIMIT 5;');
      console.log(`Total de registros: ${contractedServices.length}`);
      contractedServices.forEach((cs, index) => {
        console.log(`${index + 1}. ID: ${cs.id}, Cliente ID: ${cs.client_id}, Servicio ID: ${cs.service_id}, Estado: ${cs.status}`);
      });
    } catch (error) {
      console.log('❌ Error leyendo contracted_services:', error.message);
    }

    // Verificar datos en clients
    console.log('\n👥 Datos en clients:');
    try {
      const [clients] = await sequelize.query('SELECT id, name, status FROM clients LIMIT 5;');
      console.log(`Total de clientes: ${clients.length}`);
      clients.forEach((client, index) => {
        console.log(`${index + 1}. ID: ${client.id}, Nombre: ${client.name}, Estado: ${client.status}`);
      });
    } catch (error) {
      console.log('❌ Error leyendo clients:', error.message);
    }

    // Verificar datos en services
    console.log('\n🛠️ Datos en services:');
    try {
      const [services] = await sequelize.query('SELECT id, name, status FROM services LIMIT 5;');
      console.log(`Total de servicios: ${services.length}`);
      services.forEach((service, index) => {
        console.log(`${index + 1}. ID: ${service.id}, Nombre: ${service.name}, Estado: ${service.status}`);
      });
    } catch (error) {
      console.log('❌ Error leyendo services:', error.message);
    }

    // Verificar estructura de contracted_services
    console.log('\n🏗️ Estructura de contracted_services:');
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'contracted_services'
        ORDER BY ordinal_position;
      `);
      columns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('❌ Error verificando estructura:', error.message);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
}

debugDatabase();
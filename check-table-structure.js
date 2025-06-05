const { sequelize } = require('./src/config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla contracted_services...');
    await sequelize.authenticate();
    
    // Verificar estructura de la tabla
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'contracted_services'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas actuales en contracted_services:');
    results.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar datos actuales
    console.log('\n🔍 Verificando datos actuales...');
    const [currentData] = await sequelize.query('SELECT * FROM contracted_services LIMIT 3;');
    console.log('📋 Datos actuales (primeras 3 filas):', currentData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();
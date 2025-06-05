const { sequelize } = require('./src/config/database');

async function fixContractedServices() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Paso 1: Verificar estructura actual
    console.log('🔍 Verificando columnas actuales...');
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'contracted_services';
      `);
      
      const columnNames = columns.map(col => col.column_name);
      console.log('📋 Columnas existentes:', columnNames);
      
      // Paso 2: Agregar columnas faltantes si no existen
      if (!columnNames.includes('start_date')) {
        console.log('➕ Agregando columna start_date...');
        await sequelize.query('ALTER TABLE contracted_services ADD COLUMN start_date DATE;');
      }
      
      if (!columnNames.includes('next_payment')) {
        console.log('➕ Agregando columna next_payment...');
        await sequelize.query('ALTER TABLE contracted_services ADD COLUMN next_payment DATE;');
      }
      
      if (!columnNames.includes('price') && columnNames.includes('monthly_fee')) {
        console.log('🔄 Renombrando monthly_fee a price...');
        await sequelize.query('ALTER TABLE contracted_services RENAME COLUMN monthly_fee TO price;');
      } else if (!columnNames.includes('price')) {
        console.log('➕ Agregando columna price...');
        await sequelize.query('ALTER TABLE contracted_services ADD COLUMN price DECIMAL(10,2);');
      }
      
      if (!columnNames.includes('invoice_days')) {
        console.log('➕ Agregando columna invoice_days...');
        await sequelize.query('ALTER TABLE contracted_services ADD COLUMN invoice_days INTEGER DEFAULT 0;');
      }
      
    } catch (error) {
      console.log('⚠️ Error verificando columnas:', error.message);
    }

    // Paso 3: Actualizar datos existentes
    console.log('🔄 Actualizando datos existentes...');
    
    // Actualizar servicios contratados del cliente 4 con fechas de próximo pago
    await sequelize.query(`
      UPDATE contracted_services 
      SET 
        start_date = '2024-01-01',
        next_payment = CASE 
          WHEN client_id = 4 AND service_id = 2 THEN '2025-01-27'
          WHEN client_id = 4 AND service_id = 6 THEN '2025-01-29'
          WHEN client_id = 4 AND service_id = 8 THEN '2025-01-31'
          ELSE '2025-02-01'
        END,
        invoice_days = 0
      WHERE start_date IS NULL OR next_payment IS NULL;
    `);
    
    console.log('✅ Datos actualizados');

    // Paso 4: Verificar resultados
    console.log('🔍 Verificando servicios del cliente 4...');
    const [results] = await sequelize.query(`
      SELECT cs.*, c.name as client_name, s.name as service_name 
      FROM contracted_services cs
      LEFT JOIN clients c ON cs.client_id = c.id
      LEFT JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = 4;
    `);
    
    console.log('📋 Servicios del cliente 4:', results);
    
    console.log('🎉 ¡Corrección completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await sequelize.close();
  }
}

fixContractedServices();
const { sequelize } = require('./src/config/database');
const CollectionTracking = require('./src/models/collection-tracking.model');

async function createCollectionTrackingTable() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Verificando si la tabla collection_trackings existe...');
    
    // Verificar si la tabla ya existe
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'collection_trackings'
    `);
    
    if (results[0].count > 0) {
      console.log('⚠️  La tabla collection_trackings ya existe.');
      console.log('🔄 Eliminando tabla existente para recrearla con la nueva estructura...');
      await sequelize.query('DROP TABLE IF EXISTS collection_trackings CASCADE');
    }

    console.log('🔄 Creando tabla collection_trackings...');
    
    // Crear la tabla con la nueva estructura
    await sequelize.query(`
      CREATE TABLE collection_trackings (
        id SERIAL PRIMARY KEY,
        "entityType" VARCHAR(50) NOT NULL CHECK ("entityType" IN ('invoice', 'contracted_service')),
        "entityId" INTEGER NOT NULL,
        "clientId" INTEGER NOT NULL REFERENCES clients(id),
        "actionDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "actionType" TEXT NOT NULL,
        "actionDescription" TEXT NOT NULL,
        "contactMade" BOOLEAN DEFAULT FALSE,
        "clientResponse" TEXT,
        "nextActionDate" TIMESTAMP WITH TIME ZONE,
        "nextActionNotes" TEXT,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'promesa_pago', 'pagado', 'sin_respuesta', 'rechazado')),
        "promiseDate" TIMESTAMP WITH TIME ZONE,
        "promiseAmount" DECIMAL(10, 2),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    console.log('🔄 Creando índices...');
    
    // Crear índices
    await sequelize.query(`
      CREATE INDEX idx_collection_trackings_entity ON collection_trackings("entityType", "entityId");
    `);
    
    await sequelize.query(`
      CREATE INDEX idx_collection_trackings_client ON collection_trackings("clientId");
    `);
    
    await sequelize.query(`
      CREATE INDEX idx_collection_trackings_action_date ON collection_trackings("actionDate");
    `);
    
    await sequelize.query(`
      CREATE INDEX idx_collection_trackings_status ON collection_trackings(status);
    `);

    console.log('✅ Tabla collection_trackings creada exitosamente con todos los índices.');
    
    // Verificar que la tabla se creó correctamente
    const [verification] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'collection_trackings' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla creada:');
    verification.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar la migración
createCollectionTrackingTable();
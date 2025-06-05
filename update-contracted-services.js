const { sequelize } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function updateContractedServices() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Primero, eliminar los datos existentes de servicios contratados
    console.log('🗑️ Eliminando servicios contratados existentes...');
    await sequelize.query('DELETE FROM contracted_services;');
    console.log('✅ Servicios contratados eliminados');

    // Insertar los nuevos datos corregidos
    console.log('📝 Insertando servicios contratados actualizados...');
    
    const insertQuery = `
      INSERT INTO contracted_services (client_id, service_id, start_date, next_payment, price, status, invoice_days, created_at, updated_at) VALUES
      -- Cliente 1: Empresa Comercial XYZ
      (1, 1, '2024-01-01', '2025-01-25', 350.00, 'activo', 0, NOW(), NOW()),
      (1, 3, '2024-01-01', '2025-01-28', 200.00, 'activo', 0, NOW(), NOW()),

      -- Cliente 2: Consultora ABC
      (2, 2, '2024-01-01', '2025-01-30', 750.00, 'activo', 0, NOW(), NOW()),
      (2, 4, '2024-01-01', '2025-02-05', 180.00, 'activo', 0, NOW(), NOW()),

      -- Cliente 3: Importaciones DEF
      (3, 2, '2024-01-01', '2025-01-22', 750.00, 'activo', 0, NOW(), NOW()),
      (3, 3, '2024-01-01', '2025-01-24', 200.00, 'activo', 0, NOW(), NOW()),
      (3, 6, '2024-01-01', '2025-01-26', 250.00, 'activo', 0, NOW(), NOW()),

      -- Cliente 4: Soluciones Tech Perú (Cliente ID 4 - el que tenía problema)
      (4, 2, '2024-01-01', '2025-01-27', 750.00, 'activo', 0, NOW(), NOW()),
      (4, 6, '2024-01-01', '2025-01-29', 250.00, 'activo', 0, NOW(), NOW()),
      (4, 8, '2024-02-01', '2025-01-31', 150.00, 'activo', 0, NOW(), NOW()),

      -- Cliente 5: Agroindustrias El Sol
      (5, 2, '2024-01-01', '2025-02-01', 750.00, 'activo', 0, NOW(), NOW()),
      (5, 7, '2024-01-01', '2025-02-03', 400.00, 'activo', 0, NOW(), NOW()),

      -- Cliente 6: Transportes Rápidos del Norte
      (6, 1, '2024-01-01', '2025-02-07', 350.00, 'activo', 0, NOW(), NOW()),
      (6, 4, '2024-01-01', '2025-02-10', 180.00, 'activo', 0, NOW(), NOW()),

      -- Cliente 7: Constructora Andina
      (7, 2, '2024-01-01', '2025-02-15', 750.00, 'activo', 0, NOW(), NOW()),
      (7, 6, '2024-01-01', '2025-02-18', 250.00, 'activo', 0, NOW(), NOW()),
      (7, 10, '2024-06-01', '2025-02-20', 1200.00, 'activo', 0, NOW(), NOW()),

      -- Servicios adicionales para otros clientes
      (8, 1, '2024-01-01', '2025-03-01', 350.00, 'activo', 0, NOW(), NOW()),
      (9, 1, '2024-01-01', '2025-03-05', 350.00, 'activo', 0, NOW(), NOW()),
      (10, 1, '2024-01-01', '2025-03-10', 350.00, 'activo', 0, NOW(), NOW()),
      (11, 2, '2024-01-01', '2025-03-15', 750.00, 'activo', 0, NOW(), NOW()),
      (12, 1, '2024-01-01', '2025-03-20', 350.00, 'activo', 0, NOW(), NOW()),
      (13, 2, '2024-01-01', '2025-03-25', 750.00, 'activo', 0, NOW(), NOW());
    `;

    await sequelize.query(insertQuery);
    console.log('✅ Servicios contratados insertados correctamente');

    // Verificar los datos
    console.log('🔍 Verificando servicios contratados del cliente 4...');
    const [results] = await sequelize.query(`
      SELECT cs.*, c.name as client_name, s.name as service_name 
      FROM contracted_services cs
      LEFT JOIN clients c ON cs.client_id = c.id
      LEFT JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = 4;
    `);
    
    console.log('📋 Servicios del cliente 4:', results);

    console.log('🎉 ¡Actualización completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la actualización
updateContractedServices();
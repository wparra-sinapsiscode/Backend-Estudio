const sequelize = require('../config/database');
const { 
  Client, 
  Service, 
  ContractedService, 
  Invoice,
  User 
} = require('../models');

async function seedVencidosTest() {
  console.log('🌱 Iniciando seed de prueba para vencidos...');
  
  try {
    // Verificar que existe un usuario admin
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      console.error('❌ No se encontró usuario admin. Ejecuta primero: npm run seed:user');
      process.exit(1);
    }

    // Obtener fecha actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Crear clientes de prueba
    console.log('📁 Creando clientes de prueba...');
    
    const clientes = [
      {
        name: 'Empresa Próxima Vencer S.A.C.',
        ruc: '20123456789',
        email: 'proxima@ejemplo.com',
        phone: '999111222',
        address: 'Av. Próxima 123',
        taxRegime: 'general',
        status: 'activo',
        joinDate: new Date()
      },
      {
        name: 'Negocio Urgente E.I.R.L.',
        ruc: '20234567890',
        email: 'urgente@ejemplo.com',
        phone: '999222333',
        address: 'Jr. Urgente 456',
        taxRegime: 'especial',
        status: 'activo',
        joinDate: new Date()
      },
      {
        name: 'Comercial Vencida S.A.',
        ruc: '20345678901',
        email: 'vencida@ejemplo.com',
        phone: '999333444',
        address: 'Calle Vencida 789',
        taxRegime: 'general',
        status: 'activo',
        joinDate: new Date()
      },
      {
        name: 'Servicios Morosos S.R.L.',
        ruc: '20456789012',
        email: 'morosos@ejemplo.com',
        phone: '999444555',
        address: 'Av. Morosos 321',
        taxRegime: 'mype',
        status: 'activo',
        joinDate: new Date()
      }
    ];

    const clientesCreados = await Client.bulkCreate(clientes);
    console.log(`✅ ${clientesCreados.length} clientes creados`);

    // 2. Obtener servicios existentes
    const servicios = await Service.findAll({ limit: 3 });
    if (servicios.length === 0) {
      console.error('❌ No hay servicios en la base de datos');
      process.exit(1);
    }

    // 3. Crear facturas con diferentes estados de vencimiento
    console.log('📄 Creando facturas con diferentes vencimientos...');

    const facturas = [
      {
        // Factura que vence en 12 días
        clientId: clientesCreados[0].id,
        serviceId: servicios[0].id,
        number: 'F002-001',
        issueDate: today,
        dueDate: new Date(today.getTime() + (12 * 24 * 60 * 60 * 1000)), // +12 días
        amount: 850.00,
        status: 'pendiente',
        documentType: 'factura',
        paidAmount: 0,
        payments: []
      },
      {
        // Factura que vence en 3 días (urgente)
        clientId: clientesCreados[1].id,
        serviceId: servicios[1].id,
        number: 'F002-002',
        issueDate: new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)), // Emitida hace 7 días
        dueDate: new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)), // +3 días
        amount: 450.00,
        status: 'pendiente',
        documentType: 'factura',
        paidAmount: 100.00, // Pago parcial
        payments: [{
          id: 1,
          date: new Date(today.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
          amount: 100,
          method: 'transferencia',
          notes: 'Pago parcial'
        }]
      },
      {
        // Factura vencida hace 4 días
        clientId: clientesCreados[2].id,
        serviceId: servicios[2].id,
        number: 'F002-003',
        issueDate: new Date(today.getTime() - (20 * 24 * 60 * 60 * 1000)), // Emitida hace 20 días
        dueDate: new Date(today.getTime() - (4 * 24 * 60 * 60 * 1000)), // Venció hace 4 días
        amount: 650.00,
        status: 'pendiente',
        documentType: 'factura',
        paidAmount: 0,
        payments: []
      },
      {
        // Factura vencida hace 10 días (crítica)
        clientId: clientesCreados[3].id,
        serviceId: servicios[0].id,
        number: 'F002-004',
        issueDate: new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)), // Emitida hace 30 días
        dueDate: new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000)), // Venció hace 10 días
        amount: 1200.00,
        status: 'pendiente',
        documentType: 'factura',
        paidAmount: 0,
        payments: []
      }
    ];

    const facturasCreadas = await Invoice.bulkCreate(facturas);
    console.log(`✅ ${facturasCreadas.length} facturas creadas con diferentes vencimientos`);

    // 4. Crear servicios contratados con vencimientos
    console.log('📋 Creando servicios contratados...');

    const serviciosContratados = [
      {
        // Servicio que vence en 5 días
        clientId: clientesCreados[0].id,
        serviceId: servicios[1].id,
        startDate: new Date(today.getTime() - (25 * 24 * 60 * 60 * 1000)), // Hace 25 días
        nextPayment: new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)), // En 5 días
        frequency: 'mensual',
        price: 350.00,
        status: 'activo',
        autoRenew: true
      },
      {
        // Servicio vencido hace 7 días
        clientId: clientesCreados[2].id,
        serviceId: servicios[0].id,
        startDate: new Date(today.getTime() - (37 * 24 * 60 * 60 * 1000)), // Hace 37 días
        nextPayment: new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)), // Venció hace 7 días
        frequency: 'mensual',
        price: 550.00,
        status: 'activo',
        autoRenew: true
      }
    ];

    const serviciosContratadosCreados = await ContractedService.bulkCreate(serviciosContratados);
    console.log(`✅ ${serviciosContratadosCreados.length} servicios contratados creados`);

    // Resumen
    console.log('\n📊 Resumen de datos creados para pruebas:');
    console.log('--------------------------------------------');
    console.log('🟢 Próximos a vencer (no aparecen en vencidos):');
    console.log('   - Empresa Próxima Vencer: Factura vence en 12 días');
    console.log('   - Negocio Urgente: Factura vence en 3 días');
    console.log('\n🔴 VENCIDOS (aparecerán en la sección):');
    console.log('   - Comercial Vencida: Factura vencida hace 4 días (S/. 650)');
    console.log('   - Comercial Vencida: Servicio vencido hace 7 días (S/. 550)');
    console.log('   - Servicios Morosos: Factura vencida hace 10 días (S/. 1,200)');
    console.log('--------------------------------------------\n');

    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar el seed
seedVencidosTest();
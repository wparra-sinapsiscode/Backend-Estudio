const { sequelize } = require('../config/database');
const Client = require('../models/client.model');
const Service = require('../models/service.model');
const ContractedService = require('../models/contracted-service.model');
const Invoice = require('../models/invoice.model');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seeder de clientes reales...');

    // Crear servicios típicos de un estudio contable
    const services = await Service.bulkCreate([
      {
        name: 'Contabilidad Mensual',
        type: 'mensual',
        price: 800.00,
        description: 'Registro de operaciones, libros contables y estados financieros mensuales'
      },
      {
        name: 'Declaración de IGV',
        type: 'mensual',
        price: 200.00,
        description: 'Elaboración y presentación de declaración mensual de IGV'
      },
      {
        name: 'Planilla de Trabajadores',
        type: 'mensual',
        price: 150.00,
        description: 'Cálculo y presentación de planilla de trabajadores'
      },
      {
        name: 'Renta Anual',
        type: 'temporal',
        price: 1500.00,
        description: 'Declaración anual de renta de tercera categoría'
      },
      {
        name: 'Asesoría Tributaria',
        type: 'mensual',
        price: 400.00,
        description: 'Consultas y asesoramiento en temas tributarios'
      },
      {
        name: 'Constitución de Empresa',
        type: 'temporal',
        price: 2000.00,
        description: 'Trámites completos para constitución de empresa'
      },
      {
        name: 'Libros Electrónicos',
        type: 'mensual',
        price: 300.00,
        description: 'Envío de libros electrónicos a SUNAT'
      }
    ]);

    console.log('✅ Servicios creados');

    // Crear 6 clientes con datos realistas
    const today = new Date();
    
    const clients = await Client.bulkCreate([
      {
        name: 'Comercial San Pedro SAC',
        ruc: '20123456789',
        phone: '987654321',
        email: 'admin@comercialsanpedro.com',
        address: 'Av. Javier Prado 1234, Lima',
        status: 'activo',
        joinDate: '2023-01-15'
      },
      {
        name: 'Distribuidora Los Andes EIRL',
        ruc: '20234567890',
        phone: '987654322',
        email: 'contabilidad@losandes.com',
        address: 'Jr. Huancavelica 567, Lima',
        status: 'activo',
        joinDate: '2023-03-10'
      },
      {
        name: 'Inversiones del Norte SRL',
        ruc: '20345678901',
        phone: '987654323',
        email: 'finanzas@invnorte.pe',
        address: 'Calle Las Flores 890, San Isidro',
        status: 'activo',
        joinDate: '2023-06-20'
      },
      {
        name: 'Textiles Lima SAC',
        ruc: '20456789012',
        phone: '987654324',
        email: 'gerencia@textileslima.com',
        address: 'Av. Argentina 1567, Callao',
        status: 'activo',
        joinDate: '2023-02-28'
      },
      {
        name: 'Servicios Generales El Sol EIRL',
        ruc: '20567890123',
        phone: '987654325',
        email: 'admin@elsol.pe',
        address: 'Jr. Lampa 234, Lima Centro',
        status: 'activo',
        joinDate: '2023-08-15'
      },
      {
        name: 'Construcciones Modernas SAC',
        ruc: '20678901234',
        phone: '987654326',
        email: 'proyectos@consmodernas.com',
        address: 'Av. El Sol 789, Surquillo',
        status: 'activo',
        joinDate: '2023-05-12'
      }
    ]);

    console.log('✅ Clientes creados');

    // Función para calcular fechas
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result.toISOString().split('T')[0];
    };

    const subtractDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result.toISOString().split('T')[0];
    };

    // Crear servicios contratados y facturas con diferentes estados
    const contractedServices = [];
    const invoices = [];

    // Cliente 1: Comercial San Pedro SAC - VENCIDO (10 días)
    contractedServices.push({
      clientId: clients[0].id,
      serviceId: services[0].id, // Contabilidad Mensual
      startDate: '2023-01-15',
      nextPayment: subtractDays(today, 10),
      price: 800.00,
      status: 'alerta',
      invoiceDays: 10
    });

    invoices.push({
      number: 'F001-00001',
      clientId: clients[0].id,
      serviceId: services[0].id,
      issueDate: subtractDays(today, 40),
      dueDate: subtractDays(today, 10),
      amount: 800.00,
      status: 'vencida',
      documentType: 'factura',
      paidAmount: 0,
      payments: [],
      overdueAlertSent: true
    });

    // Cliente 2: Distribuidora Los Andes EIRL - VENCIDO (5 días)
    contractedServices.push({
      clientId: clients[1].id,
      serviceId: services[1].id, // IGV
      startDate: '2023-03-10',
      nextPayment: subtractDays(today, 5),
      price: 200.00,
      status: 'alerta',
      invoiceDays: 5
    });

    invoices.push({
      number: 'F001-00002',
      clientId: clients[1].id,
      serviceId: services[1].id,
      issueDate: subtractDays(today, 35),
      dueDate: subtractDays(today, 5),
      amount: 200.00,
      status: 'vencida',
      documentType: 'factura',
      paidAmount: 0,
      payments: [],
      overdueAlertSent: true
    });

    // Cliente 3: Inversiones del Norte SRL - VENCIDO (15 días)
    contractedServices.push({
      clientId: clients[2].id,
      serviceId: services[2].id, // Planilla
      startDate: '2023-06-20',
      nextPayment: subtractDays(today, 15),
      price: 150.00,
      status: 'alerta',
      invoiceDays: 15
    });

    invoices.push({
      number: 'F001-00003',
      clientId: clients[2].id,
      serviceId: services[2].id,
      issueDate: subtractDays(today, 45),
      dueDate: subtractDays(today, 15),
      amount: 150.00,
      status: 'vencida',
      documentType: 'factura',
      paidAmount: 0,
      payments: [],
      overdueAlertSent: true
    });

    // Cliente 4: Textiles Lima SAC - Por vencer en 3 días
    contractedServices.push({
      clientId: clients[3].id,
      serviceId: services[0].id, // Contabilidad
      startDate: '2023-02-28',
      nextPayment: addDays(today, 3),
      price: 800.00,
      status: 'pendiente',
      invoiceDays: 0
    });

    invoices.push({
      number: 'F001-00004',
      clientId: clients[3].id,
      serviceId: services[0].id,
      issueDate: subtractDays(today, 27),
      dueDate: addDays(today, 3),
      amount: 800.00,
      status: 'pendiente',
      documentType: 'factura',
      paidAmount: 0,
      payments: [],
      firstAlertSent: true
    });

    // Cliente 5: Servicios Generales El Sol EIRL - Por vencer en 6 días
    contractedServices.push({
      clientId: clients[4].id,
      serviceId: services[4].id, // Asesoría
      startDate: '2023-08-15',
      nextPayment: addDays(today, 6),
      price: 400.00,
      status: 'pendiente',
      invoiceDays: 0
    });

    invoices.push({
      number: 'F001-00005',
      clientId: clients[4].id,
      serviceId: services[4].id,
      issueDate: subtractDays(today, 24),
      dueDate: addDays(today, 6),
      amount: 400.00,
      status: 'pendiente',
      documentType: 'factura',
      paidAmount: 0,
      payments: []
    });

    // Cliente 6: Construcciones Modernas SAC - Vencimiento lejano (24 días)
    contractedServices.push({
      clientId: clients[5].id,
      serviceId: services[6].id, // Libros Electrónicos
      startDate: '2023-05-12',
      nextPayment: addDays(today, 24),
      price: 300.00,
      status: 'activo',
      invoiceDays: 0
    });

    invoices.push({
      number: 'F001-00006',
      clientId: clients[5].id,
      serviceId: services[6].id,
      issueDate: subtractDays(today, 6),
      dueDate: addDays(today, 24),
      amount: 300.00,
      status: 'pendiente',
      documentType: 'factura',
      paidAmount: 0,
      payments: []
    });

    // Agregar segundo servicio para cliente 6 con vencimiento a 27 días
    contractedServices.push({
      clientId: clients[5].id,
      serviceId: services[1].id, // IGV
      startDate: '2023-05-12',
      nextPayment: addDays(today, 27),
      price: 200.00,
      status: 'activo',
      invoiceDays: 0
    });

    invoices.push({
      number: 'F001-00007',
      clientId: clients[5].id,
      serviceId: services[1].id,
      issueDate: subtractDays(today, 3),
      dueDate: addDays(today, 27),
      amount: 200.00,
      status: 'pendiente',
      documentType: 'factura',
      paidAmount: 0,
      payments: []
    });

    // Crear servicios contratados
    await ContractedService.bulkCreate(contractedServices);
    console.log('✅ Servicios contratados creados');

    // Crear facturas
    await Invoice.bulkCreate(invoices);
    console.log('✅ Facturas creadas');

    console.log('🎉 Seeder completado exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log('- 7 Servicios');
    console.log('- 6 Clientes');
    console.log('- 7 Servicios contratados');
    console.log('- 7 Facturas');
    console.log('\n💰 Estados de facturación:');
    console.log('- 3 Clientes con facturas vencidas (10, 5, 15 días)');
    console.log('- 2 Clientes próximos a vencer (3 y 6 días)');
    console.log('- 1 Cliente con vencimientos lejanos (24 y 27 días)');

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
  }
};

// Ejecutar el seeder si es llamado directamente
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeder ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando seeder:', error);
      process.exit(1);
    });
}

module.exports = seedData;
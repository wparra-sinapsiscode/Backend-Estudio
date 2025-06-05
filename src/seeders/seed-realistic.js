const { sequelize } = require("../config/database");
const {
  User,
  Client,
  Service,
  ContractedService,
  Invoice,
  Notification,
  CompanySetting,
  AlertSetting,
} = require("../models");
const { setupAssociations } = require("../models");

// Configurar asociaciones entre modelos
setupAssociations();

// Datos de prueba realistas
const seedRealisticData = async () => {
  try {
    console.log("Iniciando carga de datos realistas...");

    // Usuario administrador
    await User.create({
      name: "María González",
      email: "maria.gonzalez@estudicontable.pe",
      password: "admin123",
      role: "admin",
      status: "activo"
    });
    console.log("✓ Usuario administrador creado");

    // Configuración de la empresa
    await CompanySetting.create({
      name: "Estudio Contable González & Asociados",
      ruc: "20601234567",
      address: "Av. Javier Prado Este 4200, Surquillo, Lima",
      phone: "01-447-8900",
      email: "contacto@gonzalezcontadores.pe",
    });
    console.log("✓ Configuración de empresa creada");

    // Configuración de alertas
    await AlertSetting.create({
      firstAlert: 10,
      secondAlert: 3,
      emailAlerts: true,
      systemAlerts: true,
    });
    console.log("✓ Configuración de alertas creada");

    // Servicios contables realistas
    const services = await Service.bulkCreate([
      {
        name: "Declaración Mensual PDT",
        description: "Declaración mensual de IGV, Renta e ITAN mediante PDT",
        price: 180.0,
        type: "mensual",
      },
      {
        name: "Contabilidad Completa PYME",
        description: "Servicio integral de contabilidad para pequeñas y medianas empresas",
        price: 650.0,
        type: "mensual",
      },
      {
        name: "Planilla Electrónica",
        description: "Elaboración y presentación de planillas de remuneraciones",
        price: 25.0,
        type: "mensual",
      },
      {
        name: "Libros Electrónicos",
        description: "Generación y envío de libros electrónicos a SUNAT",
        price: 120.0,
        type: "mensual",
      },
      {
        name: "Declaración Anual de Renta",
        description: "Preparación y presentación de declaración jurada anual",
        price: 800.0,
        type: "temporal",
      },
      {
        name: "Auditoría Financiera",
        description: "Auditoría externa de estados financieros",
        price: 3500.0,
        type: "temporal",
      },
      {
        name: "Constitución de Empresa",
        description: "Trámite completo de constitución de empresa ante SUNARP y SUNAT",
        price: 450.0,
        type: "temporal",
      },
      {
        name: "Asesoría Tributaria",
        description: "Consultoría especializada en temas tributarios",
        price: 200.0,
        type: "mensual",
      },
      {
        name: "Estados Financieros",
        description: "Elaboración de estados financieros mensuales",
        price: 300.0,
        type: "mensual",
      },
      {
        name: "Fraccionamiento Tributario",
        description: "Gestión de fraccionamiento de deudas tributarias",
        price: 350.0,
        type: "temporal",
      }
    ]);
    console.log("✓ Servicios creados");

    // Clientes realistas con RUCs válidos
    const clients = await Client.bulkCreate([
      {
        name: "Distribuidora San Martin S.A.C.",
        ruc: "20601789123",
        phone: "01-234-5678",
        email: "gerencia@distsanmartin.com",
        address: "Jr. Ucayali 456, Cercado de Lima",
        status: "activo",
        joinDate: new Date("2021-03-15"),
      },
      {
        name: "Constructora Los Andes E.I.R.L.",
        ruc: "20512345678",
        phone: "01-567-8901",
        email: "admin@constructoralosandes.pe",
        address: "Av. Universitaria 1234, San Martín de Porres",
        status: "activo",
        joinDate: new Date("2020-07-22"),
      },
      {
        name: "Inversiones Pacífico S.R.L.",
        ruc: "20456789012",
        phone: "01-890-1234",
        email: "inversiones@pacifico.com.pe",
        address: "Av. Benavides 2890, Miraflores",
        status: "activo",
        joinDate: new Date("2022-01-10"),
      },
      {
        name: "Comercial El Dorado S.A.",
        ruc: "20387654321",
        phone: "01-345-6789",
        email: "ventas@eldoradocomercial.pe",
        address: "Av. Argentina 1567, Callao",
        status: "activo",
        joinDate: new Date("2019-11-05"),
      },
      {
        name: "Servicios Integrales Norte S.A.C.",
        ruc: "20678901234",
        phone: "01-456-7890",
        email: "contacto@serviciosnorte.com",
        address: "Av. Túpac Amaru 3456, Independencia",
        status: "activo",
        joinDate: new Date("2023-02-18"),
      },
      {
        name: "Textiles Lima S.R.L.",
        ruc: "20234567890",
        phone: "01-567-8902",
        email: "gerencia@textileslima.pe",
        address: "Av. Colonial 789, Pueblo Libre",
        status: "activo",
        joinDate: new Date("2020-09-12"),
      },
      {
        name: "Transportes Rápidos S.A.C.",
        ruc: "20345678901",
        phone: "01-678-9012",
        email: "operaciones@transportesrapidos.com",
        address: "Av. Néstor Gambetta 1200, Callao",
        status: "activo",
        joinDate: new Date("2021-06-30"),
      },
      {
        name: "Consultoría Empresarial Sigma E.I.R.L.",
        ruc: "20123456789",
        phone: "01-789-0123",
        email: "info@sigmaconsultoria.pe",
        address: "Av. Arequipa 2456, Lince",
        status: "activo",
        joinDate: new Date("2022-04-08"),
      },
      {
        name: "Restaurante La Tradición S.R.L.",
        ruc: "20567890123",
        phone: "01-890-1235",
        email: "administracion@latradicion.pe",
        address: "Av. La Marina 890, San Miguel",
        status: "activo",
        joinDate: new Date("2021-12-03"),
      },
      {
        name: "Farmacia Salud Total S.A.C.",
        ruc: "20456123789",
        phone: "01-234-5679",
        email: "gerencia@saludtotal.com.pe",
        address: "Av. Brasil 1456, Breña",
        status: "activo",
        joinDate: new Date("2020-08-20"),
      }
    ]);
    console.log("✓ Clientes creados");

    // Servicios contratados con mayor variedad
    const today = new Date();
    const contractedServices = [];
    
    // Cliente 1: Distribuidora San Martin - Servicios completos
    contractedServices.push(
      {
        clientId: clients[0].id,
        serviceId: services[0].id, // PDT Mensual
        startDate: new Date(2021, 2, 15),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        status: "activo",
        price: services[0].price,
        invoiceDays: 15,
        observations: "Cliente premium con descuento del 5%",
      },
      {
        clientId: clients[0].id,
        serviceId: services[1].id, // Contabilidad completa
        startDate: new Date(2021, 2, 15),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        status: "activo",
        price: 617.5, // Con descuento
        invoiceDays: 15,
        observations: "Descuento aplicado por contrato múltiple",
      },
      {
        clientId: clients[0].id,
        serviceId: services[3].id, // Libros electrónicos
        startDate: new Date(2021, 2, 15),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        status: "activo",
        price: services[3].price,
        invoiceDays: 15,
        observations: "",
      }
    );

    // Cliente 2: Constructora Los Andes
    contractedServices.push(
      {
        clientId: clients[1].id,
        serviceId: services[0].id, // PDT Mensual
        startDate: new Date(2020, 6, 22),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 22),
        status: "activo",
        price: services[0].price,
        invoiceDays: 22,
        observations: "Facturación el 22 de cada mes",
      },
      {
        clientId: clients[1].id,
        serviceId: services[2].id, // Planilla
        startDate: new Date(2020, 6, 22),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 22),
        status: "activo",
        price: 75.0, // 3 trabajadores
        invoiceDays: 22,
        observations: "Planilla para 3 trabajadores",
      }
    );

    // Cliente 3: Inversiones Pacífico
    contractedServices.push(
      {
        clientId: clients[2].id,
        serviceId: services[1].id, // Contabilidad completa
        startDate: new Date(2022, 0, 10),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 10),
        status: "activo",
        price: services[1].price,
        invoiceDays: 10,
        observations: "Empresa de inversiones - requiere reportes detallados",
      },
      {
        clientId: clients[2].id,
        serviceId: services[7].id, // Asesoría tributaria
        startDate: new Date(2022, 0, 10),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 10),
        status: "activo",
        price: services[7].price,
        invoiceDays: 10,
        observations: "Consultas frecuentes sobre estructura tributaria",
      }
    );

    // Cliente 4: Comercial El Dorado
    contractedServices.push(
      {
        clientId: clients[3].id,
        serviceId: services[0].id, // PDT Mensual
        startDate: new Date(2019, 10, 5),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        status: "activo",
        price: services[0].price,
        invoiceDays: 5,
        observations: "Cliente antiguo - tarifa preferencial",
      },
      {
        clientId: clients[3].id,
        serviceId: services[8].id, // Estados financieros
        startDate: new Date(2019, 10, 5),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        status: "activo",
        price: services[8].price,
        invoiceDays: 5,
        observations: "",
      }
    );

    // Resto de clientes con servicios variados
    contractedServices.push(
      // Cliente 5: Servicios Integrales Norte
      {
        clientId: clients[4].id,
        serviceId: services[0].id, // PDT Mensual
        startDate: new Date(2023, 1, 18),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 18),
        status: "activo",
        price: services[0].price,
        invoiceDays: 18,
        observations: "Cliente nuevo",
      },
      // Cliente 6: Textiles Lima
      {
        clientId: clients[5].id,
        serviceId: services[1].id, // Contabilidad completa
        startDate: new Date(2020, 8, 12),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 12),
        status: "activo",
        price: services[1].price,
        invoiceDays: 12,
        observations: "Industria textil - inventarios especiales",
      },
      // Cliente 7: Transportes Rápidos
      {
        clientId: clients[6].id,
        serviceId: services[0].id, // PDT Mensual
        startDate: new Date(2021, 5, 30),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 30),
        status: "activo",
        price: services[0].price,
        invoiceDays: 30,
        observations: "Empresa de transporte",
      },
      {
        clientId: clients[6].id,
        serviceId: services[2].id, // Planilla
        startDate: new Date(2021, 5, 30),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 30),
        status: "activo",
        price: 125.0, // 5 trabajadores
        invoiceDays: 30,
        observations: "Planilla para 5 conductores",
      },
      // Cliente 8: Consultoría Sigma - Solo temporal
      {
        clientId: clients[7].id,
        serviceId: services[7].id, // Asesoría tributaria
        startDate: new Date(2022, 3, 8),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 8),
        status: "activo",
        price: services[7].price,
        invoiceDays: 8,
        observations: "Consultoría especializada",
      },
      // Cliente 9: Restaurante La Tradición
      {
        clientId: clients[8].id,
        serviceId: services[0].id, // PDT Mensual
        startDate: new Date(2021, 11, 3),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 3),
        status: "activo",
        price: services[0].price,
        invoiceDays: 3,
        observations: "Sector gastronómico",
      },
      // Cliente 10: Farmacia Salud Total
      {
        clientId: clients[9].id,
        serviceId: services[0].id, // PDT Mensual
        startDate: new Date(2020, 7, 20),
        nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        status: "activo",
        price: services[0].price,
        invoiceDays: 20,
        observations: "Sector farmacéutico - regulaciones especiales",
      }
    );

    await ContractedService.bulkCreate(contractedServices);
    console.log("✓ Servicios contratados creados");

    // Facturas realistas con varios estados
    const invoices = [];
    let invoiceNumber = 1;

    // Generar facturas para los últimos 6 meses
    for (let month = 5; month >= 0; month--) {
      const issueDate = new Date(today.getFullYear(), today.getMonth() - month, 1);
      
      // Facturas para cada servicio contratado activo
      for (const cs of contractedServices) {
        if (cs.startDate <= issueDate) {
          const dueDate = new Date(issueDate);
          dueDate.setDate(dueDate.getDate() + 15);
          
          let status = "pagada";
          let paidAmount = cs.price;
          let payments = [];
          
          // Los últimos 2 meses tienen facturas pendientes/vencidas
          if (month <= 1) {
            if (Math.random() > 0.7) {
              status = "pendiente";
              paidAmount = 0;
              payments = [];
            } else if (Math.random() > 0.5) {
              status = "pagada";
              const paymentDate = new Date(dueDate);
              paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 10));
              payments = [{
                id: 1,
                date: paymentDate.toISOString().split("T")[0],
                amount: cs.price,
                method: Math.random() > 0.5 ? "transferencia" : "efectivo",
                voucher: null,
                notes: `Pago ${Math.random() > 0.5 ? "transferencia" : "efectivo"} - OP-${Math.floor(Math.random() * 10000)}`
              }];
            }
          } else {
            // Meses anteriores - mayoría pagadas
            const paymentDate = new Date(dueDate);
            paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 5));
            payments = [{
              id: 1,
              date: paymentDate.toISOString().split("T")[0],
              amount: cs.price,
              method: Math.random() > 0.3 ? "transferencia" : "efectivo",
              voucher: null,
              notes: `Pago ${Math.random() > 0.3 ? "transferencia" : "efectivo"} - OP-${Math.floor(Math.random() * 10000)}`
            }];
          }

          if (dueDate < today && status === "pendiente") {
            status = "vencida";
          }

          invoices.push({
            number: `F001-${String(invoiceNumber).padStart(5, '0')}`,
            clientId: cs.clientId,
            serviceId: cs.serviceId,
            issueDate: issueDate,
            dueDate: dueDate,
            amount: cs.price,
            status: status,
            documentType: "factura",
            paidAmount: paidAmount,
            payments: payments,
            firstAlertSent: month <= 1 && status !== "pagada" ? Math.random() > 0.5 : false,
            secondAlertSent: month <= 1 && status === "vencida" ? Math.random() > 0.3 : false,
            overdueAlertSent: status === "vencida" ? Math.random() > 0.7 : false,
          });
          
          invoiceNumber++;
        }
      }
    }

    await Invoice.bulkCreate(invoices);
    console.log("✓ Facturas creadas");

    // Notificaciones realistas
    const notifications = [];
    
    // Buscar facturas vencidas y pendientes para notificaciones
    const pendingInvoices = invoices.filter(inv => inv.status === "pendiente" || inv.status === "vencida");
    
    for (let i = 0; i < Math.min(pendingInvoices.length, 5); i++) {
      const invoice = pendingInvoices[i];
      const client = clients.find(c => c.id === invoice.clientId);
      
      notifications.push({
        title: invoice.status === "vencida" ? "Factura vencida" : "Factura por vencer",
        message: `Cliente ${client.name} tiene una factura ${invoice.status} por S/ ${invoice.amount}`,
        type: invoice.status === "vencida" ? "danger" : "warning",
        read: Math.random() > 0.7,
        relatedSection: "invoices",
        relatedId: invoice.id || null,
      });
    }

    // Notificaciones de próximas facturaciones
    for (let i = 0; i < 3; i++) {
      const cs = contractedServices[i];
      const client = clients.find(c => c.id === cs.clientId);
      notifications.push({
        title: "Próxima facturación",
        message: `Se aproxima la fecha de facturación para ${client.name}`,
        type: "info",
        read: Math.random() > 0.5,
        relatedSection: "contracted_services",
        relatedId: cs.id || null,
      });
    }

    await Notification.bulkCreate(notifications);
    console.log("✓ Notificaciones creadas");

    console.log("Datos realistas cargados correctamente");
    console.log(`- ${clients.length} clientes creados`);
    console.log(`- ${services.length} servicios creados`);
    console.log(`- ${contractedServices.length} servicios contratados`);
    console.log(`- ${invoices.length} facturas generadas`);
    console.log(`- ${notifications.length} notificaciones creadas`);
    
    return true;
  } catch (error) {
    console.error("Error al cargar datos realistas:", error);
    return false;
  }
};

// Función principal para resetear la base de datos y cargar datos realistas
const resetAndSeedDatabase = async () => {
  try {
    // Sincronizar modelos (eliminar y recrear tablas)
    await sequelize.sync({ force: true });
    console.log("Base de datos reiniciada correctamente");

    // Cargar datos realistas
    await seedRealisticData();

    console.log("Proceso de carga de datos realistas completado correctamente");
    process.exit(0);
  } catch (error) {
    console.error("Error en el proceso de reseteo y carga:", error);
    process.exit(1);
  }
};

// Ejecutar el proceso si se llama directamente
if (require.main === module) {
  resetAndSeedDatabase();
}

module.exports = { seedRealisticData, resetAndSeedDatabase };
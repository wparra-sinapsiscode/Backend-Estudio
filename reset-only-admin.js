const { sequelize } = require("./src/config/database");
const {
  User,
  Client,
  Service,
  ContractedService,
  Invoice,
  Notification,
  CompanySetting,
  AlertSetting,
} = require("./src/models");
const { setupAssociations } = require("./src/models");

// Configurar asociaciones entre modelos
setupAssociations();

const resetWithAdminOnly = async () => {
  try {
    console.log("Iniciando reseteo de base de datos...");

    // Sincronizar modelos (eliminar y recrear tablas)
    await sequelize.sync({ force: true });
    console.log("✓ Base de datos reiniciada correctamente");

    // Crear solo el usuario administrador
    await User.create({
      name: "Administrador",
      email: "admin@sistema.com",
      password: "admin123",
      role: "admin",
      status: "activo"
    });
    console.log("✓ Usuario administrador creado");

    // Crear configuración básica de alertas
    await AlertSetting.create({
      firstAlert: 10,
      secondAlert: 5,
      emailAlerts: true,
      systemAlerts: true,
    });
    console.log("✓ Configuración básica de alertas creada");

    console.log("\n=== BASE DE DATOS LISTA ===");
    console.log("Usuario: admin@sistema.com");
    console.log("Contraseña: admin123");
    console.log("Ahora puedes configurar tus servicios y clientes reales");
    
    process.exit(0);
  } catch (error) {
    console.error("Error en el proceso de reseteo:", error);
    process.exit(1);
  }
};

// Ejecutar el proceso si se llama directamente
if (require.main === module) {
  resetWithAdminOnly();
}

module.exports = { resetWithAdminOnly };
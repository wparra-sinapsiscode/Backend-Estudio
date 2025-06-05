const { sequelize } = require("../config/database");
const { User } = require("../models");
const { setupAssociations } = require("../models");

// Configurar asociaciones entre modelos
setupAssociations();

// Crear solo el usuario administrador
const seedUserOnly = async () => {
  try {
    console.log("Iniciando carga solo del usuario administrador...");

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: { email: "maria.gonzalez@estudicontable.pe" }
    });

    if (existingUser) {
      console.log("✓ Usuario administrador ya existe");
    } else {
      // Usuario administrador
      await User.create({
        name: "María González",
        email: "maria.gonzalez@estudicontable.pe",
        password: "admin123",
        role: "admin",
        status: "activo"
      });
      console.log("✓ Usuario administrador creado");
    }

    console.log("Usuario administrador cargado correctamente");
    return true;
  } catch (error) {
    console.error("Error al cargar el usuario:", error);
    return false;
  }
};

// Función principal para cargar solo el usuario
const seedUserDatabase = async () => {
  try {
    // Cargar solo el usuario
    await seedUserOnly();

    console.log("Proceso de carga del usuario completado correctamente");
    process.exit(0);
  } catch (error) {
    console.error("Error en el proceso de carga del usuario:", error);
    process.exit(1);
  }
};

// Ejecutar el proceso si se llama directamente
if (require.main === module) {
  seedUserDatabase();
}

module.exports = { seedUserOnly, seedUserDatabase };
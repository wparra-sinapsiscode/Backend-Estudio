/**
 * Utilidades para limpieza de archivos del sistema
 */
const fs = require('fs');
const path = require('path');

/**
 * Elimina un archivo si existe
 * @param {string} filePath - Ruta relativa del archivo desde la raíz del proyecto
 */
const deleteFileIfExists = (filePath) => {
  try {
    if (!filePath) return false;
    
    // Construir ruta absoluta
    const absolutePath = path.join(__dirname, '../..', filePath);
    
    // Verificar si el archivo existe
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`🗑️ Archivo eliminado: ${filePath}`);
      return true;
    }
    
    console.log(`⚠️ Archivo no encontrado: ${filePath}`);
    return false;
  } catch (error) {
    console.error(`❌ Error eliminando archivo ${filePath}:`, error.message);
    return false;
  }
};

/**
 * Elimina una carpeta completa y todo su contenido
 * @param {string} folderPath - Ruta relativa de la carpeta desde la raíz del proyecto
 */
const deleteFolderIfExists = (folderPath) => {
  try {
    if (!folderPath) return false;
    
    // Construir ruta absoluta
    const absolutePath = path.join(__dirname, '../..', folderPath);
    
    // Verificar si la carpeta existe
    if (fs.existsSync(absolutePath)) {
      fs.rmSync(absolutePath, { recursive: true, force: true });
      console.log(`🗑️ Carpeta eliminada: ${folderPath}`);
      return true;
    }
    
    console.log(`⚠️ Carpeta no encontrada: ${folderPath}`);
    return false;
  } catch (error) {
    console.error(`❌ Error eliminando carpeta ${folderPath}:`, error.message);
    return false;
  }
};

/**
 * Elimina todos los archivos de un cliente específico
 * @param {number} clientId - ID del cliente
 */
const deleteClientFiles = (clientId) => {
  try {
    const clientFolders = [
      `uploads/clients/cliente-${clientId}`,
      `uploads/invoices/cliente-${clientId}`,
      `uploads/clients/${clientId}`, // Por si se usó sin prefijo
      `uploads/invoices/${clientId}` // Por si se usó sin prefijo
    ];
    
    let deletedCount = 0;
    
    clientFolders.forEach(folder => {
      if (deleteFolderIfExists(folder)) {
        deletedCount++;
      }
    });
    
    console.log(`🗑️ Cliente ${clientId}: ${deletedCount} carpetas eliminadas`);
    return deletedCount > 0;
  } catch (error) {
    console.error(`❌ Error eliminando archivos del cliente ${clientId}:`, error.message);
    return false;
  }
};

/**
 * Limpia archivos de un pago específico
 * @param {Object} invoice - Objeto del pago con información del documento
 */
const cleanupInvoiceFiles = (invoice) => {
  try {
    if (!invoice || !invoice.document || !invoice.document.path) {
      console.log(`⚠️ Pago ${invoice?.id || 'desconocido'}: Sin archivo para eliminar`);
      return false;
    }
    
    const deleted = deleteFileIfExists(invoice.document.path);
    
    if (deleted) {
      console.log(`🗑️ Pago ${invoice.id}: Archivo eliminado - ${invoice.document.name}`);
    }
    
    return deleted;
  } catch (error) {
    console.error(`❌ Error limpiando archivos del pago ${invoice?.id}:`, error.message);
    return false;
  }
};

/**
 * Lista archivos en una carpeta para debug
 * @param {string} folderPath - Ruta de la carpeta
 */
const listFiles = (folderPath) => {
  try {
    const absolutePath = path.join(__dirname, '../..', folderPath);
    
    if (!fs.existsSync(absolutePath)) {
      console.log(`📁 Carpeta no existe: ${folderPath}`);
      return [];
    }
    
    const files = fs.readdirSync(absolutePath);
    console.log(`📁 Archivos en ${folderPath}:`, files);
    return files;
  } catch (error) {
    console.error(`❌ Error listando archivos en ${folderPath}:`, error.message);
    return [];
  }
};

module.exports = {
  deleteFileIfExists,
  deleteFolderIfExists,
  deleteClientFiles,
  cleanupInvoiceFiles,
  listFiles
};
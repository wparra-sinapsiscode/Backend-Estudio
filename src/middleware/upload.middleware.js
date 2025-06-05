/**
 * Upload middleware for Accounting System Backend
 * Handles file uploads using multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create specific upload directories for accounting system
const dirs = ['clients', 'invoices', 'services', 'documents', 'signatures', 'profiles'];
dirs.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Define storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadsDir;
    
    // Determine upload folder based on file type and context
    if (file.fieldname === 'clientDocument' || file.fieldname === 'clientPhoto') {
      folder = path.join(uploadsDir, 'clients');
      
      // Create client-specific folder if we have clientId
      const clientId = req.params.clientId || req.params.id;
      if (clientId) {
        const clientDir = path.join(folder, clientId);
        if (!fs.existsSync(clientDir)) {
          fs.mkdirSync(clientDir, { recursive: true });
        }
        folder = clientDir;
      }
    } else if (file.fieldname === 'invoiceDocument' || file.fieldname === 'invoiceAttachment') {
      folder = path.join(uploadsDir, 'invoices');
      
      // Create invoice-specific folder if we have invoiceId
      const invoiceId = req.params.invoiceId || req.params.id;
      if (invoiceId) {
        const invoiceDir = path.join(folder, invoiceId);
        if (!fs.existsSync(invoiceDir)) {
          fs.mkdirSync(invoiceDir, { recursive: true });
        }
        folder = invoiceDir;
      }
    } else if (file.fieldname === 'serviceDocument' || file.fieldname === 'servicePhoto') {
      folder = path.join(uploadsDir, 'services');
      
      // Create service-specific folder if we have serviceId
      const serviceId = req.params.serviceId || req.params.id;
      if (serviceId) {
        const serviceDir = path.join(folder, serviceId);
        if (!fs.existsSync(serviceDir)) {
          fs.mkdirSync(serviceDir, { recursive: true });
        }
        folder = serviceDir;
      }
    } else if (file.fieldname === 'signature') {
      folder = path.join(uploadsDir, 'signatures');
    } else if (file.fieldname === 'profilePhoto') {
      folder = path.join(uploadsDir, 'profiles');
    } else if (file.fieldname === 'document' || file.fieldname === 'attachment') {
      folder = path.join(uploadsDir, 'documents');
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// Define file filter function
const fileFilter = (req, file, cb) => {
  // Check file type based on field name
  if (file.fieldname.includes('Photo') || file.fieldname.includes('signature')) {
    // Image files only
    const allowedMimeTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP).'), false);
    }
  } else {
    // Document files (images + PDFs)
    const allowedMimeTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes y documentos (PDF, Word, Excel).'), false);
    }
  }
};

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

/**
 * Middleware for handling client document uploads (multiple files)
 */
exports.uploadClientDocuments = (req, res, next) => {
  const uploadHandler = upload.array('clientDocument', 10); // Maximum 10 documents per request
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Error en la carga de archivos: ${err.message}`
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: `Error en la carga de archivos: ${err.message}`
      });
    }
    
    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.body.documentUrls = req.files.map(file => {
        const relativePath = file.path.replace(path.join(__dirname, '../..'), '');
        return relativePath.replace(/\\/g, '/');
      });
    }
    
    next();
  });
};

/**
 * Middleware for handling invoice document uploads (multiple files)
 */
exports.uploadInvoiceDocuments = (req, res, next) => {
  const uploadHandler = upload.array('invoiceDocument', 5); // Maximum 5 documents per invoice
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Error en la carga de archivos: ${err.message}`
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: `Error en la carga de archivos: ${err.message}`
      });
    }
    
    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.body.documentUrls = req.files.map(file => {
        const relativePath = file.path.replace(path.join(__dirname, '../..'), '');
        return relativePath.replace(/\\/g, '/');
      });
    }
    
    next();
  });
};

/**
 * Middleware for handling single photo upload
 */
exports.uploadSinglePhoto = (fieldName) => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `Error en la carga de archivo: ${err.message}`
        });
      } else if (err) {
        return res.status(500).json({
          success: false,
          message: `Error en la carga de archivo: ${err.message}`
        });
      }
      
      // Process uploaded file
      if (req.file) {
        const relativePath = req.file.path.replace(path.join(__dirname, '../..'), '');
        req.body.photoUrl = relativePath.replace(/\\/g, '/');
      }
      
      next();
    });
  };
};

/**
 * Middleware for handling single document upload
 */
exports.uploadSingleDocument = (fieldName) => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `Error en la carga de documento: ${err.message}`
        });
      } else if (err) {
        return res.status(500).json({
          success: false,
          message: `Error en la carga de documento: ${err.message}`
        });
      }
      
      // Process uploaded file
      if (req.file) {
        const relativePath = req.file.path.replace(path.join(__dirname, '../..'), '');
        req.body.documentUrl = relativePath.replace(/\\/g, '/');
      }
      
      next();
    });
  };
};

/**
 * Middleware for handling signature upload
 */
exports.uploadSignature = (req, res, next) => {
  const uploadHandler = upload.single('signature');
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Error en la carga de la firma: ${err.message}`
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: `Error en la carga de la firma: ${err.message}`
      });
    }
    
    // Process uploaded file
    if (req.file) {
      const relativePath = req.file.path.replace(path.join(__dirname, '../..'), '');
      req.body.signatureUrl = relativePath.replace(/\\/g, '/');
    }
    
    next();
  });
};

/**
 * Middleware for handling base64 image data
 * @param {string} fieldName - Name of the field containing base64 data
 */
exports.processBase64Image = (fieldName) => {
  return (req, res, next) => {
    const base64Data = req.body[fieldName];
    
    if (!base64Data) {
      return next();
    }
    
    try {
      // Extract MIME type and base64 data
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Formato de imagen base64 inválido'
        });
      }
      
      const type = matches[1];
      const data = matches[2];
      
      // Check file type
      const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp'
      ];
      
      if (!allowedMimeTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de imagen no permitido. Solo se permiten JPEG, PNG, GIF, WEBP.'
        });
      }
      
      // Decode base64
      const buffer = Buffer.from(data, 'base64');
      
      // Check file size (10MB max)
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'La imagen es demasiado grande. El tamaño máximo es 10MB.'
        });
      }
      
      // Determine folder and filename based on context
      let folder = uploadsDir;
      
      if (fieldName === 'signature') {
        folder = path.join(uploadsDir, 'signatures');
      } else if (fieldName.includes('client')) {
        const clientId = req.params.clientId || req.params.id;
        if (clientId) {
          folder = path.join(uploadsDir, 'clients', clientId);
        } else {
          folder = path.join(uploadsDir, 'clients');
        }
      } else if (fieldName.includes('invoice')) {
        const invoiceId = req.params.invoiceId || req.params.id;
        if (invoiceId) {
          folder = path.join(uploadsDir, 'invoices', invoiceId);
        } else {
          folder = path.join(uploadsDir, 'invoices');
        }
      } else if (fieldName.includes('service')) {
        const serviceId = req.params.serviceId || req.params.id;
        if (serviceId) {
          folder = path.join(uploadsDir, 'services', serviceId);
        } else {
          folder = path.join(uploadsDir, 'services');
        }
      } else if (fieldName.includes('profile')) {
        folder = path.join(uploadsDir, 'profiles');
      } else {
        folder = path.join(uploadsDir, 'documents');
      }
      
      // Ensure folder exists
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      
      // Generate unique filename
      const extension = type.split('/')[1];
      const filename = `${fieldName}-${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
      const filePath = path.join(folder, filename);
      
      // Save file
      fs.writeFileSync(filePath, buffer);
      
      // Add URL to request body
      const relativePath = filePath.replace(path.join(__dirname, '../..'), '');
      req.body[`${fieldName}Url`] = relativePath.replace(/\\/g, '/');
      
      // Remove base64 data from request body to save memory
      delete req.body[fieldName];
      
      next();
    } catch (error) {
      console.error('Error processing base64 image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar la imagen base64',
        error: error.message
      });
    }
  };
};

/**
 * Utility function to serve uploaded files
 */
exports.serveUploadedFile = (req, res) => {
  const filePath = path.join(uploadsDir, req.params.folder, req.params.filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Archivo no encontrado'
    });
  }
  
  // Serve the file
  res.sendFile(filePath);
};

module.exports = exports;
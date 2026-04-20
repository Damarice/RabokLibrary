/**
 * File Upload Middleware
 * Handles file uploads with validation and storage
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/manuscripts', 'uploads/figures', 'uploads/supplementary', 'uploads/temp'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/temp';
        
        // Determine upload path based on file type or field name
        if (file.fieldname === 'manuscriptFile' || file.mimetype === 'application/pdf') {
            uploadPath = 'uploads/manuscripts';
        } else if (file.fieldname === 'figuresFiles' || file.mimetype.startsWith('image/')) {
            uploadPath = 'uploads/figures';
        } else if (file.fieldname === 'supplementaryFiles') {
            uploadPath = 'uploads/supplementary';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        
        cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/png': ['.png'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/tiff': ['.tiff', '.tif'],
        'application/postscript': ['.eps'],
        'text/plain': ['.txt'],
        'text/csv': ['.csv'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    };

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    // Check if file type is allowed
    if (allowedTypes[mimeType] && allowedTypes[mimeType].includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${Object.values(allowedTypes).flat().join(', ')}`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 26214400, // 25MB default
        files: 10 // Maximum 10 files per request
    }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 25MB.'
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files per upload.'
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field.'
            });
        }
    }
    
    if (error.message.includes('File type not allowed')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Utility function to delete uploaded files
const deleteUploadedFiles = (files) => {
    if (!files) return;
    
    const filesToDelete = Array.isArray(files) ? files : [files];
    
    filesToDelete.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', file.path, err);
                }
            });
        }
    });
};

// Middleware to clean up files on error
const cleanupOnError = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        // If there's an error and files were uploaded, clean them up
        if (res.statusCode >= 400 && req.files) {
            deleteUploadedFiles(req.files);
        }
        
        originalSend.call(this, data);
    };
    
    next();
};

module.exports = {
    upload,
    handleUploadError,
    deleteUploadedFiles,
    cleanupOnError
};
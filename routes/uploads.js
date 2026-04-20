/**
 * Upload Routes
 * Handles file uploads and management
 */

const express = require('express');
const auth = require('../middleware/auth');
const { upload, handleUploadError, cleanupOnError } = require('../middleware/upload');

const router = express.Router();

/**
 * @route   POST /api/uploads/single
 * @desc    Upload a single file
 * @access  Private
 */
router.post('/single', auth, cleanupOnError, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                file: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    path: req.file.path,
                    size: req.file.size,
                    mimeType: req.file.mimetype
                }
            }
        });
    } catch (error) {
        console.error('Single file upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/uploads/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/multiple', auth, cleanupOnError, upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimeType: file.mimetype
        }));

        res.json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            data: { files }
        });
    } catch (error) {
        console.error('Multiple file upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Apply error handling middleware
router.use(handleUploadError);

module.exports = router;
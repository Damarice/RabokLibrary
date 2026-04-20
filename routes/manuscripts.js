/**
 * Manuscript Routes - Supabase Version
 * Handles manuscript submission, management, and workflow
 */

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Manuscript = require('../models/supabase/Manuscript');
const Review = require('../models/supabase/Review');
const User = require('../models/supabase/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { upload } = require('../middleware/upload');

const router = express.Router();

// ===================================
// VALIDATION RULES
// ===================================

const manuscriptValidation = [
    body('title')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Title must be between 10 and 500 characters'),
    body('abstract')
        .trim()
        .isLength({ min: 100, max: 3000 })
        .withMessage('Abstract must be between 100 and 3000 characters'),
    body('keywords')
        .isArray({ min: 3, max: 10 })
        .withMessage('Please provide 3-10 keywords'),
    body('type')
        .isIn(['research-article', 'review-article', 'short-communication', 'case-study', 'technical-note', 'book-chapter', 'conference-paper'])
        .withMessage('Please select a valid manuscript type'),
    body('field')
        .isIn(['biology', 'chemistry', 'physics', 'mathematics', 'computer-science', 'engineering', 'medicine', 'environmental', 'social-sciences', 'interdisciplinary'])
        .withMessage('Please select a valid research field'),
    body('authors')
        .isArray({ min: 1 })
        .withMessage('At least one author is required'),
    body('authors.*.firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Author first name is required'),
    body('authors.*.lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Author last name is required'),
    body('authors.*.email')
        .isEmail()
        .withMessage('Valid author email is required'),
    body('authors.*.affiliation')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Author affiliation is required'),
    body('agreements.originality')
        .equals('true')
        .withMessage('You must confirm the originality of the work'),
    body('agreements.ethics')
        .equals('true')
        .withMessage('You must confirm ethical compliance'),
    body('agreements.copyright')
        .equals('true')
        .withMessage('You must agree to copyright terms')
];

// ===================================
// ROUTES
// ===================================

/**
 * @route   POST /api/manuscripts
 * @desc    Submit new manuscript
 * @access  Private
 */
router.post('/', auth, manuscriptValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const manuscriptData = {
            ...req.body,
            submittedBy: req.user.id
        };

        // Create manuscript
        const manuscript = await Manuscript.create(manuscriptData);

        res.status(201).json({
            success: true,
            message: 'Manuscript submitted successfully',
            data: {
                manuscript: {
                    id: manuscript.id,
                    submissionId: manuscript.submission_id,
                    title: manuscript.title,
                    status: manuscript.status,
                    submittedAt: manuscript.created_at
                }
            }
        });

    } catch (error) {
        console.error('Submit manuscript error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit manuscript',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/manuscripts
 * @desc    Get user's manuscripts
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const options = { limit, offset: (page - 1) * limit };
        if (status) options.status = status;

        const manuscripts = await Manuscript.findByUser(req.user.id, options);

        res.json({
            success: true,
            data: {
                manuscripts,
                pagination: {
                    currentPage: page,
                    limit,
                    totalCount: manuscripts.length
                }
            }
        });

    } catch (error) {
        console.error('Get manuscripts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve manuscripts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/manuscripts/:id
 * @desc    Get specific manuscript
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const manuscript = await Manuscript.findById(req.params.id);

        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check if user has access to this manuscript
        if (manuscript.submitted_by !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'editor') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: { manuscript }
        });

    } catch (error) {
        console.error('Get manuscript error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve manuscript',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/manuscripts/:id/files
 * @desc    Upload files for manuscript
 * @access  Private
 */
router.post('/:id/files', auth, upload.array('files', 10), async (req, res) => {
    try {
        const manuscript = await Manuscript.findById(req.params.id);

        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check if user owns this manuscript
        if (manuscript.submitted_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadedFiles = [];
        for (const file of req.files) {
            const fileData = {
                type: req.body.type || 'manuscript',
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimeType: file.mimetype
            };

            const uploadedFile = await manuscript.addFile(fileData);
            uploadedFiles.push(uploadedFile);
        }

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: { files: uploadedFiles }
        });

    } catch (error) {
        console.error('Upload files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload files',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   PUT /api/manuscripts/:id
 * @desc    Update manuscript
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const manuscript = await Manuscript.findById(req.params.id);

        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check if user owns this manuscript
        if (manuscript.submitted_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow updates if manuscript is in draft or revision-requested status
        if (!['submitted', 'revision-requested'].includes(manuscript.status)) {
            return res.status(400).json({
                success: false,
                message: 'Manuscript cannot be updated in current status'
            });
        }

        const allowedUpdates = ['title', 'abstract', 'keywords', 'type', 'field', 'subfield'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedManuscript = await manuscript.update(updates);

        res.json({
            success: true,
            message: 'Manuscript updated successfully',
            data: { manuscript: updatedManuscript }
        });

    } catch (error) {
        console.error('Update manuscript error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update manuscript',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
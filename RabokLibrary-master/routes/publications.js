/**
 * Publications Routes
 * Handles public repository browsing and search
 */

const express = require('express');
const { query, validationResult } = require('express-validator');
const Manuscript = require('../models/supabase/Manuscript');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/publications
 * @desc    Get published manuscripts (public repository)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Get published manuscripts using Supabase
        const supabase = require('../config/supabase');
        
        let query = supabase
            .from('manuscripts')
            .select(`
                id,
                title,
                abstract,
                keywords,
                type,
                field,
                published_at,
                doi,
                views,
                downloads,
                citations,
                manuscript_authors (
                    first_name,
                    last_name,
                    affiliation,
                    is_corresponding
                )
            `)
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Add filters if provided
        if (req.query.field) {
            query = query.eq('field', req.query.field);
        }
        if (req.query.type) {
            query = query.eq('type', req.query.type);
        }

        const { data: manuscripts, error } = await query;

        if (error) {
            throw error;
        }

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('manuscripts')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        if (countError) {
            throw countError;
        }

        const totalPages = Math.ceil((count || 0) / limit);

        res.json({
            success: true,
            data: {
                manuscripts: manuscripts || [],
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount: count || 0,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get publications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve publications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/publications/:id
 * @desc    Get a specific published manuscript
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const publication = await Manuscript.findOne({
            _id: req.params.id,
            isPublished: true
        })
        .populate('authors.user', 'firstName lastName email institution')
        .select('-reviews -internalNotes -timeline');

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'Publication not found'
            });
        }

        // Increment view count
        await publication.incrementViews();

        res.json({
            success: true,
            data: { publication }
        });

    } catch (error) {
        console.error('Get publication error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve publication',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/publications/:id/download/:fileId
 * @desc    Download a publication file
 * @access  Public
 */
router.get('/:id/download/:fileId', async (req, res) => {
    try {
        const publication = await Manuscript.findOne({
            _id: req.params.id,
            isPublished: true
        });

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'Publication not found'
            });
        }

        // Find file
        const file = publication.files.find(f => f._id.toString() === req.params.fileId);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Increment download count
        await publication.incrementDownloads();

        // Send file
        res.download(file.path, file.originalName);

    } catch (error) {
        console.error('Publication download error:', error);
        res.status(500).json({
            success: false,
            message: 'Download failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/publications/featured
 * @desc    Get featured publications
 * @access  Public
 */
router.get('/featured', async (req, res) => {
    try {
        // Get most recent and highly cited publications
        const featured = await Manuscript.find({ isPublished: true })
            .populate('authors.user', 'firstName lastName')
            .select('title abstract keywords type field authors publishedAt doi journal views downloads citations')
            .sort({ citations: -1, views: -1, publishedAt: -1 })
            .limit(6);

        res.json({
            success: true,
            data: { featured }
        });

    } catch (error) {
        console.error('Get featured publications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve featured publications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/publications/stats
 * @desc    Get publication statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        // Overall statistics
        const overallStats = await Manuscript.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: null,
                    totalPublications: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalDownloads: { $sum: '$downloads' },
                    totalCitations: { $sum: '$citations' }
                }
            }
        ]);

        // Publications by field
        const byField = await Manuscript.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: '$field',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Publications by type
        const byType = await Manuscript.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Publications by year
        const byYear = await Manuscript.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: { $year: '$publishedAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                overall: overallStats[0] || {
                    totalPublications: 0,
                    totalViews: 0,
                    totalDownloads: 0,
                    totalCitations: 0
                },
                byField,
                byType,
                byYear
            }
        });

    } catch (error) {
        console.error('Get publication stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
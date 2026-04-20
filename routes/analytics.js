/**
 * Analytics Routes - Supabase Version
 * Handles statistics and reporting
 */

const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin/Editor)
 */
router.get('/dashboard', auth, authorize(['admin', 'editor']), async (req, res) => {
    try {
        const supabase = require('../config/supabase');

        // Get manuscript statistics
        const { data: manuscriptStats, error: manuscriptError } = await supabase
            .rpc('get_manuscript_stats');

        if (manuscriptError) throw manuscriptError;

        // Get user statistics
        const { data: userStats, error: userError } = await supabase
            .rpc('get_user_stats');

        if (userError) throw userError;

        // Get review statistics
        const { data: reviewStats, error: reviewError } = await supabase
            .rpc('get_review_stats');

        if (reviewError) throw reviewError;

        res.json({
            success: true,
            data: {
                manuscripts: manuscriptStats || {
                    total: 0,
                    submitted: 0,
                    under_review: 0,
                    accepted: 0,
                    published: 0
                },
                users: userStats || {
                    total: 0,
                    verified: 0,
                    active: 0
                },
                reviews: reviewStats || {
                    total: 0,
                    completed: 0,
                    pending: 0,
                    overdue: 0
                }
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        
        // Fallback to basic queries if stored procedures don't exist
        try {
            const supabase = require('../config/supabase');

            // Basic manuscript count
            const { count: manuscriptCount } = await supabase
                .from('manuscripts')
                .select('*', { count: 'exact', head: true });

            // Basic user count
            const { count: userCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Basic review count
            const { count: reviewCount } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true });

            res.json({
                success: true,
                data: {
                    manuscripts: {
                        total: manuscriptCount || 0,
                        submitted: 0,
                        under_review: 0,
                        accepted: 0,
                        published: 0
                    },
                    users: {
                        total: userCount || 0,
                        verified: 0,
                        active: 0
                    },
                    reviews: {
                        total: reviewCount || 0,
                        completed: 0,
                        pending: 0,
                        overdue: 0
                    }
                }
            });

        } catch (fallbackError) {
            console.error('Fallback stats error:', fallbackError);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
});

/**
 * @route   GET /api/analytics/publications
 * @desc    Get publication statistics
 * @access  Public
 */
router.get('/publications', async (req, res) => {
    try {
        const supabase = require('../config/supabase');

        // Get publication counts by field
        const { data: fieldStats, error: fieldError } = await supabase
            .from('manuscripts')
            .select('field')
            .eq('is_published', true);

        if (fieldError) throw fieldError;

        // Count by field
        const fieldCounts = {};
        fieldStats.forEach(manuscript => {
            fieldCounts[manuscript.field] = (fieldCounts[manuscript.field] || 0) + 1;
        });

        // Get total publication stats
        const { data: totalStats, error: totalError } = await supabase
            .from('manuscripts')
            .select('views, downloads, citations')
            .eq('is_published', true);

        if (totalError) throw totalError;

        const totals = totalStats.reduce((acc, manuscript) => ({
            views: acc.views + (manuscript.views || 0),
            downloads: acc.downloads + (manuscript.downloads || 0),
            citations: acc.citations + (manuscript.citations || 0)
        }), { views: 0, downloads: 0, citations: 0 });

        res.json({
            success: true,
            data: {
                totalPublications: fieldStats.length,
                byField: fieldCounts,
                totalViews: totals.views,
                totalDownloads: totals.downloads,
                totalCitations: totals.citations
            }
        });

    } catch (error) {
        console.error('Get publication stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get publication statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
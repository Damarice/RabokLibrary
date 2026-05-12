/**
 * Review Routes - Supabase Version
 * Handles peer review workflow and management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/supabase/Review');
const Manuscript = require('../models/supabase/Manuscript');
const User = require('../models/supabase/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

/**
 * @route   GET /api/reviews
 * @desc    Get reviews for current user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const reviews = await Review.findByReviewer(req.user.id);

        res.json({
            success: true,
            data: { reviews }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reviews',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/reviews/:id
 * @desc    Get specific review
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user has access to this review
        if (review.reviewer_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'editor') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: { review }
        });

    } catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get review',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/reviews/:id/accept
 * @desc    Accept review invitation
 * @access  Private
 */
router.post('/:id/accept', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is the assigned reviewer
        if (review.reviewer_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if review is in invited status
        if (review.status !== 'invited') {
            return res.status(400).json({
                success: false,
                message: 'Review invitation cannot be accepted in current status'
            });
        }

        await review.acceptInvitation();

        res.json({
            success: true,
            message: 'Review invitation accepted successfully',
            data: { review }
        });

    } catch (error) {
        console.error('Accept review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept review invitation',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/reviews/:id/decline
 * @desc    Decline review invitation
 * @access  Private
 */
router.post('/:id/decline', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is the assigned reviewer
        if (review.reviewer_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if review is in invited status
        if (review.status !== 'invited') {
            return res.status(400).json({
                success: false,
                message: 'Review invitation cannot be declined in current status'
            });
        }

        const reason = req.body.reason || 'No reason provided';
        await review.declineInvitation(reason);

        res.json({
            success: true,
            message: 'Review invitation declined successfully'
        });

    } catch (error) {
        console.error('Decline review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to decline review invitation',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/reviews/:id/submit
 * @desc    Submit review
 * @access  Private
 */
router.post('/:id/submit', auth, [
    body('recommendation')
        .isIn(['accept', 'minor-revisions', 'major-revisions', 'reject'])
        .withMessage('Please provide a valid recommendation'),
    body('evaluation.overallRating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Overall rating must be between 1 and 5'),
    body('evaluation.summary')
        .trim()
        .isLength({ min: 50, max: 2000 })
        .withMessage('Summary must be between 50 and 2000 characters'),
    body('reviewerExpertise')
        .isIn(['expert', 'knowledgeable', 'some-knowledge', 'limited'])
        .withMessage('Please specify your expertise level')
], async (req, res) => {
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

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is the assigned reviewer
        if (review.reviewer_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if review is in progress
        if (!['accepted', 'in-progress'].includes(review.status)) {
            return res.status(400).json({
                success: false,
                message: 'Review cannot be submitted in current status'
            });
        }

        const reviewData = {
            recommendation: req.body.recommendation,
            evaluation: req.body.evaluation,
            comments: req.body.comments || [],
            reviewerExpertise: req.body.reviewerExpertise,
            timeSpent: req.body.timeSpent
        };

        await review.submitReview(reviewData);

        res.json({
            success: true,
            message: 'Review submitted successfully',
            data: { review }
        });

    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
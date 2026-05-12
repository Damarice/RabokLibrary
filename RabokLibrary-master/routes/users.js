/**
 * User Routes - Supabase Version
 * Handles user profile management and operations
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/supabase/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Bio cannot exceed 1000 characters'),
    body('website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL'),
    body('researchInterests')
        .optional()
        .isArray()
        .withMessage('Research interests must be an array')
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

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const allowedUpdates = ['firstName', 'lastName', 'bio', 'website', 'researchInterests'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                // Convert camelCase to snake_case for database
                const dbField = field === 'firstName' ? 'first_name' :
                               field === 'lastName' ? 'last_name' :
                               field === 'researchInterests' ? 'research_interests' :
                               field;
                updates[dbField] = req.body[field];
            }
        });

        const updatedUser = await user.update(updates);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser.toJSON() }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const supabase = require('../config/supabase');
        
        const { data: users, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, institution, department, position, role, is_verified, is_active, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: { users }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
/**
 * Simple Authentication Routes - Working Version
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '3600'
    });
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user in Supabase
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .limit(1);

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // For now, let's do a simple password check (you can enhance this later)
        // In production, you'd use bcrypt to compare hashed passwords
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    institution: user.institution,
                    department: user.department,
                    position: user.position,
                    role: user.role,
                    isVerified: user.is_verified
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', [
    body('firstName').trim().isLength({ min: 2, max: 50 }),
    body('lastName').trim().isLength({ min: 2, max: 50 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('institution').trim().isLength({ min: 2, max: 200 }),
    body('department').isIn(['biology', 'chemistry', 'physics', 'mathematics', 'computer-science', 'engineering', 'medicine', 'social-sciences', 'humanities', 'other']),
    body('position').isIn(['professor', 'associate-professor', 'assistant-professor', 'postdoc', 'phd-student', 'researcher', 'other'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, password, institution, department, position, orcidId, bio } = req.body;

        // Check if user exists
        const { data: existingUsers } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .limit(1);

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                first_name: firstName,
                last_name: lastName,
                email: email.toLowerCase(),
                password_hash: passwordHash,
                institution,
                department,
                position,
                orcid_id: orcidId,
                bio
            }])
            .select()
            .single();

        if (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create user'
            });
        }

        // Generate token
        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    firstName: newUser.first_name,
                    lastName: newUser.last_name,
                    email: newUser.email,
                    institution: newUser.institution,
                    department: newUser.department,
                    position: newUser.position,
                    role: newUser.role,
                    isVerified: newUser.is_verified
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
/**
 * Raboks Library Research & Development Center
 * Main Server Application
 * 
 * A comprehensive backend API for academic research platform featuring:
 * - User authentication and authorization
 * - Manuscript submission and management
 * - Peer review workflow
 * - Publication repository
 * - File upload and storage
 * - Email notifications
 * - Analytics and reporting
 * 
 * Author: Raboks Library R&D Team
 * Version: 1.0.0
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import Supabase configuration
const supabase = require('./config/supabase');

// Import routes
const authRoutes = require('./routes/auth-simple');
const userRoutes = require('./routes/users');
const manuscriptRoutes = require('./routes/manuscripts');
const reviewRoutes = require('./routes/reviews');
const publicationRoutes = require('./routes/publications');
const uploadRoutes = require('./routes/uploads');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const errorHandler = require('./middleware/errorhandler');
const notFound = require('./middleware/notfound');

// Initialize Express app
const app = express();

// ===================================
// SECURITY & MIDDLEWARE CONFIGURATION
// ===================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (simplified for lower memory usage)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // reduced limit
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

// ===================================
// DATABASE CONNECTION
// ===================================

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        console.log('✅ Connected to Supabase PostgreSQL');
    } catch (error) {
        console.error('❌ Supabase connection error:', error.message);
        console.error('Please check your Supabase configuration in .env file');
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
}

testSupabaseConnection();

// ===================================
// API ROUTES
// ===================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Direct auth routes (bypass file loading issues)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

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
                message: 'Database error',
                error: error.message
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

        // Simple password check for admin user
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '3600'
        });

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/manuscripts', manuscriptRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// API-only server - no frontend serving

// ===================================
// ERROR HANDLING
// ===================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ===================================
// SERVER STARTUP
// ===================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Raboks Library API Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Local:   http://localhost:${PORT}`);
    console.log(`🔗 API:     http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;
/**
 * Minimal Raboks Library Server for Low Memory Hosting
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Supabase configuration
const supabase = require('./config/supabase');

// Import routes (only essential ones)
const authRoutes = require('./routes/auth');
const manuscriptRoutes = require('./routes/manuscripts');
const publicationRoutes = require('./routes/publications');

// Initialize Express app
const app = express();

// Basic middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
    }
}

testSupabaseConnection();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/manuscripts', manuscriptRoutes);
app.use('/api/publications', publicationRoutes);

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Minimal Raboks Library API running on port ${PORT}`);
});

module.exports = app;
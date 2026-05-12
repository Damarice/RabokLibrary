/**
 * Production Entry Point for cPanel Node.js App
 * This file is required for cPanel Node.js hosting
 */

const app = require('./server');

// Export the app for cPanel
module.exports = app;
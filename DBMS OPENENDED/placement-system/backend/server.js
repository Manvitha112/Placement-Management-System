require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const companyRoutes = require('./routes/company');
const coordinatorRoutes = require('./routes/coordinator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5500', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1 style="color: #2563eb;">🚀 Placement API is Running</h1>
            <p>This is the backend server on <b>Port 5001</b>.</p>
            <p>To access the Portal UI, please visit: <a href="http://127.0.0.1:5500" style="color: #2563eb; font-weight: bold;">http://127.0.0.1:5500</a></p>
        </div>
    `);
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/coordinator', coordinatorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API Route not found. Ensure you are using /api/... prefix.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✓ Server is running on http://localhost:${PORT}`);
    console.log(`✓ CORS enabled for http://127.0.0.1:5500\n`);
});

module.exports = app;

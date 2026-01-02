const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const contactRoutes = require('./routes/contact');

// Initialize Express
const app = express();

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    message: {
        success: false,
        message: 'Trop de tentatives. Veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware CORS - AJOUTER localhost:5173
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Apply rate limiting to contact routes
app.use('/api/contact', limiter);

// Routes
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Ne pas quitter en développement, continuer sans MongoDB
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Le fichier est trop volumineux. Taille maximum: 5MB'
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📧 Emails will be sent to: ${process.env.EMAIL_TO}`);
            console.log(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3001, http://localhost:5173`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();

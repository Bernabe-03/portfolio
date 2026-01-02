const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { upload, handleMulterError } = require('../middleware/upload');

// Middleware pour logger les requêtes
const requestLogger = (req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    console.log(`🌐 IP: ${req.ip} - User-Agent: ${req.headers['user-agent']}`);
    next();
};

router.use(requestLogger);

// Route principale pour soumettre le formulaire
router.post(
    '/submit',
    upload.single('attachment'),
    handleMulterError,
    contactController.submitContactForm
);

// Routes d'administration (protéger avec authentification en production)
router.get('/admin/all', contactController.getAllContacts);
router.get('/admin/stats', contactController.getStats);
router.get('/admin/:id', contactController.getContactById);
router.put('/admin/:id/status', contactController.updateContactStatus);
router.delete('/admin/:id', contactController.deleteContact);

module.exports = router;
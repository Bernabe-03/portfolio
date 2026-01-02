const Contact = require('../models/Contact');
const emailService = require('../utils/emailService');
const fs = require('fs');
const path = require('path');

class ContactController {
    async submitContactForm(req, res) {
        try {
            const { name, email, subject, message } = req.body;
            
            // Validation des champs requis
            if (!name || !email || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Tous les champs obligatoires doivent être remplis'
                });
            }

            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Veuillez fournir un email valide'
                });
            }

            // Vérifier les sujets valides
            const validSubjects = ['recruitment', 'project', 'collaboration', 'freelance', 'consultation', 'other'];
            if (!validSubjects.includes(subject)) {
                return res.status(400).json({
                    success: false,
                    message: 'Sujet non valide'
                });
            }

            // Vérifier la longueur du message
            if (message.length < 10 || message.length > 5000) {
                return res.status(400).json({
                    success: false,
                    message: 'Le message doit contenir entre 10 et 5000 caractères'
                });
            }

            // Préparer les données de contact
            const contactData = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                subject,
                message: message.trim(),
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                status: 'pending',
                isSpam: false
            };

            // Ajouter la pièce jointe si elle existe
            if (req.file) {
                contactData.attachment = {
                    filename: req.file.originalname,
                    path: req.file.path,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                };
            }

            // Créer le contact dans la base de données
            const contact = new Contact(contactData);
            await contact.save();
            
            // Envoyer l'email
            try {
                const emailResult = await emailService.sendContactEmail(contactData);
                
                // Mettre à jour le contact avec l'ID de l'email
                contact.emailSent = emailResult.success;
                contact.emailMessageId = emailResult.messageId || emailResult.simulated ? `simulated-${Date.now()}` : null;
                contact.emailSimulated = emailResult.simulated || false;
                await contact.save();

                console.log(`✅ Contact saved - Email sent: ${contact.emailSent}, Simulated: ${contact.emailSimulated}`);

                // Réponse adaptée
                if (emailResult.simulated) {
                    return res.status(201).json({
                        success: true,
                        message: 'Message reçu et enregistré. L\'email n\'a pas pu être envoyé (mode simulation).',
                        simulated: true,
                        data: {
                            id: contact._id,
                            name: contact.name,
                            email: contact.email,
                            subject: contact.subject,
                            timestamp: contact.createdAt
                        }
                    });
                } else {
                    return res.status(201).json({
                        success: true,
                        message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
                        data: {
                            id: contact._id,
                            name: contact.name,
                            email: contact.email,
                            subject: contact.subject,
                            timestamp: contact.createdAt
                        }
                    });
                }
                
            } catch (emailError) {
                console.error('❌ Email sending failed, but contact saved:', emailError);
                
                // Le contact est quand même sauvegardé même si l'email échoue
                return res.status(201).json({
                    success: true,
                    message: 'Message enregistré. Un problème est survenu avec l\'envoi de la notification.',
                    warning: 'L\'email de notification n\'a pas pu être envoyé',
                    data: {
                        id: contact._id,
                        name: contact.name,
                        email: contact.email
                    }
                });
            }

        } catch (error) {
            console.error('❌ Contact submission error:', error);

            // Supprimer le fichier uploadé si l'enregistrement échoue
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
                });
            }

            // Gestion des erreurs de validation MongoDB
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Erreur de validation',
                    errors: messages
                });
            }

            // Erreur de duplication (si on avait un index unique sur email par exemple)
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Cet email a déjà été utilisé récemment'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.'
            });
        }
    }

    async getAllContacts(req, res) {
        try {
            const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
            
            const query = {};
            
            if (status) query.status = status;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }
            
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            const contacts = await Contact.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-__v');
            
            const total = await Contact.countDocuments(query);
            
            res.status(200).json({
                success: true,
                data: contacts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
            
        } catch (error) {
            console.error('❌ Get contacts error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des contacts'
            });
        }
    }

    async getContactById(req, res) {
        try {
            const contact = await Contact.findById(req.params.id);
            
            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact non trouvé'
                });
            }
            
            res.status(200).json({
                success: true,
                data: contact
            });
            
        } catch (error) {
            console.error('❌ Get contact error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du contact'
            });
        }
    }

    async updateContactStatus(req, res) {
        try {
            const { status } = req.body;
            const validStatuses = ['pending', 'read', 'replied', 'archived'];
            
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut non valide'
                });
            }
            
            const contact = await Contact.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true, runValidators: true }
            );
            
            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact non trouvé'
                });
            }
            
            res.status(200).json({
                success: true,
                message: `Statut mis à jour: ${status}`,
                data: contact
            });
            
        } catch (error) {
            console.error('❌ Update contact error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du contact'
            });
        }
    }

    async deleteContact(req, res) {
        try {
            const contact = await Contact.findById(req.params.id);
            
            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact non trouvé'
                });
            }
            
            // Supprimer le fichier joint s'il existe
            if (contact.attachment && contact.attachment.path) {
                fs.unlink(contact.attachment.path, (err) => {
                    if (err) console.error('Error deleting attachment:', err);
                });
            }
            
            await Contact.findByIdAndDelete(req.params.id);
            
            res.status(200).json({
                success: true,
                message: 'Contact supprimé avec succès'
            });
            
        } catch (error) {
            console.error('❌ Delete contact error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du contact'
            });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await Contact.aggregate([
                {
                    $facet: {
                        totalContacts: [{ $count: "count" }],
                        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                        bySubject: [{ $group: { _id: "$subject", count: { $sum: 1 } } }],
                        last30Days: [
                            {
                                $match: {
                                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                                }
                            },
                            { $count: "count" }
                        ],
                        today: [
                            {
                                $match: {
                                    createdAt: { 
                                        $gte: new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                }
                            },
                            { $count: "count" }
                        ]
                    }
                }
            ]);
            
            res.status(200).json({
                success: true,
                data: stats[0]
            });
            
        } catch (error) {
            console.error('❌ Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques'
            });
        }
    }
}
module.exports = new ContactController();
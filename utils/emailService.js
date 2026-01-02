// const nodemailer = require('nodemailer');
// const fs = require('fs');
// const path = require('path');

// class EmailService {
//     constructor() {
//         // Initialiser le transporteur Gmail
//         this.transporter = null;
//         this.initializeTransporter();
//     }

//     async initializeTransporter() {
//         try {
//             console.log('📧 Initialisation du service email...');
//             console.log('📧 Email utilisé:', process.env.EMAIL_USER);
            
//             // Créer le transporteur
//             this.transporter = nodemailer.createTransport({
//                 host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//                 port: parseInt(process.env.EMAIL_PORT) || 587,
//                 secure: false, // true pour 465, false pour 587
//                 auth: {
//                     user: process.env.EMAIL_USER,
//                     pass: process.env.EMAIL_PASS
//                 },
//                 tls: {
//                     rejectUnauthorized: false
//                 }
//             });

//             // Tester la connexion
//             await this.transporter.verify();
//             console.log('✅ Connexion SMTP réussie avec Gmail');
//             console.log('📧 Prêt à envoyer des emails réels!');
            
//         } catch (error) {
//             console.error('❌ Échec de la connexion SMTP:', error.message);
//             console.log('⚠️  Vérifiez votre mot de passe d\'application Gmail');
//             console.log('📝 Mode simulation activé en attendant');
//             this.transporter = null;
//         }
//     }

//     getSubjectText(subject) {
//         const subjects = {
//             recruitment: "🚀 Opportunité d'emploi",
//             project: "💡 Projet sur mesure",
//             collaboration: "🤝 Partenariat",
//             freelance: "💼 Mission freelance",
//             consultation: "📊 Consultation",
//             other: "✨ Autre demande"
//         };
//         return subjects[subject] || subject;
//     }

//     async sendContactEmail(contactData) {
//         try {
//             const subjectText = this.getSubjectText(contactData.subject);
            
//             // 1. Sauvegarder localement d'abord
//             this.saveEmailLocally(contactData, subjectText);
            
//             // 2. Si le transporteur est configuré, envoyer un vrai email
//             if (this.transporter) {
//                 console.log('\n📤 ENVOI D\'EMAIL RÉEL...');
                
//                 const mailOptions = {
//                     from: process.env.EMAIL_FROM || `"Contact Form" <${process.env.EMAIL_USER}>`,
//                     to: process.env.EMAIL_TO,
//                     replyTo: contactData.email,
//                     subject: `📧 Nouveau message: ${subjectText} - ${contactData.name}`,
//                     html: this.generateEmailTemplate(contactData),
//                     text: this.generateTextVersion(contactData)
//                 };

//                 // Ajouter la pièce jointe si elle existe
//                 if (contactData.attachment && contactData.attachment.path) {
//                     mailOptions.attachments = [{
//                         filename: contactData.attachment.filename,
//                         path: contactData.attachment.path,
//                         contentType: contactData.attachment.mimetype
//                     }];
//                 }

//                 const info = await this.transporter.sendMail(mailOptions);
                
//                 console.log('✅ Email envoyé avec succès!');
//                 console.log('📧 ID du message:', info.messageId);
//                 console.log('👤 Destinataire:', process.env.EMAIL_TO);
                
//                 return { 
//                     success: true, 
//                     messageId: info.messageId,
//                     realEmail: true
//                 };
//             } else {
//                 // Mode simulation
//                 console.log('\n📧 [SIMULATION] Nouveau message (SMTP non disponible):');
//                 console.log('   👤 Nom:', contactData.name);
//                 console.log('   📧 Email:', contactData.email);
//                 console.log('   🎯 Sujet:', subjectText);
                
//                 return { 
//                     success: true, 
//                     messageId: `simulated-${Date.now()}`,
//                     simulated: true
//                 };
//             }
            
//         } catch (error) {
//             console.error('❌ Erreur d\'envoi d\'email:', error.message);
            
//             // En cas d'erreur, on sauvegarde quand même localement
//             return { 
//                 success: false, 
//                 error: error.message,
//                 simulated: true
//             };
//         }
//     }

//     saveEmailLocally(contactData, subjectText) {
//         try {
//             const emailsDir = 'emails_logs';
//             if (!fs.existsSync(emailsDir)) {
//                 fs.mkdirSync(emailsDir, { recursive: true });
//             }
            
//             const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//             const safeName = contactData.name.replace(/[^a-zA-Z0-9]/g, '_');
//             const filename = path.join(emailsDir, `message_${timestamp}_${safeName}.json`);
            
//             const emailData = {
//                 timestamp: new Date().toISOString(),
//                 to: process.env.EMAIL_TO,
//                 subject: subjectText,
//                 from: contactData.email,
//                 data: {
//                     name: contactData.name,
//                     email: contactData.email,
//                     subject: contactData.subject,
//                     message: contactData.message,
//                     ipAddress: contactData.ipAddress,
//                     date: new Date().toLocaleString('fr-FR')
//                 }
//             };
            
//             fs.writeFileSync(filename, JSON.stringify(emailData, null, 2));
//             console.log(`📁 Message sauvegardé: ${filename}`);
            
//             return { success: true, filename };
//         } catch (err) {
//             console.error('Erreur sauvegarde locale:', err);
//             return { success: false, error: err.message };
//         }
//     }

//     generateEmailTemplate(contactData) {
//         const subjectText = this.getSubjectText(contactData.subject);
        
//         return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Nouveau Message de Contact</title>
//     <style>
//         body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             margin: 0;
//             padding: 20px;
//             background-color: #f5f5f5;
//         }
//         .container {
//             max-width: 700px;
//             margin: 0 auto;
//             background: white;
//             border-radius: 15px;
//             overflow: hidden;
//             box-shadow: 0 10px 30px rgba(0,0,0,0.1);
//         }
//         .header {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             padding: 40px 30px;
//             text-align: center;
//         }
//         .header h1 {
//             margin: 0;
//             font-size: 28px;
//             font-weight: 600;
//         }
//         .content {
//             padding: 40px;
//         }
//         .info-card {
//             background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
//             border-radius: 10px;
//             padding: 25px;
//             margin-bottom: 30px;
//         }
//         .info-row {
//             display: flex;
//             align-items: center;
//             margin-bottom: 15px;
//         }
//         .info-row:last-child {
//             margin-bottom: 0;
//         }
//         .info-label {
//             font-weight: 600;
//             color: #4a5568;
//             min-width: 120px;
//             display: flex;
//             align-items: center;
//             gap: 10px;
//         }
//         .info-value {
//             color: #2d3748;
//             font-weight: 500;
//         }
//         .message-box {
//             background: #f8f9fa;
//             border-left: 4px solid #667eea;
//             padding: 25px;
//             border-radius: 0 10px 10px 0;
//             margin: 25px 0;
//         }
//         .message-box h3 {
//             color: #4a5568;
//             margin-top: 0;
//             display: flex;
//             align-items: center;
//             gap: 10px;
//         }
//         .attachment {
//             background: #e8f4fc;
//             border: 1px dashed #4299e1;
//             border-radius: 8px;
//             padding: 15px;
//             margin-top: 20px;
//             display: inline-flex;
//             align-items: center;
//             gap: 10px;
//         }
//         .footer {
//             text-align: center;
//             padding: 25px;
//             background: #f8f9fa;
//             color: #718096;
//             font-size: 14px;
//             border-top: 1px solid #e2e8f0;
//         }
//         .badge {
//             display: inline-block;
//             padding: 5px 15px;
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border-radius: 20px;
//             font-size: 12px;
//             font-weight: 600;
//             margin-left: 10px;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h1>📬 Nouveau Message de Contact</h1>
//             <div class="date">${new Date().toLocaleDateString('fr-FR', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//             })}</div>
//         </div>
        
//         <div class="content">
//             <div class="info-card">
//                 <div class="info-row">
//                     <div class="info-label">👤 Nom:</div>
//                     <div class="info-value">${contactData.name}</div>
//                 </div>
//                 <div class="info-row">
//                     <div class="info-label">📧 Email:</div>
//                     <div class="info-value">
//                         <a href="mailto:${contactData.email}" style="color: #667eea; text-decoration: none;">
//                             ${contactData.email}
//                         </a>
//                     </div>
//                 </div>
//                 <div class="info-row">
//                     <div class="info-label">🎯 Sujet:</div>
//                     <div class="info-value">
//                         ${subjectText}
//                         <span class="badge">${contactData.subject}</span>
//                     </div>
//                 </div>
//                 <div class="info-row">
//                     <div class="info-label">🕐 Date:</div>
//                     <div class="info-value">${new Date().toLocaleString('fr-FR')}</div>
//                 </div>
//                 <div class="info-row">
//                     <div class="info-label">🌐 IP:</div>
//                     <div class="info-value">${contactData.ipAddress || 'Non disponible'}</div>
//                 </div>
//             </div>
            
//             <div class="message-box">
//                 <h3>💬 Message:</h3>
//                 <p style="white-space: pre-wrap;">${contactData.message}</p>
//             </div>
            
//             ${contactData.attachment ? `
//             <div class="attachment">
//                 📎 <strong>Pièce jointe:</strong> ${contactData.attachment.filename}
//                 <br>
//                 <small>Taille: ${Math.round(contactData.attachment.size / 1024)}KB | Type: ${contactData.attachment.mimetype}</small>
//             </div>
//             ` : ''}
            
//             <div style="margin-top: 30px; padding: 20px; background: #f0fff4; border-radius: 10px; border-left: 4px solid #38a169;">
//                 <strong>📋 Actions recommandées:</strong>
//                 <ul style="margin: 10px 0 0 20px;">
//                     <li>Répondre dans les 24 heures</li>
//                     <li>Classer la demande dans la base de données</li>
//                     <li>Vérifier le fichier joint si présent</li>
//                 </ul>
//             </div>
//         </div>
        
//         <div class="footer">
//             <p>Ce message a été envoyé depuis votre formulaire de contact portfolio.</p>
//             <p style="font-size: 12px; opacity: 0.7;">ID: ${Date.now()}</p>
//         </div>
//     </div>
// </body>
// </html>
//         `;
//     }

//     generateTextVersion(contactData) {
//         const subjectText = this.getSubjectText(contactData.subject);
//         return `
// NOUVEAU MESSAGE DE CONTACT - PORTFOLIO
// =======================================

// 👤 Nom: ${contactData.name}
// 📧 Email: ${contactData.email}
// 🎯 Sujet: ${subjectText} (${contactData.subject})
// 🕐 Date: ${new Date().toLocaleString('fr-FR')}
// 🌐 IP: ${contactData.ipAddress || 'Non disponible'}

// 💬 MESSAGE:
// ${contactData.message}

// ${contactData.attachment ? `📎 Pièce jointe: ${contactData.attachment.filename} (${Math.round(contactData.attachment.size / 1024)}KB)` : ''}

// ---
// Ce message a été envoyé depuis le formulaire de contact de votre portfolio.
//         `;
//     }
// }

// module.exports = new EmailService();









// utils/emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService {
    constructor() {
        console.log('🔄 Initialisation EmailService...');
        console.log('📧 Mode:', process.env.NODE_ENV);
        this.transporter = null;
        this.isInitializing = false;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        if (this.isInitializing) return;
        
        this.isInitializing = true;
        console.log('📧 Tentative de configuration du transporteur SMTP...');
        
        try {
            console.log('📧 Email utilisé:', process.env.EMAIL_USER);
            console.log('📧 Host:', process.env.EMAIL_HOST);
            console.log('📧 Port:', process.env.EMAIL_PORT);
            
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.error('❌ Variables EMAIL_USER ou EMAIL_PASS manquantes');
                console.error('❌ EMAIL_USER:', process.env.EMAIL_USER ? 'Défini' : 'Non défini');
                console.error('❌ EMAIL_PASS:', process.env.EMAIL_PASS ? 'Défini' : 'Non défini');
                this.transporter = null;
                this.isInitializing = false;
                return;
            }

            // Création du transporteur avec options étendues
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false,
                    ciphers: 'SSLv3'
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000,
                debug: process.env.NODE_ENV === 'development',
                logger: process.env.NODE_ENV === 'development'
            });

            console.log('📧 Transporteur créé, vérification en cours...');
            
            // Vérification de la connexion SMTP
            await this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ Échec de vérification SMTP:', error.message);
                    console.error('❌ Code:', error.code);
                    console.error('❌ Commande:', error.command);
                    
                    // Tentative de diagnostic
                    if (error.code === 'EAUTH') {
                        console.error('❌ Erreur d\'authentification - Vérifiez votre mot de passe d\'application Gmail');
                        console.error('❌ Consultez: https://myaccount.google.com/apppasswords');
                    } else if (error.code === 'ECONNECTION') {
                        console.error('❌ Erreur de connexion - Vérifiez votre connexion internet ou les paramètres SMTP');
                    } else if (error.code === 'ETIMEDOUT') {
                        console.error('❌ Timeout - Le serveur SMTP ne répond pas');
                    }
                    
                    this.transporter = null;
                } else {
                    console.log('✅ Connexion SMTP réussie !');
                    console.log('📧 Serveur:', process.env.EMAIL_HOST);
                    console.log('📧 Port:', process.env.EMAIL_PORT);
                    console.log('📧 Utilisateur:', process.env.EMAIL_USER);
                }
            });

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du transporteur:', error.message);
            console.error('❌ Stack:', error.stack);
            this.transporter = null;
        } finally {
            this.isInitializing = false;
        }
    }

    getSubjectText(subject) {
        const subjects = {
            recruitment: "🚀 Opportunité d'emploi",
            project: "💡 Projet sur mesure",
            collaboration: "🤝 Partenariat",
            freelance: "💼 Mission freelance",
            consultation: "📊 Consultation",
            other: "✨ Autre demande"
        };
        return subjects[subject] || subject;
    }

    async sendContactEmail(contactData) {
        console.log('\n📤 ========== DÉBUT ENVOI EMAIL ==========');
        console.log('📧 Données reçues:', {
            name: contactData.name,
            email: contactData.email,
            subject: contactData.subject,
            messageLength: contactData.message ? contactData.message.length : 0,
            hasAttachment: !!contactData.attachment
        });

        try {
            const subjectText = this.getSubjectText(contactData.subject);
            
            // 1. Sauvegarder localement TOUJOURS
            const savedFile = this.saveEmailLocally(contactData, subjectText);
            console.log('💾 Email sauvegardé localement:', savedFile.filename);
            
            // 2. Si on est en développement ou si le transporteur n'est pas configuré
            if (process.env.NODE_ENV !== 'production') {
                console.log('🔧 Mode développement - Email simulé');
                console.log('📧 Destinataire réel serait:', process.env.EMAIL_TO);
                console.log('📧 Sujet:', subjectText);
                
                // Simuler un délai d'envoi
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return { 
                    success: true, 
                    messageId: `dev-simulated-${Date.now()}`,
                    simulated: true,
                    savedFile: savedFile.filename
                };
            }
            
            // 3. En production, essayer d'envoyer l'email réel
            console.log('🚀 Mode production - Tentative d\'envoi réel');
            
            // Réessayer d'initialiser si nécessaire
            if (!this.transporter) {
                console.log('🔄 Transporteur non disponible, réinitialisation...');
                await this.initializeTransporter();
                
                if (!this.transporter) {
                    console.log('⚠️ Impossible d\'initialiser le transporteur, mode simulation forcé');
                    return { 
                        success: true, 
                        messageId: `simulated-${Date.now()}`,
                        simulated: true,
                        savedFile: savedFile.filename
                    };
                }
            }
            
            // Préparer les options d'email
            const mailOptions = {
                from: process.env.EMAIL_FROM || `"Contact Portfolio" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO || process.env.EMAIL_USER,
                replyTo: contactData.email,
                subject: `📧 Portfolio: ${subjectText} - ${contactData.name}`,
                html: this.generateEmailTemplate(contactData),
                text: this.generateTextVersion(contactData),
                headers: {
                    'X-Contact-Form': 'Portfolio',
                    'X-Contact-Type': contactData.subject,
                    'X-Sent-From': process.env.NODE_ENV || 'unknown'
                }
            };

            // Ajouter la pièce jointe si elle existe
            if (contactData.attachment && contactData.attachment.path) {
                console.log('📎 Ajout pièce jointe:', contactData.attachment.filename);
                mailOptions.attachments = [{
                    filename: contactData.attachment.filename,
                    path: contactData.attachment.path,
                    contentType: contactData.attachment.mimetype
                }];
            }

            console.log('📧 Configuration email:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject
            });

            // Envoyer avec timeout
            const sendPromise = this.transporter.sendMail(mailOptions);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout SMTP (10 secondes)')), 10000)
            );

            const info = await Promise.race([sendPromise, timeoutPromise]);
            
            console.log('✅ Email envoyé avec succès!');
            console.log('📧 ID du message:', info.messageId);
            console.log('📧 Réponse:', info.response ? info.response.substring(0, 100) + '...' : 'Aucune réponse');
            
            // Sauvegarder la confirmation
            this.saveEmailConfirmation(contactData, info);
            
            return { 
                success: true, 
                messageId: info.messageId,
                response: info.response,
                realEmail: true
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi d\'email:', error.message);
            console.error('❌ Type d\'erreur:', error.constructor.name);
            console.error('❌ Stack:', error.stack);
            
            // Sauvegarder l'erreur
            this.saveEmailError(contactData, error);
            
            // Même en cas d'erreur, on considère le succès car sauvegardé localement
            return { 
                success: true, 
                error: error.message,
                simulated: true,
                message: 'Email sauvegardé localement suite à une erreur d\'envoi'
            };
        } finally {
            console.log('📤 ========== FIN ENVOI EMAIL ==========\n');
        }
    }

    saveEmailLocally(contactData, subjectText) {
        try {
            const emailsDir = 'emails_logs';
            if (!fs.existsSync(emailsDir)) {
                fs.mkdirSync(emailsDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeName = (contactData.name || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
            const filename = path.join(emailsDir, `message_${timestamp}_${safeName}.json`);
            
            const emailData = {
                timestamp: new Date().toISOString(),
                savedAt: new Date().toLocaleString('fr-FR'),
                to: process.env.EMAIL_TO || 'Non défini',
                subject: subjectText,
                from: contactData.email,
                data: {
                    name: contactData.name,
                    email: contactData.email,
                    subject: contactData.subject,
                    message: contactData.message,
                    ipAddress: contactData.ipAddress,
                    userAgent: contactData.userAgent,
                    date: new Date().toLocaleString('fr-FR')
                },
                environment: {
                    NODE_ENV: process.env.NODE_ENV || 'non défini',
                    EMAIL_USER_SET: !!process.env.EMAIL_USER,
                    EMAIL_PASS_SET: !!process.env.EMAIL_PASS,
                    EMAIL_HOST: process.env.EMAIL_HOST || 'non défini',
                    EMAIL_PORT: process.env.EMAIL_PORT || 'non défini'
                }
            };
            
            fs.writeFileSync(filename, JSON.stringify(emailData, null, 2));
            
            return { success: true, filename };
        } catch (err) {
            console.error('❌ Erreur lors de la sauvegarde locale:', err.message);
            return { success: false, error: err.message };
        }
    }

    saveEmailConfirmation(contactData, info) {
        try {
            const confirmDir = 'email_confirmations';
            if (!fs.existsSync(confirmDir)) {
                fs.mkdirSync(confirmDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = path.join(confirmDir, `confirmed_${timestamp}.json`);
            
            const confirmationData = {
                timestamp: new Date().toISOString(),
                contactData: {
                    name: contactData.name,
                    email: contactData.email,
                    subject: contactData.subject
                },
                emailInfo: {
                    messageId: info.messageId,
                    response: info.response,
                    accepted: info.accepted,
                    rejected: info.rejected
                }
            };
            
            fs.writeFileSync(filename, JSON.stringify(confirmationData, null, 2));
            console.log(`✅ Confirmation sauvegardée: ${filename}`);
            
        } catch (err) {
            console.error('Erreur sauvegarde confirmation:', err);
        }
    }

    saveEmailError(contactData, error) {
        try {
            const errorsDir = 'email_errors';
            if (!fs.existsSync(errorsDir)) {
                fs.mkdirSync(errorsDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = path.join(errorsDir, `error_${timestamp}.json`);
            
            const errorData = {
                timestamp: new Date().toISOString(),
                contactData: {
                    name: contactData.name,
                    email: contactData.email,
                    subject: contactData.subject,
                    messageLength: contactData.message ? contactData.message.length : 0
                },
                error: {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    command: error.command,
                    stack: error.stack
                },
                environment: {
                    NODE_ENV: process.env.NODE_ENV,
                    EMAIL_USER: process.env.EMAIL_USER || 'non défini',
                    EMAIL_PASS: process.env.EMAIL_PASS ? '***' : 'non défini',
                    EMAIL_HOST: process.env.EMAIL_HOST || 'non défini',
                    EMAIL_PORT: process.env.EMAIL_PORT || 'non défini',
                    FRONTEND_URL: process.env.FRONTEND_URL || 'non défini'
                }
            };
            
            fs.writeFileSync(filename, JSON.stringify(errorData, null, 2));
            console.log(`❌ Erreur sauvegardée: ${filename}`);
            
        } catch (err) {
            console.error('Erreur lors de la sauvegarde d\'erreur:', err);
        }
    }

    generateEmailTemplate(contactData) {
        const subjectText = this.getSubjectText(contactData.subject);
        const dateTime = new Date().toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau Message de Contact - Portfolio</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 40px auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            animation: float 20s linear infinite;
        }
        @keyframes float {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .header h1 {
            margin: 0 0 15px 0;
            font-size: 36px;
            font-weight: 800;
            position: relative;
            z-index: 1;
        }
        .header .subtitle {
            font-size: 18px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        .badge {
            display: inline-block;
            padding: 8px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 15px;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 50px 40px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid #e2e8f0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .info-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-value {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
        }
        .info-value a {
            color: #3b82f6;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        .info-value a:hover {
            color: #1d4ed8;
            text-decoration: underline;
        }
        .message-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 15px;
            padding: 35px;
            margin: 40px 0;
            border-left: 5px solid #0ea5e9;
        }
        .message-box h3 {
            color: #0369a1;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 22px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .message-content {
            white-space: pre-wrap;
            font-size: 16px;
            line-height: 1.8;
            color: #0f172a;
            background: white;
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #cbd5e1;
        }
        .attachment {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            padding: 20px;
            margin-top: 25px;
            display: flex;
            align-items: center;
            gap: 15px;
            border: 2px dashed #f59e0b;
        }
        .attachment-icon {
            font-size: 24px;
        }
        .attachment-info h4 {
            margin: 0 0 5px 0;
            color: #92400e;
            font-size: 16px;
        }
        .attachment-info p {
            margin: 0;
            color: #b45309;
            font-size: 14px;
        }
        .actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 50px;
        }
        .action-btn {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 18px 25px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            text-decoration: none;
            display: block;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .action-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }
        .action-btn.reply {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        .action-btn.reply:hover {
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }
        .footer {
            text-align: center;
            padding: 30px 40px;
            background: #f8fafc;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 5px 0;
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 15px;
        }
        .status-badge::before {
            content: '✓';
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Nouveau Message</h1>
            <div class="subtitle">Formulaire de contact - Portfolio</div>
            <div class="badge">${dateTime}</div>
        </div>
        
        <div class="content">
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">👤 Nom complet</div>
                    <div class="info-value">${contactData.name}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">📧 Adresse email</div>
                    <div class="info-value">
                        <a href="mailto:${contactData.email}">${contactData.email}</a>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-label">🎯 Type de demande</div>
                    <div class="info-value">
                        ${subjectText}
                        <span class="status-badge">${contactData.subject}</span>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-label">🌐 Adresse IP</div>
                    <div class="info-value">${contactData.ipAddress || 'Non disponible'}</div>
                </div>
            </div>
            
            <div class="message-box">
                <h3>💬 Message reçu</h3>
                <div class="message-content">${contactData.message}</div>
            </div>
            
            ${contactData.attachment ? `
            <div class="attachment">
                <div class="attachment-icon">📎</div>
                <div class="attachment-info">
                    <h4>Fichier joint</h4>
                    <p>${contactData.attachment.filename} • ${Math.round(contactData.attachment.size / 1024)}KB • ${contactData.attachment.mimetype}</p>
                </div>
            </div>
            ` : ''}
            
            <div class="actions">
                <a href="mailto:${contactData.email}?subject=Re: ${subjectText}" class="action-btn reply">
                    📧 Répondre maintenant
                </a>
                <div class="action-btn" onclick="window.open('https://portfolio-judicael.vercel.app', '_blank')">
                    🌐 Voir le portfolio
                </div>
            </div>
            
            <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 15px; border-left: 5px solid #f59e0b;">
                <h4 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">📋 Recommandations</h4>
                <ul style="margin: 0; padding-left: 20px; color: #b45309;">
                    <li>Répondre dans les 24 heures</li>
                    <li>Ajouter à votre CRM ou base de contacts</li>
                    <li>Noter la demande pour suivi</li>
                    <li>Vérifier le fichier joint si présent</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Ce message a été envoyé automatiquement depuis votre formulaire de contact portfolio.</p>
            <p>Serveur: ${process.env.NODE_ENV || 'development'} • ID: ${Date.now()}</p>
            <p>© ${new Date().getFullYear()} Portfolio - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    generateTextVersion(contactData) {
        const subjectText = this.getSubjectText(contactData.subject);
        const divider = '='.repeat(60);
        
        return `
${divider}
NOUVEAU MESSAGE DE CONTACT - PORTFOLIO
${divider}

👤 NOM: ${contactData.name}
📧 EMAIL: ${contactData.email}
🎯 SUJET: ${subjectText} (${contactData.subject})
📅 DATE: ${new Date().toLocaleString('fr-FR')}
🌐 IP: ${contactData.ipAddress || 'Non disponible'}
🏷️ MODE: ${process.env.NODE_ENV || 'development'}

${divider}
💬 MESSAGE:
${divider}

${contactData.message}

${contactData.attachment ? `
${divider}
📎 PIÈCE JOINTE:
${divider}
Fichier: ${contactData.attachment.filename}
Taille: ${Math.round(contactData.attachment.size / 1024)}KB
Type: ${contactData.attachment.mimetype}
` : ''}

${divider}
INFORMATIONS TECHNIQUES
${divider}
- Envoyé depuis: ${process.env.FRONTEND_URL || 'Portfolio'}
- Serveur: ${process.env.NODE_ENV || 'development'}
- Timestamp: ${new Date().toISOString()}
- ID unique: ${Date.now()}

${divider}
© ${new Date().getFullYear()} Portfolio - Formulaire de contact
${divider}
        `;
    }
}

module.exports = new EmailService();
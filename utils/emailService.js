const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService {
    constructor() {
        // Initialiser le transporteur Gmail
        this.transporter = null;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            console.log('📧 Initialisation du service email...');
            console.log('📧 Email utilisé:', process.env.EMAIL_USER);
            
            // Créer le transporteur
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: false, // true pour 465, false pour 587
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Tester la connexion
            await this.transporter.verify();
            console.log('✅ Connexion SMTP réussie avec Gmail');
            console.log('📧 Prêt à envoyer des emails réels!');
            
        } catch (error) {
            console.error('❌ Échec de la connexion SMTP:', error.message);
            console.log('⚠️  Vérifiez votre mot de passe d\'application Gmail');
            console.log('📝 Mode simulation activé en attendant');
            this.transporter = null;
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
        try {
            const subjectText = this.getSubjectText(contactData.subject);
            
            // 1. Sauvegarder localement d'abord
            this.saveEmailLocally(contactData, subjectText);
            
            // 2. Si le transporteur est configuré, envoyer un vrai email
            if (this.transporter) {
                console.log('\n📤 ENVOI D\'EMAIL RÉEL...');
                
                const mailOptions = {
                    from: process.env.EMAIL_FROM || `"Contact Form" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_TO,
                    replyTo: contactData.email,
                    subject: `📧 Nouveau message: ${subjectText} - ${contactData.name}`,
                    html: this.generateEmailTemplate(contactData),
                    text: this.generateTextVersion(contactData)
                };

                // Ajouter la pièce jointe si elle existe
                if (contactData.attachment && contactData.attachment.path) {
                    mailOptions.attachments = [{
                        filename: contactData.attachment.filename,
                        path: contactData.attachment.path,
                        contentType: contactData.attachment.mimetype
                    }];
                }

                const info = await this.transporter.sendMail(mailOptions);
                
                console.log('✅ Email envoyé avec succès!');
                console.log('📧 ID du message:', info.messageId);
                console.log('👤 Destinataire:', process.env.EMAIL_TO);
                
                return { 
                    success: true, 
                    messageId: info.messageId,
                    realEmail: true
                };
            } else {
                // Mode simulation
                console.log('\n📧 [SIMULATION] Nouveau message (SMTP non disponible):');
                console.log('   👤 Nom:', contactData.name);
                console.log('   📧 Email:', contactData.email);
                console.log('   🎯 Sujet:', subjectText);
                
                return { 
                    success: true, 
                    messageId: `simulated-${Date.now()}`,
                    simulated: true
                };
            }
            
        } catch (error) {
            console.error('❌ Erreur d\'envoi d\'email:', error.message);
            
            // En cas d'erreur, on sauvegarde quand même localement
            return { 
                success: false, 
                error: error.message,
                simulated: true
            };
        }
    }

    saveEmailLocally(contactData, subjectText) {
        try {
            const emailsDir = 'emails_logs';
            if (!fs.existsSync(emailsDir)) {
                fs.mkdirSync(emailsDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeName = contactData.name.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = path.join(emailsDir, `message_${timestamp}_${safeName}.json`);
            
            const emailData = {
                timestamp: new Date().toISOString(),
                to: process.env.EMAIL_TO,
                subject: subjectText,
                from: contactData.email,
                data: {
                    name: contactData.name,
                    email: contactData.email,
                    subject: contactData.subject,
                    message: contactData.message,
                    ipAddress: contactData.ipAddress,
                    date: new Date().toLocaleString('fr-FR')
                }
            };
            
            fs.writeFileSync(filename, JSON.stringify(emailData, null, 2));
            console.log(`📁 Message sauvegardé: ${filename}`);
            
            return { success: true, filename };
        } catch (err) {
            console.error('Erreur sauvegarde locale:', err);
            return { success: false, error: err.message };
        }
    }

    generateEmailTemplate(contactData) {
        const subjectText = this.getSubjectText(contactData.subject);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau Message de Contact</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .info-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
        }
        .info-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
            min-width: 120px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .info-value {
            color: #2d3748;
            font-weight: 500;
        }
        .message-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 25px;
            border-radius: 0 10px 10px 0;
            margin: 25px 0;
        }
        .message-box h3 {
            color: #4a5568;
            margin-top: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .attachment {
            background: #e8f4fc;
            border: 1px dashed #4299e1;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }
        .footer {
            text-align: center;
            padding: 25px;
            background: #f8f9fa;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .badge {
            display: inline-block;
            padding: 5px 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Nouveau Message de Contact</h1>
            <div class="date">${new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</div>
        </div>
        
        <div class="content">
            <div class="info-card">
                <div class="info-row">
                    <div class="info-label">👤 Nom:</div>
                    <div class="info-value">${contactData.name}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">📧 Email:</div>
                    <div class="info-value">
                        <a href="mailto:${contactData.email}" style="color: #667eea; text-decoration: none;">
                            ${contactData.email}
                        </a>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">🎯 Sujet:</div>
                    <div class="info-value">
                        ${subjectText}
                        <span class="badge">${contactData.subject}</span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">🕐 Date:</div>
                    <div class="info-value">${new Date().toLocaleString('fr-FR')}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🌐 IP:</div>
                    <div class="info-value">${contactData.ipAddress || 'Non disponible'}</div>
                </div>
            </div>
            
            <div class="message-box">
                <h3>💬 Message:</h3>
                <p style="white-space: pre-wrap;">${contactData.message}</p>
            </div>
            
            ${contactData.attachment ? `
            <div class="attachment">
                📎 <strong>Pièce jointe:</strong> ${contactData.attachment.filename}
                <br>
                <small>Taille: ${Math.round(contactData.attachment.size / 1024)}KB | Type: ${contactData.attachment.mimetype}</small>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding: 20px; background: #f0fff4; border-radius: 10px; border-left: 4px solid #38a169;">
                <strong>📋 Actions recommandées:</strong>
                <ul style="margin: 10px 0 0 20px;">
                    <li>Répondre dans les 24 heures</li>
                    <li>Classer la demande dans la base de données</li>
                    <li>Vérifier le fichier joint si présent</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Ce message a été envoyé depuis votre formulaire de contact portfolio.</p>
            <p style="font-size: 12px; opacity: 0.7;">ID: ${Date.now()}</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    generateTextVersion(contactData) {
        const subjectText = this.getSubjectText(contactData.subject);
        return `
NOUVEAU MESSAGE DE CONTACT - PORTFOLIO
=======================================

👤 Nom: ${contactData.name}
📧 Email: ${contactData.email}
🎯 Sujet: ${subjectText} (${contactData.subject})
🕐 Date: ${new Date().toLocaleString('fr-FR')}
🌐 IP: ${contactData.ipAddress || 'Non disponible'}

💬 MESSAGE:
${contactData.message}

${contactData.attachment ? `📎 Pièce jointe: ${contactData.attachment.filename} (${Math.round(contactData.attachment.size / 1024)}KB)` : ''}

---
Ce message a été envoyé depuis le formulaire de contact de votre portfolio.
        `;
    }
}

module.exports = new EmailService();
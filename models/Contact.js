const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
    },
    subject: {
        type: String,
        required: [true, 'Le sujet est requis'],
        enum: {
            values: ['recruitment', 'project', 'collaboration', 'freelance', 'consultation', 'other'],
            message: 'Veuillez sélectionner un sujet valide'
        }
    },
    message: {
        type: String,
        required: [true, 'Le message est requis'],
        trim: true,
        minlength: [10, 'Le message doit contenir au moins 10 caractères'],
        maxlength: [5000, 'Le message ne peut pas dépasser 5000 caractères']
    },
    attachment: {
        filename: String,
        path: String,
        mimetype: String,
        size: Number
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied', 'archived'],
        default: 'pending'
    },
    isSpam: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour les recherches fréquentes
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });

// Virtual pour le sujet formaté
contactSchema.virtual('subjectFormatted').get(function() {
    const subjects = {
        recruitment: "🚀 Opportunité d'emploi",
        project: "💡 Projet sur mesure",
        collaboration: "🤝 Partenariat",
        freelance: "💼 Mission freelance",
        consultation: "📊 Consultation",
        other: "✨ Autre demande"
    };
    return subjects[this.subject] || this.subject;
});

// Méthode pour marquer comme lu
contactSchema.methods.markAsRead = function() {
    this.status = 'read';
    return this.save();
};

// Méthode pour marquer comme répondu
contactSchema.methods.markAsReplied = function() {
    this.status = 'replied';
    return this.save();
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
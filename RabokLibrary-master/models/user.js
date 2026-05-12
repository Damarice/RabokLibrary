/**
 * User Model
 * Represents researchers, professors, and academic users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },

    // Academic Information
    institution: {
        type: String,
        required: [true, 'Institution is required'],
        trim: true,
        maxlength: [200, 'Institution name cannot exceed 200 characters']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: [
            'biology',
            'chemistry',
            'physics',
            'mathematics',
            'computer-science',
            'engineering',
            'medicine',
            'social-sciences',
            'humanities',
            'other'
        ]
    },
    position: {
        type: String,
        required: [true, 'Academic position is required'],
        enum: [
            'professor',
            'associate-professor',
            'assistant-professor',
            'postdoc',
            'phd-student',
            'researcher',
            'other'
        ]
    },
    orcidId: {
        type: String,
        match: [/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'Please provide a valid ORCID ID'],
        sparse: true // Allow multiple null values
    },

    // Account Status
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'reviewer', 'editor', 'admin'],
        default: 'user'
    },

    // Verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Profile
    bio: {
        type: String,
        maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    researchInterests: [{
        type: String,
        trim: true
    }],
    website: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    profileImage: String,

    // Statistics
    submissionsCount: {
        type: Number,
        default: 0
    },
    reviewsCompletedCount: {
        type: Number,
        default: 0
    },
    publicationsCount: {
        type: Number,
        default: 0
    },

    // Preferences
    emailNotifications: {
        newAssignments: { type: Boolean, default: true },
        statusUpdates: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false }
    },
    reviewPreferences: {
        fields: [String],
        maxSimultaneousReviews: { type: Number, default: 3 },
        averageReviewTime: { type: Number, default: 14 } // days
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ institution: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isVerified: 1, isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for submissions
userSchema.virtual('submissions', {
    ref: 'Manuscript',
    localField: '_id',
    foreignField: 'authors.user'
});

// Virtual for reviews
userSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'reviewer'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return token;
};

module.exports = mongoose.model('User', userSchema);
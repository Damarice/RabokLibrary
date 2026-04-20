/**
 * Review Model
 * Represents peer reviews for manuscripts
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Basic Information
    manuscript: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manuscript',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Review Details
    reviewId: {
        type: String,
        unique: true,
        required: true
    },
    round: {
        type: Number,
        default: 1,
        min: 1
    },

    // Status and Timeline
    status: {
        type: String,
        enum: [
            'invited',
            'accepted',
            'declined',
            'in-progress',
            'completed',
            'overdue',
            'cancelled'
        ],
        default: 'invited'
    },
    invitedAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: Date,
    declinedAt: Date,
    startedAt: Date,
    completedAt: Date,
    dueDate: {
        type: Date,
        required: true
    },

    // Review Content
    recommendation: {
        type: String,
        enum: [
            'accept',
            'minor-revisions',
            'major-revisions',
            'reject'
        ]
    },
    
    // Detailed Evaluation
    evaluation: {
        // Overall Assessment
        overallRating: {
            type: Number,
            min: 1,
            max: 5
        },
        
        // Specific Criteria (1-5 scale)
        novelty: {
            type: Number,
            min: 1,
            max: 5
        },
        significance: {
            type: Number,
            min: 1,
            max: 5
        },
        methodology: {
            type: Number,
            min: 1,
            max: 5
        },
        clarity: {
            type: Number,
            min: 1,
            max: 5
        },
        presentation: {
            type: Number,
            min: 1,
            max: 5
        },
        
        // Written Feedback
        summary: {
            type: String,
            maxlength: [2000, 'Summary cannot exceed 2000 characters']
        },
        strengths: {
            type: String,
            maxlength: [2000, 'Strengths section cannot exceed 2000 characters']
        },
        weaknesses: {
            type: String,
            maxlength: [2000, 'Weaknesses section cannot exceed 2000 characters']
        },
        detailedComments: {
            type: String,
            maxlength: [5000, 'Detailed comments cannot exceed 5000 characters']
        },
        confidentialComments: {
            type: String,
            maxlength: [2000, 'Confidential comments cannot exceed 2000 characters']
        }
    },

    // Specific Comments
    comments: [{
        section: {
            type: String,
            enum: [
                'title',
                'abstract',
                'introduction',
                'methodology',
                'results',
                'discussion',
                'conclusion',
                'references',
                'figures',
                'tables',
                'general'
            ]
        },
        lineNumber: Number,
        comment: {
            type: String,
            required: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters']
        },
        type: {
            type: String,
            enum: ['suggestion', 'correction', 'question', 'praise'],
            default: 'suggestion'
        },
        severity: {
            type: String,
            enum: ['minor', 'major', 'critical'],
            default: 'minor'
        }
    }],

    // Files
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimeType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Review Settings
    isAnonymous: {
        type: Boolean,
        default: true
    },
    isConfidential: {
        type: Boolean,
        default: true
    },
    
    // Quality Metrics
    qualityScore: {
        type: Number,
        min: 0,
        max: 100
    },
    helpfulnessRating: {
        type: Number,
        min: 1,
        max: 5
    },
    
    // Reviewer Information
    reviewerExpertise: {
        type: String,
        enum: ['expert', 'knowledgeable', 'some-knowledge', 'limited'],
        required: true
    },
    conflictOfInterest: {
        type: Boolean,
        default: false
    },
    conflictDetails: String,

    // Time Tracking
    timeSpent: {
        type: Number, // in minutes
        min: 0
    },
    
    // Reminders
    remindersSent: [{
        sentAt: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['initial', 'reminder', 'urgent', 'final']
        }
    }],

    // Revision Tracking
    revisionRequested: {
        type: Boolean,
        default: false
    },
    revisionComments: String,
    
    // Internal Notes
    internalNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Metadata
    version: {
        type: Number,
        default: 1
    },
    language: {
        type: String,
        default: 'en'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ reviewId: 1 });
reviewSchema.index({ manuscript: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ dueDate: 1 });
reviewSchema.index({ completedAt: -1 });
reviewSchema.index({ round: 1 });

// Compound indexes
reviewSchema.index({ manuscript: 1, reviewer: 1, round: 1 }, { unique: true });
reviewSchema.index({ status: 1, dueDate: 1 });

// Virtual for days remaining
reviewSchema.virtual('daysRemaining').get(function() {
    if (!this.dueDate) return null;
    const now = new Date();
    const diffTime = this.dueDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
reviewSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.status === 'completed') return false;
    return new Date() > this.dueDate;
});

// Virtual for review duration
reviewSchema.virtual('reviewDuration').get(function() {
    if (!this.startedAt || !this.completedAt) return null;
    return Math.ceil((this.completedAt - this.startedAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate review ID
reviewSchema.pre('save', function(next) {
    if (this.isNew && !this.reviewId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        this.reviewId = `REV-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

// Pre-save middleware to update status based on dates
reviewSchema.pre('save', function(next) {
    const now = new Date();
    
    if (this.acceptedAt && !this.startedAt && this.status === 'accepted') {
        this.status = 'in-progress';
        this.startedAt = now;
    }
    
    if (this.completedAt && this.status !== 'completed') {
        this.status = 'completed';
    }
    
    if (!this.completedAt && this.dueDate < now && this.status === 'in-progress') {
        this.status = 'overdue';
    }
    
    next();
});

// Method to accept review invitation
reviewSchema.methods.acceptInvitation = function() {
    this.status = 'accepted';
    this.acceptedAt = new Date();
    return this.save();
};

// Method to decline review invitation
reviewSchema.methods.declineInvitation = function(reason) {
    this.status = 'declined';
    this.declinedAt = new Date();
    if (reason) {
        this.internalNotes.push({
            note: `Declined: ${reason}`,
            addedAt: new Date()
        });
    }
    return this.save();
};

// Method to submit review
reviewSchema.methods.submitReview = function(reviewData) {
    this.evaluation = reviewData.evaluation;
    this.recommendation = reviewData.recommendation;
    this.comments = reviewData.comments || [];
    this.reviewerExpertise = reviewData.reviewerExpertise;
    this.timeSpent = reviewData.timeSpent;
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};

// Method to send reminder
reviewSchema.methods.sendReminder = function(type = 'reminder') {
    this.remindersSent.push({
        type,
        sentAt: new Date()
    });
    return this.save();
};

// Static method to get overdue reviews
reviewSchema.statics.getOverdueReviews = function() {
    const now = new Date();
    return this.find({
        status: { $in: ['accepted', 'in-progress'] },
        dueDate: { $lt: now }
    }).populate('manuscript reviewer');
};

// Static method to get reviews due soon
reviewSchema.statics.getReviewsDueSoon = function(days = 3) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return this.find({
        status: { $in: ['accepted', 'in-progress'] },
        dueDate: { $gte: now, $lte: futureDate }
    }).populate('manuscript reviewer');
};

// Static method to calculate reviewer statistics
reviewSchema.statics.getReviewerStats = function(reviewerId) {
    return this.aggregate([
        { $match: { reviewer: mongoose.Types.ObjectId(reviewerId) } },
        {
            $group: {
                _id: '$reviewer',
                totalReviews: { $sum: 1 },
                completedReviews: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                averageRating: { $avg: '$evaluation.overallRating' },
                averageTimeSpent: { $avg: '$timeSpent' },
                onTimeReviews: {
                    $sum: {
                        $cond: [
                            { $lte: ['$completedAt', '$dueDate'] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);
};

module.exports = mongoose.model('Review', reviewSchema);
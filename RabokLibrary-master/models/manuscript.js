/**
 * Manuscript Model
 * Represents submitted research papers and documents
 */

const mongoose = require('mongoose');

const manuscriptSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [500, 'Title cannot exceed 500 characters']
    },
    abstract: {
        type: String,
        required: [true, 'Abstract is required'],
        maxlength: [3000, 'Abstract cannot exceed 3000 characters']
    },
    keywords: [{
        type: String,
        trim: true,
        maxlength: [50, 'Each keyword cannot exceed 50 characters']
    }],
    
    // Classification
    type: {
        type: String,
        required: [true, 'Manuscript type is required'],
        enum: [
            'research-article',
            'review-article',
            'short-communication',
            'case-study',
            'technical-note',
            'book-chapter',
            'conference-paper'
        ]
    },
    field: {
        type: String,
        required: [true, 'Research field is required'],
        enum: [
            'biology',
            'chemistry',
            'physics',
            'mathematics',
            'computer-science',
            'engineering',
            'medicine',
            'environmental',
            'social-sciences',
            'interdisciplinary'
        ]
    },
    subfield: {
        type: String,
        trim: true
    },

    // Authors
    authors: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        affiliation: {
            type: String,
            required: true,
            trim: true
        },
        orcidId: {
            type: String,
            match: [/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'Please provide a valid ORCID ID']
        },
        isCorresponding: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            required: true
        }
    }],

    // Submission Details
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissionId: {
        type: String,
        unique: true,
        required: true
    },
    
    // Files
    files: [{
        type: {
            type: String,
            enum: ['manuscript', 'figures', 'supplementary'],
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Review Process
    status: {
        type: String,
        enum: [
            'submitted',
            'under-initial-review',
            'assigned-for-review',
            'under-peer-review',
            'revision-requested',
            'revised-submitted',
            'accepted',
            'rejected',
            'withdrawn'
        ],
        default: 'submitted'
    },
    
    // Review Preferences
    suggestedReviewers: [{
        name: String,
        email: String,
        affiliation: String,
        expertise: String
    }],
    excludedReviewers: [{
        name: String,
        email: String,
        reason: String
    }],
    reviewTimeline: {
        type: String,
        enum: ['standard', 'expedited', 'extended'],
        default: 'standard'
    },
    openReview: {
        type: Boolean,
        default: false
    },
    preprintConsent: {
        type: Boolean,
        default: false
    },

    // Editorial Assignment
    assignedEditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    editorAssignedAt: Date,

    // Reviews
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],

    // Versions
    version: {
        type: Number,
        default: 1
    },
    previousVersions: [{
        version: Number,
        files: [mongoose.Schema.Types.Mixed],
        submittedAt: Date,
        changes: String
    }],

    // Publication
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
    doi: String,
    journal: String,
    volume: String,
    issue: String,
    pages: String,

    // Metrics
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    citations: {
        type: Number,
        default: 0
    },

    // Agreements
    agreements: {
        originality: {
            type: Boolean,
            required: true
        },
        ethics: {
            type: Boolean,
            required: true
        },
        copyright: {
            type: Boolean,
            required: true
        },
        agreedAt: {
            type: Date,
            default: Date.now
        }
    },

    // Timeline
    timeline: [{
        status: String,
        date: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Metadata
    language: {
        type: String,
        default: 'en'
    },
    wordCount: Number,
    pageCount: Number,
    
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
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
manuscriptSchema.index({ submissionId: 1 });
manuscriptSchema.index({ status: 1 });
manuscriptSchema.index({ field: 1 });
manuscriptSchema.index({ type: 1 });
manuscriptSchema.index({ submittedBy: 1 });
manuscriptSchema.index({ assignedEditor: 1 });
manuscriptSchema.index({ isPublished: 1 });
manuscriptSchema.index({ createdAt: -1 });
manuscriptSchema.index({ 'authors.user': 1 });

// Text search index
manuscriptSchema.index({
    title: 'text',
    abstract: 'text',
    keywords: 'text'
});

// Virtual for corresponding author
manuscriptSchema.virtual('correspondingAuthor').get(function() {
    return this.authors.find(author => author.isCorresponding);
});

// Virtual for review count
manuscriptSchema.virtual('reviewCount').get(function() {
    return this.reviews.length;
});

// Pre-save middleware to generate submission ID
manuscriptSchema.pre('save', function(next) {
    if (this.isNew && !this.submissionId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        this.submissionId = `MS-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

// Method to add timeline entry
manuscriptSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
    this.timeline.push({
        status,
        note,
        updatedBy,
        date: new Date()
    });
    this.status = status;
};

// Method to increment views
manuscriptSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Method to increment downloads
manuscriptSchema.methods.incrementDownloads = function() {
    this.downloads += 1;
    return this.save();
};

// Static method to get manuscripts by status
manuscriptSchema.statics.getByStatus = function(status) {
    return this.find({ status }).populate('submittedBy authors.user assignedEditor');
};

// Static method for search
manuscriptSchema.statics.search = function(query, filters = {}) {
    const searchQuery = {
        $text: { $search: query },
        ...filters
    };
    
    return this.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .populate('submittedBy authors.user');
};

module.exports = mongoose.model('Manuscript', manuscriptSchema);
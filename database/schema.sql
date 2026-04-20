-- Raboks Library Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN (
        'biology', 'chemistry', 'physics', 'mathematics', 
        'computer-science', 'engineering', 'medicine', 
        'social-sciences', 'humanities', 'other'
    )),
    position VARCHAR(50) NOT NULL CHECK (position IN (
        'professor', 'associate-professor', 'assistant-professor',
        'postdoc', 'phd-student', 'researcher', 'other'
    )),
    orcid_id VARCHAR(19) CHECK (orcid_id ~ '^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$'),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'reviewer', 'editor', 'admin')),
    bio TEXT,
    research_interests TEXT[],
    website VARCHAR(255),
    profile_image VARCHAR(255),
    submissions_count INTEGER DEFAULT 0,
    reviews_completed_count INTEGER DEFAULT 0,
    publications_count INTEGER DEFAULT 0,
    email_notifications JSONB DEFAULT '{"newAssignments": true, "statusUpdates": true, "reminders": true, "newsletter": false}',
    review_preferences JSONB DEFAULT '{"fields": [], "maxSimultaneousReviews": 3, "averageReviewTime": 14}',
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Manuscripts table
CREATE TABLE manuscripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT[],
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'research-article', 'review-article', 'short-communication',
        'case-study', 'technical-note', 'book-chapter', 'conference-paper'
    )),
    field VARCHAR(50) NOT NULL CHECK (field IN (
        'biology', 'chemistry', 'physics', 'mathematics',
        'computer-science', 'engineering', 'medicine',
        'environmental', 'social-sciences', 'interdisciplinary'
    )),
    subfield VARCHAR(100),
    submitted_by UUID REFERENCES users(id) NOT NULL,
    submission_id VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under-initial-review', 'assigned-for-review',
        'under-peer-review', 'revision-requested', 'revised-submitted',
        'accepted', 'rejected', 'withdrawn'
    )),
    assigned_editor UUID REFERENCES users(id),
    editor_assigned_at TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    doi VARCHAR(255),
    journal VARCHAR(255),
    volume VARCHAR(50),
    issue VARCHAR(50),
    pages VARCHAR(50),
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    citations INTEGER DEFAULT 0,
    agreements JSONB NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    word_count INTEGER,
    page_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Authors table (for manuscript authors)
CREATE TABLE manuscript_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    affiliation VARCHAR(255) NOT NULL,
    orcid_id VARCHAR(19),
    is_corresponding BOOLEAN DEFAULT FALSE,
    author_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Files table
CREATE TABLE manuscript_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('manuscript', 'figures', 'supplementary')),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) NOT NULL,
    assigned_by UUID REFERENCES users(id) NOT NULL,
    review_id VARCHAR(50) UNIQUE NOT NULL,
    round INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN (
        'invited', 'accepted', 'declined', 'in-progress', 
        'completed', 'overdue', 'cancelled'
    )),
    invited_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    declined_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    recommendation VARCHAR(20) CHECK (recommendation IN (
        'accept', 'minor-revisions', 'major-revisions', 'reject'
    )),
    evaluation JSONB,
    reviewer_expertise VARCHAR(20) CHECK (reviewer_expertise IN (
        'expert', 'knowledgeable', 'some-knowledge', 'limited'
    )),
    conflict_of_interest BOOLEAN DEFAULT FALSE,
    conflict_details TEXT,
    time_spent INTEGER, -- in minutes
    is_anonymous BOOLEAN DEFAULT TRUE,
    is_confidential BOOLEAN DEFAULT TRUE,
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    helpfulness_rating INTEGER CHECK (helpfulness_rating >= 1 AND helpfulness_rating <= 5),
    revision_requested BOOLEAN DEFAULT FALSE,
    revision_comments TEXT,
    version INTEGER DEFAULT 1,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Review comments table
CREATE TABLE review_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    section VARCHAR(50) CHECK (section IN (
        'title', 'abstract', 'introduction', 'methodology',
        'results', 'discussion', 'conclusion', 'references',
        'figures', 'tables', 'general'
    )),
    line_number INTEGER,
    comment TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'suggestion' CHECK (comment_type IN (
        'suggestion', 'correction', 'question', 'praise'
    )),
    severity VARCHAR(20) DEFAULT 'minor' CHECK (severity IN (
        'minor', 'major', 'critical'
    )),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Timeline table for manuscript status tracking
CREATE TABLE manuscript_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Internal notes table
CREATE TABLE internal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    added_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reminders table for reviews
CREATE TABLE review_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN (
        'initial', 'reminder', 'urgent', 'final'
    )),
    sent_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- INDEXES
-- ===================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_verified_active ON users(is_verified, is_active);

CREATE INDEX idx_manuscripts_submission_id ON manuscripts(submission_id);
CREATE INDEX idx_manuscripts_status ON manuscripts(status);
CREATE INDEX idx_manuscripts_field ON manuscripts(field);
CREATE INDEX idx_manuscripts_submitted_by ON manuscripts(submitted_by);
CREATE INDEX idx_manuscripts_assigned_editor ON manuscripts(assigned_editor);
CREATE INDEX idx_manuscripts_published ON manuscripts(is_published);
CREATE INDEX idx_manuscripts_created_at ON manuscripts(created_at DESC);

CREATE INDEX idx_manuscript_authors_manuscript_id ON manuscript_authors(manuscript_id);
CREATE INDEX idx_manuscript_authors_user_id ON manuscript_authors(user_id);

CREATE INDEX idx_manuscript_files_manuscript_id ON manuscript_files(manuscript_id);

CREATE INDEX idx_reviews_review_id ON reviews(review_id);
CREATE INDEX idx_reviews_manuscript_id ON reviews(manuscript_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_due_date ON reviews(due_date);
CREATE INDEX idx_reviews_completed_at ON reviews(completed_at DESC);

CREATE INDEX idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX idx_manuscript_timeline_manuscript_id ON manuscript_timeline(manuscript_id);
CREATE INDEX idx_internal_notes_manuscript_id ON internal_notes(manuscript_id);
CREATE INDEX idx_internal_notes_review_id ON internal_notes(review_id);
CREATE INDEX idx_review_reminders_review_id ON review_reminders(review_id);

-- ===================================
-- TRIGGERS
-- ===================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manuscripts_updated_at
    BEFORE UPDATE ON manuscripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate submission IDs
CREATE OR REPLACE FUNCTION generate_submission_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.submission_id IS NULL THEN
        NEW.submission_id := 'MS-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_manuscript_submission_id
    BEFORE INSERT ON manuscripts
    FOR EACH ROW EXECUTE FUNCTION generate_submission_id();

-- Auto-generate review IDs
CREATE OR REPLACE FUNCTION generate_review_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.review_id IS NULL THEN
        NEW.review_id := 'REV-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_review_review_id
    BEFORE INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION generate_review_id();

-- ===================================
-- SEED DATA
-- ===================================

-- Insert admin user (password: Admin123!)
INSERT INTO users (
    first_name, last_name, email, password_hash, institution, 
    department, position, is_verified, role
) VALUES (
    'Admin', 'User', 'admin@rabokslibrary.org', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2',
    'Raboks Library R&D Center', 'other', 'other', TRUE, 'admin'
);

-- ===================================
-- ROW LEVEL SECURITY (optional)
-- ===================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

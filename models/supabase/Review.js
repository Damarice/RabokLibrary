/**
 * Review Model for Supabase
 * Handles review operations with PostgreSQL
 */

const supabase = require('../../config/supabase');

class Review {
    constructor(data) {
        Object.assign(this, data);
    }

    // Create new review
    static async create(reviewData) {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([{
                    manuscript_id: reviewData.manuscriptId,
                    reviewer_id: reviewData.reviewerId,
                    assigned_by: reviewData.assignedBy,
                    round: reviewData.round || 1,
                    due_date: reviewData.dueDate,
                    reviewer_expertise: reviewData.reviewerExpertise,
                    conflict_of_interest: reviewData.conflictOfInterest || false,
                    conflict_details: reviewData.conflictDetails,
                    is_anonymous: reviewData.isAnonymous !== false,
                    is_confidential: reviewData.isConfidential !== false
                }])
                .select()
                .single();

            if (error) throw error;
            return new Review(data);
        } catch (error) {
            throw new Error(`Failed to create review: ${error.message}`);
        }
    }

    // Find review by ID
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    manuscripts (
                        id,
                        title,
                        submission_id,
                        type,
                        field,
                        abstract
                    ),
                    users!reviews_reviewer_id_fkey (
                        id,
                        first_name,
                        last_name,
                        email,
                        institution
                    ),
                    review_comments (*)
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? new Review(data) : null;
        } catch (error) {
            throw new Error(`Failed to find review: ${error.message}`);
        }
    }

    // Find reviews by reviewer
    static async findByReviewer(reviewerId, options = {}) {
        try {
            let query = supabase
                .from('reviews')
                .select(`
                    *,
                    manuscripts (
                        id,
                        title,
                        submission_id,
                        type,
                        field
                    )
                `)
                .eq('reviewer_id', reviewerId);

            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            return data.map(review => new Review(review));
        } catch (error) {
            throw new Error(`Failed to find reviews: ${error.message}`);
        }
    }

    // Find reviews by manuscript
    static async findByManuscript(manuscriptId) {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    users!reviews_reviewer_id_fkey (
                        id,
                        first_name,
                        last_name,
                        institution
                    ),
                    review_comments (*)
                `)
                .eq('manuscript_id', manuscriptId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(review => new Review(review));
        } catch (error) {
            throw new Error(`Failed to find reviews: ${error.message}`);
        }
    }

    // Get overdue reviews
    static async getOverdueReviews() {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    manuscripts (
                        title,
                        submission_id
                    ),
                    users!reviews_reviewer_id_fkey (
                        first_name,
                        last_name,
                        email
                    )
                `)
                .in('status', ['accepted', 'in-progress'])
                .lt('due_date', new Date().toISOString());

            if (error) throw error;
            return data.map(review => new Review(review));
        } catch (error) {
            throw new Error(`Failed to get overdue reviews: ${error.message}`);
        }
    }

    // Get reviews due soon
    static async getReviewsDueSoon(days = 3) {
        try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);

            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    manuscripts (
                        title,
                        submission_id
                    ),
                    users!reviews_reviewer_id_fkey (
                        first_name,
                        last_name,
                        email
                    )
                `)
                .in('status', ['accepted', 'in-progress'])
                .gte('due_date', new Date().toISOString())
                .lte('due_date', futureDate.toISOString());

            if (error) throw error;
            return data.map(review => new Review(review));
        } catch (error) {
            throw new Error(`Failed to get reviews due soon: ${error.message}`);
        }
    }

    // Update review
    async update(updateData) {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .update(updateData)
                .eq('id', this.id)
                .select()
                .single();

            if (error) throw error;
            Object.assign(this, data);
            return this;
        } catch (error) {
            throw new Error(`Failed to update review: ${error.message}`);
        }
    }

    // Accept review invitation
    async acceptInvitation() {
        try {
            await this.update({
                status: 'accepted',
                accepted_at: new Date().toISOString()
            });
        } catch (error) {
            throw new Error(`Failed to accept invitation: ${error.message}`);
        }
    }

    // Decline review invitation
    async declineInvitation(reason) {
        try {
            await this.update({
                status: 'declined',
                declined_at: new Date().toISOString()
            });

            if (reason) {
                await supabase
                    .from('internal_notes')
                    .insert([{
                        review_id: this.id,
                        note: `Declined: ${reason}`,
                        added_by: this.reviewer_id
                    }]);
            }
        } catch (error) {
            throw new Error(`Failed to decline invitation: ${error.message}`);
        }
    }

    // Submit review
    async submitReview(reviewData) {
        try {
            await this.update({
                evaluation: reviewData.evaluation,
                recommendation: reviewData.recommendation,
                reviewer_expertise: reviewData.reviewerExpertise,
                time_spent: reviewData.timeSpent,
                status: 'completed',
                completed_at: new Date().toISOString()
            });

            // Add comments if provided
            if (reviewData.comments && reviewData.comments.length > 0) {
                const commentsData = reviewData.comments.map(comment => ({
                    review_id: this.id,
                    section: comment.section,
                    line_number: comment.lineNumber,
                    comment: comment.comment,
                    comment_type: comment.type || 'suggestion',
                    severity: comment.severity || 'minor'
                }));

                await supabase
                    .from('review_comments')
                    .insert(commentsData);
            }
        } catch (error) {
            throw new Error(`Failed to submit review: ${error.message}`);
        }
    }

    // Send reminder
    async sendReminder(type = 'reminder') {
        try {
            await supabase
                .from('review_reminders')
                .insert([{
                    review_id: this.id,
                    reminder_type: type
                }]);
        } catch (error) {
            throw new Error(`Failed to send reminder: ${error.message}`);
        }
    }

    // Get days remaining
    get daysRemaining() {
        if (!this.due_date) return null;
        const now = new Date();
        const dueDate = new Date(this.due_date);
        const diffTime = dueDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Check if overdue
    get isOverdue() {
        if (!this.due_date || this.status === 'completed') return false;
        return new Date() > new Date(this.due_date);
    }

    // Get review duration
    get reviewDuration() {
        if (!this.started_at || !this.completed_at) return null;
        const startDate = new Date(this.started_at);
        const endDate = new Date(this.completed_at);
        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    }
}

module.exports = Review;
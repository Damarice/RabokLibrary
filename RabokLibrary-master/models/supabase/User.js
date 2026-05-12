/**
 * User Model for Supabase
 * Handles user operations with PostgreSQL
 */

const supabase = require('../../config/supabase');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
    constructor(data) {
        Object.assign(this, data);
    }

    // Create new user
    static async create(userData) {
        try {
            // Hash password
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            const { data, error } = await supabase
                .from('users')
                .insert([{
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email.toLowerCase(),
                    password_hash: passwordHash,
                    institution: userData.institution,
                    department: userData.department,
                    position: userData.position,
                    orcid_id: userData.orcidId,
                    bio: userData.bio,
                    research_interests: userData.researchInterests,
                    website: userData.website
                }])
                .select()
                .single();

            if (error) throw error;
            return new User(data);
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? new User(data) : null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? new User(data) : null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    // Compare password
    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password_hash);
    }

    // Update user
    async update(updateData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', this.id)
                .select()
                .single();

            if (error) throw error;
            Object.assign(this, data);
            return this;
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    // Generate email verification token
    generateEmailVerificationToken() {
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        this.email_verification_token = hashedToken;
        this.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return token;
    }

    // Generate password reset token
    generatePasswordResetToken() {
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        this.password_reset_token = hashedToken;
        this.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        return token;
    }

    // Get full name
    get fullName() {
        return `${this.first_name} ${this.last_name}`;
    }

    // Get user submissions
    async getSubmissions() {
        try {
            const { data, error } = await supabase
                .from('manuscripts')
                .select('*')
                .eq('submitted_by', this.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            throw new Error(`Failed to get submissions: ${error.message}`);
        }
    }

    // Get user reviews
    async getReviews() {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    manuscripts (
                        title,
                        submission_id,
                        type,
                        field
                    )
                `)
                .eq('reviewer_id', this.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            throw new Error(`Failed to get reviews: ${error.message}`);
        }
    }

    // Convert to JSON (exclude sensitive data)
    toJSON() {
        const user = { ...this };
        delete user.password_hash;
        delete user.email_verification_token;
        delete user.password_reset_token;
        return user;
    }
}

module.exports = User;
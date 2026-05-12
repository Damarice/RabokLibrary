/**
 * Manuscript Model for Supabase
 * Handles manuscript operations with PostgreSQL
 */

const supabase = require('../../config/supabase');

class Manuscript {
    constructor(data) {
        Object.assign(this, data);
    }

    // Create new manuscript
    static async create(manuscriptData) {
        try {
            const { data, error } = await supabase
                .from('manuscripts')
                .insert([{
                    title: manuscriptData.title,
                    abstract: manuscriptData.abstract,
                    keywords: manuscriptData.keywords,
                    type: manuscriptData.type,
                    field: manuscriptData.field,
                    subfield: manuscriptData.subfield,
                    submitted_by: manuscriptData.submittedBy,
                    agreements: manuscriptData.agreements,
                    language: manuscriptData.language || 'en',
                    word_count: manuscriptData.wordCount,
                    page_count: manuscriptData.pageCount
                }])
                .select()
                .single();

            if (error) throw error;

            // Add authors
            if (manuscriptData.authors && manuscriptData.authors.length > 0) {
                const authorsData = manuscriptData.authors.map((author, index) => ({
                    manuscript_id: data.id,
                    user_id: author.user,
                    first_name: author.firstName,
                    last_name: author.lastName,
                    email: author.email,
                    affiliation: author.affiliation,
                    orcid_id: author.orcidId,
                    is_corresponding: author.isCorresponding,
                    author_order: index + 1
                }));

                const { error: authorsError } = await supabase
                    .from('manuscript_authors')
                    .insert(authorsData);

                if (authorsError) throw authorsError;
            }

            // Add timeline entry
            await supabase
                .from('manuscript_timeline')
                .insert([{
                    manuscript_id: data.id,
                    status: 'submitted',
                    note: 'Manuscript submitted',
                    updated_by: manuscriptData.submittedBy
                }]);

            return new Manuscript(data);
        } catch (error) {
            throw new Error(`Failed to create manuscript: ${error.message}`);
        }
    }

    // Find manuscript by ID
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('manuscripts')
                .select(`
                    *,
                    manuscript_authors (*),
                    manuscript_files (*),
                    users!manuscripts_submitted_by_fkey (
                        id,
                        first_name,
                        last_name,
                        email,
                        institution
                    )
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? new Manuscript(data) : null;
        } catch (error) {
            throw new Error(`Failed to find manuscript: ${error.message}`);
        }
    }

    // Find manuscript by submission ID
    static async findBySubmissionId(submissionId) {
        try {
            const { data, error } = await supabase
                .from('manuscripts')
                .select(`
                    *,
                    manuscript_authors (*),
                    manuscript_files (*),
                    users!manuscripts_submitted_by_fkey (
                        id,
                        first_name,
                        last_name,
                        email,
                        institution
                    )
                `)
                .eq('submission_id', submissionId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? new Manuscript(data) : null;
        } catch (error) {
            throw new Error(`Failed to find manuscript: ${error.message}`);
        }
    }

    // Get manuscripts by user
    static async findByUser(userId, options = {}) {
        try {
            let query = supabase
                .from('manuscripts')
                .select(`
                    *,
                    manuscript_authors (*),
                    reviews (count)
                `)
                .eq('submitted_by', userId);

            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            return data.map(manuscript => new Manuscript(manuscript));
        } catch (error) {
            throw new Error(`Failed to find manuscripts: ${error.message}`);
        }
    }

    // Search manuscripts
    static async search(searchQuery, filters = {}) {
        try {
            let query = supabase
                .from('manuscripts')
                .select(`
                    *,
                    manuscript_authors (*),
                    users!manuscripts_submitted_by_fkey (
                        first_name,
                        last_name,
                        institution
                    )
                `);

            if (searchQuery) {
                query = query.textSearch('title,abstract,keywords', searchQuery);
            }

            if (filters.field) {
                query = query.eq('field', filters.field);
            }

            if (filters.type) {
                query = query.eq('type', filters.type);
            }

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.isPublished !== undefined) {
                query = query.eq('is_published', filters.isPublished);
            }

            query = query.order('created_at', { ascending: false });

            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data.map(manuscript => new Manuscript(manuscript));
        } catch (error) {
            throw new Error(`Failed to search manuscripts: ${error.message}`);
        }
    }

    // Update manuscript
    async update(updateData) {
        try {
            const { data, error } = await supabase
                .from('manuscripts')
                .update(updateData)
                .eq('id', this.id)
                .select()
                .single();

            if (error) throw error;
            Object.assign(this, data);
            return this;
        } catch (error) {
            throw new Error(`Failed to update manuscript: ${error.message}`);
        }
    }

    // Add timeline entry
    async addTimelineEntry(status, note, updatedBy) {
        try {
            await supabase
                .from('manuscript_timeline')
                .insert([{
                    manuscript_id: this.id,
                    status,
                    note,
                    updated_by: updatedBy
                }]);

            // Update manuscript status
            await this.update({ status });
        } catch (error) {
            throw new Error(`Failed to add timeline entry: ${error.message}`);
        }
    }

    // Add file
    async addFile(fileData) {
        try {
            const { data, error } = await supabase
                .from('manuscript_files')
                .insert([{
                    manuscript_id: this.id,
                    file_type: fileData.type,
                    filename: fileData.filename,
                    original_name: fileData.originalName,
                    file_path: fileData.path,
                    file_size: fileData.size,
                    mime_type: fileData.mimeType
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            throw new Error(`Failed to add file: ${error.message}`);
        }
    }

    // Increment views
    async incrementViews() {
        try {
            await this.update({ views: (this.views || 0) + 1 });
        } catch (error) {
            throw new Error(`Failed to increment views: ${error.message}`);
        }
    }

    // Increment downloads
    async incrementDownloads() {
        try {
            await this.update({ downloads: (this.downloads || 0) + 1 });
        } catch (error) {
            throw new Error(`Failed to increment downloads: ${error.message}`);
        }
    }

    // Get corresponding author
    get correspondingAuthor() {
        if (this.manuscript_authors) {
            return this.manuscript_authors.find(author => author.is_corresponding);
        }
        return null;
    }

    // Get review count
    get reviewCount() {
        return this.reviews ? this.reviews.length : 0;
    }
}

module.exports = Manuscript;
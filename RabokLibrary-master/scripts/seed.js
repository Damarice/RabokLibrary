/**
 * Database Seeding Script
 * Populates the database with sample data for development and testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Manuscript = require('../models/Manuscript');
const Review = require('../models/Review');

// Sample data
const sampleUsers = [
    {
        firstName: 'Dr. Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@university.edu',
        password: 'Password123!',
        institution: 'University of Excellence',
        department: 'computer-science',
        position: 'professor',
        orcidId: '0000-0001-2345-6789',
        isVerified: true,
        role: 'user',
        bio: 'Professor of Computer Science specializing in artificial intelligence and machine learning applications in climate science.',
        researchInterests: ['Artificial Intelligence', 'Climate Modeling', 'Machine Learning', 'Data Science']
    },
    {
        firstName: 'Prof. Michael',
        lastName: 'Rodriguez',
        email: 'michael.rodriguez@research.org',
        password: 'Password123!',
        institution: 'Research Institute of Technology',
        department: 'engineering',
        position: 'professor',
        orcidId: '0000-0002-3456-7890',
        isVerified: true,
        role: 'reviewer',
        bio: 'Engineering professor with expertise in sustainable materials and renewable energy systems.',
        researchInterests: ['Sustainable Engineering', 'Materials Science', 'Renewable Energy']
    },
    {
        firstName: 'Dr. Aisha',
        lastName: 'Patel',
        email: 'aisha.patel@scienceuni.edu',
        password: 'Password123!',
        institution: 'Science University',
        department: 'environmental',
        position: 'associate-professor',
        orcidId: '0000-0003-4567-8901',
        isVerified: true,
        role: 'editor',
        bio: 'Environmental scientist focused on climate change impacts and mitigation strategies.',
        researchInterests: ['Climate Change', 'Environmental Policy', 'Sustainability']
    },
    {
        firstName: 'Dr. James',
        lastName: 'Liu',
        email: 'james.liu@biotech.edu',
        password: 'Password123!',
        institution: 'Biotechnology Institute',
        department: 'biology',
        position: 'assistant-professor',
        orcidId: '0000-0004-5678-9012',
        isVerified: true,
        role: 'user',
        bio: 'Systems biologist working on computational models of cellular networks.',
        researchInterests: ['Systems Biology', 'Computational Biology', 'Cell Biology']
    },
    {
        firstName: 'Prof. Elena',
        lastName: 'Kowalski',
        email: 'elena.kowalski@physics.edu',
        password: 'Password123!',
        institution: 'Physics Research Center',
        department: 'physics',
        position: 'professor',
        orcidId: '0000-0005-6789-0123',
        isVerified: true,
        role: 'reviewer',
        bio: 'Theoretical physicist specializing in quantum mechanics and quantum computing applications.',
        researchInterests: ['Quantum Physics', 'Quantum Computing', 'Theoretical Physics']
    }
];

const sampleManuscripts = [
    {
        title: 'Artificial Intelligence for Sustainable Development: A Comprehensive Framework',
        abstract: 'This groundbreaking study presents a novel framework for applying artificial intelligence techniques to address global sustainability challenges. We developed and tested machine learning models for renewable energy optimization, climate prediction, and resource management. Our approach combines deep learning algorithms with traditional environmental science methodologies to create more accurate and actionable sustainability solutions. The framework was validated through case studies in solar energy optimization and climate modeling, showing significant improvements in prediction accuracy and resource efficiency. Results demonstrate that AI-driven approaches can enhance sustainability efforts by up to 35% compared to conventional methods. This research provides a foundation for future work in AI-assisted environmental management and offers practical tools for policymakers and researchers working on sustainability challenges.',
        keywords: ['artificial intelligence', 'sustainability', 'machine learning', 'climate change', 'renewable energy', 'environmental science'],
        type: 'research-article',
        field: 'interdisciplinary',
        subfield: 'AI for Sustainability',
        isPublished: true,
        publishedAt: new Date('2024-03-15'),
        doi: '10.1000/raboks.2024.001',
        journal: 'Nature Sustainability',
        volume: '7',
        issue: '3',
        pages: '123-145',
        views: 1247,
        downloads: 89,
        citations: 12
    },
    {
        title: 'Multi-Scale Modeling of Cellular Networks: From Molecules to Organisms',
        abstract: 'Understanding complex biological systems requires integrated approaches that span multiple scales of organization. This study presents an innovative computational framework for modeling cellular networks from molecular interactions to organism-level behaviors. We developed a multi-scale simulation platform that integrates molecular dynamics, cellular automata, and population-level models to capture the hierarchical nature of biological systems. The framework was applied to study cancer cell migration, immune system responses, and developmental biology processes. Our results show that multi-scale approaches provide insights that are not accessible through single-scale models, revealing emergent properties that arise from cross-scale interactions. The platform successfully predicted experimental outcomes in 78% of test cases, demonstrating its utility for biological research and drug discovery applications.',
        keywords: ['systems biology', 'multi-scale modeling', 'cellular networks', 'computational biology', 'molecular dynamics'],
        type: 'research-article',
        field: 'biology',
        subfield: 'Systems Biology',
        isPublished: true,
        publishedAt: new Date('2024-02-28'),
        doi: '10.1000/raboks.2024.002',
        journal: 'Proceedings of the International Conference on Systems Biology',
        views: 2156,
        downloads: 234,
        citations: 28
    },
    {
        title: 'Sustainable Materials for Next-Generation Solar Cells',
        abstract: 'The development of efficient and environmentally friendly solar cell materials is crucial for the transition to renewable energy. This research investigates novel perovskite materials with enhanced stability and reduced environmental impact for photovoltaic applications. We synthesized and characterized a series of lead-free perovskite compounds using environmentally benign processing methods. The materials were evaluated for their optical, electrical, and stability properties under various environmental conditions. Our best-performing material achieved a power conversion efficiency of 18.5% while maintaining 90% of its initial performance after 1000 hours of continuous operation. Life cycle analysis shows a 40% reduction in environmental impact compared to conventional silicon solar cells. These findings contribute to the development of sustainable photovoltaic technologies and provide a pathway for large-scale deployment of environmentally friendly solar energy systems.',
        keywords: ['solar cells', 'perovskite materials', 'sustainability', 'renewable energy', 'photovoltaics', 'materials science'],
        type: 'research-article',
        field: 'engineering',
        subfield: 'Materials Engineering',
        isPublished: true,
        publishedAt: new Date('2024-01-20'),
        doi: '10.1000/raboks.2024.003',
        journal: 'Advanced Materials',
        views: 987,
        downloads: 156,
        citations: 7
    }
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Manuscript.deleteMany({});
        await Review.deleteMany({});

        console.log('Cleared existing data');

        // Create users
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`Created user: ${user.fullName}`);
        }

        // Create manuscripts
        for (let i = 0; i < sampleManuscripts.length; i++) {
            const manuscriptData = sampleManuscripts[i];
            const submitter = createdUsers[i % createdUsers.length];
            
            // Create authors array
            const authors = [
                {
                    user: submitter._id,
                    firstName: submitter.firstName,
                    lastName: submitter.lastName,
                    email: submitter.email,
                    affiliation: submitter.institution,
                    orcidId: submitter.orcidId,
                    isCorresponding: true,
                    order: 1
                }
            ];

            // Add co-authors
            if (i < createdUsers.length - 1) {
                const coAuthor = createdUsers[i + 1];
                authors.push({
                    user: coAuthor._id,
                    firstName: coAuthor.firstName,
                    lastName: coAuthor.lastName,
                    email: coAuthor.email,
                    affiliation: coAuthor.institution,
                    orcidId: coAuthor.orcidId,
                    isCorresponding: false,
                    order: 2
                });
            }

            const manuscript = new Manuscript({
                ...manuscriptData,
                authors,
                submittedBy: submitter._id,
                status: 'accepted',
                agreements: {
                    originality: true,
                    ethics: true,
                    copyright: true,
                    agreedAt: new Date()
                }
            });

            // Add timeline entries
            manuscript.timeline = [
                {
                    status: 'submitted',
                    date: new Date(manuscriptData.publishedAt.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days before publication
                    note: 'Manuscript submitted for review',
                    updatedBy: submitter._id
                },
                {
                    status: 'under-peer-review',
                    date: new Date(manuscriptData.publishedAt.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days before
                    note: 'Assigned for peer review',
                    updatedBy: submitter._id
                },
                {
                    status: 'accepted',
                    date: new Date(manuscriptData.publishedAt.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
                    note: 'Manuscript accepted for publication',
                    updatedBy: submitter._id
                }
            ];

            await manuscript.save();
            console.log(`Created manuscript: ${manuscript.title}`);

            // Update user submission count
            await User.findByIdAndUpdate(submitter._id, {
                $inc: { submissionsCount: 1, publicationsCount: 1 }
            });
        }

        console.log('✅ Database seeded successfully!');
        console.log(`Created ${createdUsers.length} users and ${sampleManuscripts.length} manuscripts`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run seeding if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
/**
 * Thought Leaders Page JavaScript
 * Handles dynamic content loading, filtering, and interactions
 */

// Sample data for thought leaders
const thoughtLeadersData = [
    {
        id: 1,
        name: "Dr. Sarah Chen",
        title: "Professor of Data Science",
        institution: "MIT",
        bio: "Leading researcher in machine learning and artificial intelligence with over 15 years of experience. Pioneering work in neural networks and deep learning applications for healthcare.",
        expertise: ["data-science", "AI", "machine-learning"],
        platforms: {
            linkedin: "https://linkedin.com/in/sarahchen",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "45K",
            articles: "120+",
            talks: "85"
        },
        featured: true,
        initials: "SC"
    },
    {
        id: 2,
        name: "Prof. Michael Rodriguez",
        title: "Director of Systems Biology Lab",
        institution: "Stanford University",
        bio: "Internationally recognized expert in computational biology and systems medicine. His research focuses on understanding complex biological networks and their applications in personalized medicine.",
        expertise: ["biology", "computational-biology", "medicine"],
        platforms: {
            linkedin: "https://linkedin.com/in/mrodriguez",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "38K",
            articles: "95+",
            talks: "62"
        },
        featured: true,
        initials: "MR"
    },
    {
        id: 3,
        name: "Dr. Aisha Patel",
        title: "Senior Research Scientist",
        institution: "Oxford University",
        bio: "Award-winning materials scientist specializing in sustainable materials and nanotechnology. Her work on biodegradable polymers has revolutionized packaging industry standards.",
        expertise: ["materials", "sustainability", "nanotechnology"],
        platforms: {
            linkedin: "https://linkedin.com/in/aishapatel",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "52K",
            articles: "140+",
            talks: "78"
        },
        featured: true,
        initials: "AP"
    },
    {
        id: 4,
        name: "Dr. James Thompson",
        title: "Quantum Computing Researcher",
        institution: "Caltech",
        bio: "Pioneering quantum computing applications for cryptography and optimization problems. Regular contributor to leading tech publications and conference keynote speaker.",
        expertise: ["quantum", "cryptography", "computing"],
        platforms: {
            linkedin: "https://linkedin.com/in/jamesthompson",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "41K",
            articles: "88+",
            talks: "54"
        },
        featured: false,
        initials: "JT"
    },
    {
        id: 5,
        name: "Prof. Elena Volkov",
        title: "Chair of Cognitive Science",
        institution: "Cambridge University",
        bio: "Leading expert in cognitive neuroscience and human-computer interaction. Her research bridges psychology, neuroscience, and artificial intelligence.",
        expertise: ["cognitive", "neuroscience", "HCI"],
        platforms: {
            linkedin: "https://linkedin.com/in/elenavolkov",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "47K",
            articles: "110+",
            talks: "71"
        },
        featured: false,
        initials: "EV"
    },
    {
        id: 6,
        name: "Dr. David Kim",
        title: "Environmental Data Scientist",
        institution: "UC Berkeley",
        bio: "Combining data science with environmental research to address climate change. Develops predictive models for sustainable urban development and resource management.",
        expertise: ["data-science", "sustainability", "climate"],
        platforms: {
            linkedin: "https://linkedin.com/in/davidkim",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "35K",
            articles: "76+",
            talks: "48"
        },
        featured: false,
        initials: "DK"
    },
    {
        id: 7,
        name: "Dr. Maria Santos",
        title: "Biomedical Engineer",
        institution: "Johns Hopkins",
        bio: "Innovating medical devices and diagnostic tools using advanced materials science. Her work has led to breakthrough developments in non-invasive diagnostics.",
        expertise: ["biology", "materials", "medical-devices"],
        platforms: {
            linkedin: "https://linkedin.com/in/mariasantos",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "43K",
            articles: "102+",
            talks: "65"
        },
        featured: false,
        initials: "MS"
    },
    {
        id: 8,
        name: "Prof. Robert Zhang",
        title: "AI Ethics Researcher",
        institution: "Harvard University",
        bio: "Leading voice in artificial intelligence ethics and responsible AI development. Advises governments and tech companies on AI policy and governance.",
        expertise: ["data-science", "AI", "ethics"],
        platforms: {
            linkedin: "https://linkedin.com/in/robertzhang",
            media: true,
            conferences: true,
            publications: true
        },
        stats: {
            followers: "58K",
            articles: "135+",
            talks: "92"
        },
        featured: false,
        initials: "RZ"
    }
];

// State management
let filteredLeaders = [...thoughtLeadersData];

/**
 * Initialize the page
 */
function init() {
    renderFeaturedLeaders();
    renderAllLeaders();
    setupEventListeners();
    animateImpactNumbers();
}

/**
 * Render featured thought leaders
 */
function renderFeaturedLeaders() {
    const container = document.getElementById('featured-leaders');
    const featured = thoughtLeadersData.filter(leader => leader.featured);
    
    container.innerHTML = featured.map(leader => `
        <article class="featured-leader-card">
            <div class="leader-header">
                <div class="leader-avatar">${leader.initials}</div>
                <div class="featured-badge">Featured</div>
            </div>
            <div class="leader-content">
                <h3 class="leader-name">${leader.name}</h3>
                <p class="leader-title">${leader.title}</p>
                <p class="leader-institution">${leader.institution}</p>
                <p class="leader-bio">${leader.bio}</p>
                
                <div class="leader-expertise">
                    ${leader.expertise.map(exp => `
                        <span class="expertise-tag">${formatExpertise(exp)}</span>
                    `).join('')}
                </div>
                
                <div class="leader-stats">
                    <div class="stat-item">
                        <div class="stat-value">${leader.stats.followers}</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${leader.stats.articles}</div>
                        <div class="stat-label">Articles</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${leader.stats.talks}</div>
                        <div class="stat-label">Talks</div>
                    </div>
                </div>
                
                <div class="leader-platforms">
                    ${leader.platforms.linkedin ? `
                        <a href="${leader.platforms.linkedin}" class="platform-link" target="_blank" rel="noopener">
                            <span class="platform-icon">💼</span>
                            <span>LinkedIn</span>
                        </a>
                    ` : ''}
                    ${leader.platforms.media ? `
                        <a href="#" class="platform-link">
                            <span class="platform-icon">📰</span>
                            <span>Media</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

/**
 * Render all thought leaders
 */
function renderAllLeaders() {
    const container = document.getElementById('all-leaders');
    
    if (filteredLeaders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p class="empty-state-message">No thought leaders found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredLeaders.map(leader => `
        <article class="leader-card">
            <div class="leader-card-header">
                <div class="leader-card-avatar">${leader.initials}</div>
                <div class="leader-card-info">
                    <h3 class="leader-card-name">${leader.name}</h3>
                    <p class="leader-card-title">${leader.title}</p>
                    <p class="leader-card-institution">${leader.institution}</p>
                </div>
            </div>
            
            <p class="leader-card-bio">${leader.bio}</p>
            
            <div class="leader-card-expertise">
                ${leader.expertise.slice(0, 3).map(exp => `
                    <span class="expertise-tag">${formatExpertise(exp)}</span>
                `).join('')}
            </div>
            
            <div class="leader-card-platforms">
                ${leader.platforms.linkedin ? '<div class="platform-badge" title="LinkedIn">💼</div>' : ''}
                ${leader.platforms.media ? '<div class="platform-badge" title="Media Features">📰</div>' : ''}
                ${leader.platforms.conferences ? '<div class="platform-badge" title="Conference Speaker">🎤</div>' : ''}
                ${leader.platforms.publications ? '<div class="platform-badge" title="Publications">📚</div>' : ''}
            </div>
        </article>
    `).join('');
}

/**
 * Format expertise tags for display
 */
function formatExpertise(expertise) {
    const expertiseMap = {
        'data-science': 'Data Science',
        'AI': 'Artificial Intelligence',
        'machine-learning': 'Machine Learning',
        'biology': 'Biology',
        'computational-biology': 'Computational Biology',
        'medicine': 'Medicine',
        'materials': 'Materials Science',
        'sustainability': 'Sustainability',
        'nanotechnology': 'Nanotechnology',
        'quantum': 'Quantum Computing',
        'cryptography': 'Cryptography',
        'computing': 'Computing',
        'cognitive': 'Cognitive Science',
        'neuroscience': 'Neuroscience',
        'HCI': 'Human-Computer Interaction',
        'climate': 'Climate Science',
        'medical-devices': 'Medical Devices',
        'ethics': 'Ethics'
    };
    
    return expertiseMap[expertise] || expertise;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('leader-search');
    searchInput.addEventListener('input', handleSearch);
    
    // Filter functionality
    const expertiseFilter = document.getElementById('expertise-filter');
    const platformFilter = document.getElementById('platform-filter');
    
    expertiseFilter.addEventListener('change', handleFilter);
    platformFilter.addEventListener('change', handleFilter);
    
    // Search button
    const searchButton = document.querySelector('.search-button');
    searchButton.addEventListener('click', () => {
        handleSearch({ target: searchInput });
    });
}

/**
 * Handle search input
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const expertiseFilter = document.getElementById('expertise-filter').value;
    const platformFilter = document.getElementById('platform-filter').value;
    
    filteredLeaders = thoughtLeadersData.filter(leader => {
        const matchesSearch = searchTerm === '' || 
            leader.name.toLowerCase().includes(searchTerm) ||
            leader.title.toLowerCase().includes(searchTerm) ||
            leader.institution.toLowerCase().includes(searchTerm) ||
            leader.bio.toLowerCase().includes(searchTerm) ||
            leader.expertise.some(exp => formatExpertise(exp).toLowerCase().includes(searchTerm));
        
        const matchesExpertise = expertiseFilter === 'all' || 
            leader.expertise.includes(expertiseFilter);
        
        const matchesPlatform = platformFilter === 'all' || 
            leader.platforms[platformFilter];
        
        return matchesSearch && matchesExpertise && matchesPlatform;
    });
    
    renderAllLeaders();
}

/**
 * Handle filter changes
 */
function handleFilter() {
    const searchInput = document.getElementById('leader-search');
    handleSearch({ target: searchInput });
}

/**
 * Animate impact numbers
 */
function animateImpactNumbers() {
    const impactNumbers = document.querySelectorAll('.impact-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.dataset.target);
                animateNumber(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    impactNumbers.forEach(number => observer.observe(number));
}

/**
 * Animate a number from 0 to target
 */
function animateNumber(element, target) {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format the number
        if (target >= 1 && target < 10) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

/**
 * Smooth scroll for anchor links
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    init();
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#contact') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

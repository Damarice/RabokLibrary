/**
 * Publications Page JavaScript
 * 
 * Handles search, filtering, and interactive functionality
 * for the publications page.
 * 
 * Author: Raboks Library R&D Team
 * Version: 1.0
 * Last Updated: 2024
 */

/* ===================================
   INITIALIZATION
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initializePublicationsSearch();
    initializePublicationsFilters();
    initializeLoadMore();
});

/* ===================================
   SEARCH FUNCTIONALITY
   =================================== */

/**
 * Initialize search functionality for publications
 */
function initializePublicationsSearch() {
    const searchInput = document.getElementById('publication-search');
    const searchButton = document.querySelector('.search-button');
    
    if (!searchInput) return;
    
    // Search on input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
        }, 300);
    });
    
    // Search on button click
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
    }
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value);
        }
    });
}

/**
 * Perform search across publications
 * @param {string} query - Search query
 */
function performSearch(query) {
    const publications = document.querySelectorAll('.publication-item');
    const searchTerm = query.toLowerCase().trim();
    
    publications.forEach(publication => {
        const title = publication.querySelector('.publication-item-title')?.textContent.toLowerCase() || '';
        const authors = publication.querySelector('.publication-item-authors')?.textContent.toLowerCase() || '';
        const journal = publication.querySelector('.publication-item-journal')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(searchTerm) || 
                       authors.includes(searchTerm) || 
                       journal.includes(searchTerm);
        
        if (searchTerm === '' || matches) {
            publication.style.display = 'block';
            // Add highlight effect
            if (searchTerm !== '') {
                highlightSearchTerms(publication, searchTerm);
            } else {
                removeHighlights(publication);
            }
        } else {
            publication.style.display = 'none';
        }
    });
    
    // Update year group visibility
    updateYearGroupVisibility();
    
    // Show search results count
    showSearchResults(query, countVisiblePublications());
}

/**
 * Highlight search terms in publication items
 * @param {Element} publication - Publication element
 * @param {string} searchTerm - Term to highlight
 */
function highlightSearchTerms(publication, searchTerm) {
    const textElements = publication.querySelectorAll('.publication-item-title, .publication-item-authors, .publication-item-journal');
    
    textElements.forEach(element => {
        const originalText = element.textContent;
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark>$1</mark>');
        
        if (highlightedText !== originalText) {
            element.innerHTML = highlightedText;
        }
    });
}

/**
 * Remove highlights from publication items
 * @param {Element} publication - Publication element
 */
function removeHighlights(publication) {
    const marks = publication.querySelectorAll('mark');
    marks.forEach(mark => {
        mark.outerHTML = mark.textContent;
    });
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ===================================
   FILTER FUNCTIONALITY
   =================================== */

/**
 * Initialize filter functionality
 */
function initializePublicationsFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const yearFilter = document.getElementById('year-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
}

/**
 * Apply selected filters to publications
 */
function applyFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const yearFilter = document.getElementById('year-filter');
    
    const selectedCategory = categoryFilter?.value || '';
    const selectedYear = yearFilter?.value || '';
    
    const publications = document.querySelectorAll('.publication-item');
    
    publications.forEach(publication => {
        const category = publication.dataset.category || '';
        const year = publication.dataset.year || '';
        
        const categoryMatch = selectedCategory === '' || category === selectedCategory;
        const yearMatch = selectedYear === '' || year === selectedYear;
        
        if (categoryMatch && yearMatch) {
            publication.style.display = 'block';
        } else {
            publication.style.display = 'none';
        }
    });
    
    // Update year group visibility
    updateYearGroupVisibility();
    
    // Show filter results
    const activeFilters = [];
    if (selectedCategory) activeFilters.push(`Category: ${selectedCategory}`);
    if (selectedYear) activeFilters.push(`Year: ${selectedYear}`);
    
    showFilterResults(activeFilters, countVisiblePublications());
}

/**
 * Update visibility of year group headers
 */
function updateYearGroupVisibility() {
    const yearGroups = document.querySelectorAll('.publication-year-group');
    
    yearGroups.forEach(group => {
        const visiblePublications = group.querySelectorAll('.publication-item[style*="display: block"], .publication-item:not([style*="display: none"])');
        
        if (visiblePublications.length > 0) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}

/**
 * Count visible publications
 * @returns {number} Number of visible publications
 */
function countVisiblePublications() {
    const visiblePublications = document.querySelectorAll('.publication-item[style*="display: block"], .publication-item:not([style*="display: none"])');
    return visiblePublications.length;
}

/* ===================================
   RESULTS DISPLAY
   =================================== */

/**
 * Show search results information
 * @param {string} query - Search query
 * @param {number} count - Number of results
 */
function showSearchResults(query, count) {
    removeResultsMessage();
    
    if (query.trim() !== '') {
        const message = createResultsMessage(`Found ${count} publication${count !== 1 ? 's' : ''} matching "${query}"`);
        insertResultsMessage(message);
    }
}

/**
 * Show filter results information
 * @param {Array} filters - Active filters
 * @param {number} count - Number of results
 */
function showFilterResults(filters, count) {
    removeResultsMessage();
    
    if (filters.length > 0) {
        const filterText = filters.join(', ');
        const message = createResultsMessage(`Showing ${count} publication${count !== 1 ? 's' : ''} filtered by: ${filterText}`);
        insertResultsMessage(message);
    }
}

/**
 * Create results message element
 * @param {string} text - Message text
 * @returns {Element} Message element
 */
function createResultsMessage(text) {
    const message = document.createElement('div');
    message.className = 'results-message';
    message.style.cssText = `
        background: var(--bg-white);
        border: 1px solid var(--border-gray);
        border-radius: 4px;
        padding: 12px 16px;
        margin: 20px 0;
        font-size: 14px;
        color: var(--text-primary);
        text-align: center;
    `;
    message.textContent = text;
    return message;
}

/**
 * Insert results message into the page
 * @param {Element} message - Message element
 */
function insertResultsMessage(message) {
    const publicationsList = document.getElementById('publications-list');
    if (publicationsList) {
        publicationsList.insertBefore(message, publicationsList.firstChild);
    }
}

/**
 * Remove existing results message
 */
function removeResultsMessage() {
    const existingMessage = document.querySelector('.results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

/* ===================================
   LOAD MORE FUNCTIONALITY
   =================================== */

/**
 * Initialize load more functionality
 */
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePublications);
    }
}

/**
 * Load more publications (simulated)
 */
function loadMorePublications() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const publicationsList = document.getElementById('publications-list');
    
    if (!publicationsList) return;
    
    // Simulate loading
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        // Add more publications (this would typically be an API call)
        const newPublications = createAdditionalPublications();
        publicationsList.appendChild(newPublications);
        
        // Reset button
        loadMoreBtn.textContent = 'Load More Publications';
        loadMoreBtn.disabled = false;
        
        // Hide button if no more publications (simulated)
        const totalLoaded = document.querySelectorAll('.publication-item').length;
        if (totalLoaded >= 20) { // Arbitrary limit for demo
            loadMoreBtn.style.display = 'none';
        }
    }, 1000);
}

/**
 * Create additional publications for load more functionality
 * @returns {Element} New publications container
 */
function createAdditionalPublications() {
    const container = document.createElement('div');
    container.className = 'publication-year-group';
    
    container.innerHTML = `
        <h3 class="year-heading">2022</h3>
        
        <article class="publication-item" data-category="journal" data-year="2022">
            <div class="publication-item-content">
                <div class="publication-item-meta">
                    <span class="publication-type">Journal Article</span>
                    <span class="publication-date">December 2022</span>
                </div>
                <h4 class="publication-item-title">Advanced Neural Networks for Protein Structure Prediction</h4>
                <p class="publication-item-authors">Dr. Rachel Green, Prof. Thomas Anderson, Dr. Kenji Nakamura</p>
                <p class="publication-item-journal">Nature Biotechnology, Vol. 40, Issue 12</p>
                <div class="publication-item-actions">
                    <a href="#" class="publication-link">Abstract</a>
                    <a href="#" class="publication-link">PDF</a>
                    <a href="#" class="publication-link">Cite</a>
                </div>
            </div>
        </article>
        
        <article class="publication-item" data-category="conference" data-year="2022">
            <div class="publication-item-content">
                <div class="publication-item-meta">
                    <span class="publication-type">Conference Paper</span>
                    <span class="publication-date">October 2022</span>
                </div>
                <h4 class="publication-item-title">Blockchain Applications in Scientific Data Management</h4>
                <p class="publication-item-authors">Prof. Maria Gonzalez, Dr. Alex Chen, Dr. Sophie Laurent</p>
                <p class="publication-item-journal">International Conference on Data Science and Engineering</p>
                <div class="publication-item-actions">
                    <a href="#" class="publication-link">Abstract</a>
                    <a href="#" class="publication-link">PDF</a>
                    <a href="#" class="publication-link">Cite</a>
                </div>
            </div>
        </article>
    `;
    
    return container;
}

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

/**
 * Clear all filters and search
 */
function clearAllFilters() {
    const searchInput = document.getElementById('publication-search');
    const categoryFilter = document.getElementById('category-filter');
    const yearFilter = document.getElementById('year-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (yearFilter) yearFilter.value = '';
    
    // Show all publications
    const publications = document.querySelectorAll('.publication-item');
    publications.forEach(publication => {
        publication.style.display = 'block';
        removeHighlights(publication);
    });
    
    updateYearGroupVisibility();
    removeResultsMessage();
}

/**
 * Export search results (placeholder function)
 */
function exportSearchResults() {
    const visiblePublications = document.querySelectorAll('.publication-item[style*="display: block"], .publication-item:not([style*="display: none"])');
    
    console.log(`Exporting ${visiblePublications.length} publications...`);
    // Implementation would depend on desired export format (CSV, BibTeX, etc.)
}

/* ===================================
   ACCESSIBILITY ENHANCEMENTS
   =================================== */

/**
 * Announce search results to screen readers
 * @param {number} count - Number of results
 */
function announceSearchResults(count) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Search completed. ${count} publications found.`;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/* ===================================
   EXPORT FOR MODULE SYSTEMS
   =================================== */

// If using module system, export key functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performSearch,
        applyFilters,
        clearAllFilters,
        exportSearchResults
    };
}
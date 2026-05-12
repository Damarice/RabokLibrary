/**
 * Raboks Library Research & Development Center
 * Main JavaScript File
 * 
 * Handles interactive functionality including:
 * - Smooth scrolling navigation
 * - Card interactions and animations
 * - Header scroll effects
 * - Intersection Observer animations
 * - Mobile responsiveness enhancements
 * 
 * Author: Raboks Library R&D Team
 * Version: 1.0
 * Last Updated: 2024
 */

/* ===================================
   INITIALIZATION
   =================================== */

// Wait for DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCardInteractions();
    initializeScrollEffects();
    initializeAnimations();
});

/* ===================================
   NAVIGATION FUNCTIONALITY
   =================================== */

/**
 * Initialize smooth scrolling for navigation links
 * Provides elegant transitions between sections
 */
function initializeNavigation() {
    // Select all anchor links that start with #
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Get the target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Smooth scroll to target with offset for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
}

/* ===================================
   CARD INTERACTIONS
   =================================== */

/**
 * Initialize interactive card animations
 * Provides visual feedback on user interaction
 */
function initializeCardInteractions() {
    const interactiveCards = document.querySelectorAll('.research-card, .service-card');
    
    interactiveCards.forEach(card => {
        // Add click animation
        card.addEventListener('click', function() {
            // Prevent multiple rapid clicks
            if (this.classList.contains('animating')) return;
            
            this.classList.add('animating');
            
            // Apply click animation
            this.style.transform = 'scale(0.98) translateY(-4px)';
            
            // Reset animation after delay
            setTimeout(() => {
                this.style.transform = '';
                this.classList.remove('animating');
            }, 200);
        });
        
        // Add hover sound effect (optional - can be enabled if audio files are added)
        card.addEventListener('mouseenter', function() {
            // Placeholder for hover sound effect
            // playHoverSound();
        });
    });
}

/* ===================================
   SCROLL EFFECTS
   =================================== */

/**
 * Initialize scroll-based effects
 * Handles header transparency and other scroll-triggered animations
 */
function initializeScrollEffects() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    // Throttle scroll events for better performance
    let ticking = false;
    
    function updateHeaderOnScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header background opacity based on scroll position
        if (scrollTop > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'var(--bg-white)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = 'none';
        }
        
        // Optional: Hide header on scroll down, show on scroll up
        // Uncomment the following code to enable this feature
        /*
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        */
        
        lastScrollTop = scrollTop;
        ticking = false;
    }
    
    // Throttled scroll event listener
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeaderOnScroll);
            ticking = true;
        }
    });
}

/* ===================================
   INTERSECTION OBSERVER ANIMATIONS
   =================================== */

/**
 * Initialize Intersection Observer for scroll-triggered animations
 * Provides smooth fade-in effects as elements come into view
 */
function initializeAnimations() {
    // Configuration for intersection observer
    const observerOptions = {
        threshold: 0.1,                    // Trigger when 10% of element is visible
        rootMargin: '0px 0px -100px 0px'   // Trigger 100px before element enters viewport
    };
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is now visible, trigger animation
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Optional: Add a class for CSS-based animations
                entry.target.classList.add('visible');
                
                // Stop observing this element (one-time animation)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Animate cards with staggered timing
    animateCards(observer);
    
    // Animate section titles and subtitles
    animateSectionHeaders(observer);
    
    // Animate featured sections
    animateFeaturedSections(observer);
}

/**
 * Set up card animations with staggered delays
 * @param {IntersectionObserver} observer - The intersection observer instance
 */
function animateCards(observer) {
    const cards = document.querySelectorAll('.research-card, .service-card');
    
    cards.forEach((card, index) => {
        // Set initial state (hidden)
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        // Set staggered transition timing
        const delay = index * 0.15; // 150ms delay between each card
        card.style.transition = `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`;
        
        // Start observing this card
        observer.observe(card);
    });
}

/**
 * Set up section header animations
 * @param {IntersectionObserver} observer - The intersection observer instance
 */
function animateSectionHeaders(observer) {
    const headers = document.querySelectorAll('.section-title, .section-subtitle');
    
    headers.forEach((header, index) => {
        // Set initial state
        header.style.opacity = '0';
        header.style.transform = 'translateY(20px)';
        
        // Set transition timing
        const delay = index * 0.1; // 100ms delay between headers
        header.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`;
        
        // Start observing
        observer.observe(header);
    });
}

/**
 * Set up featured section animations
 * @param {IntersectionObserver} observer - The intersection observer instance
 */
function animateFeaturedSections(observer) {
    const featuredSections = document.querySelectorAll('.featured-section');
    
    featuredSections.forEach(section => {
        // Set initial state
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        section.style.transition = 'opacity 1s ease, transform 1s ease';
        
        // Start observing
        observer.observe(section);
    });
}

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

/**
 * Debounce function to limit the rate of function execution
 * Useful for scroll and resize events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ===================================
   ACCESSIBILITY ENHANCEMENTS
   =================================== */

/**
 * Initialize accessibility features
 * Ensures the site is usable for all users
 */
function initializeAccessibility() {
    // Add keyboard navigation support
    addKeyboardNavigation();
    
    // Add focus indicators
    addFocusIndicators();
    
    // Add screen reader support
    addScreenReaderSupport();
}

/**
 * Add keyboard navigation support
 */
function addKeyboardNavigation() {
    // Allow cards to be focused and activated with keyboard
    const interactiveCards = document.querySelectorAll('.research-card, .service-card');
    
    interactiveCards.forEach(card => {
        // Make cards focusable
        card.setAttribute('tabindex', '0');
        
        // Add keyboard event listeners
        card.addEventListener('keydown', function(e) {
            // Activate on Enter or Space
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Add visible focus indicators for keyboard navigation
 */
function addFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
        .research-card:focus,
        .service-card:focus,
        .nav-links a:focus,
        .cta-button:focus,
        .learn-more-button:focus {
            outline: 2px solid var(--text-dark);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add screen reader support
 */
function addScreenReaderSupport() {
    // Add ARIA labels to interactive elements
    const cards = document.querySelectorAll('.research-card, .service-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.research-title, .service-title');
        if (title) {
            card.setAttribute('aria-label', `Learn more about ${title.textContent}`);
        }
    });
}

/* ===================================
   PERFORMANCE MONITORING
   =================================== */

/**
 * Monitor and log performance metrics
 * Helps identify potential optimization opportunities
 */
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        // Use Performance API if available
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            
            // Log key metrics (in development mode only)
            if (window.location.hostname === 'localhost') {
                console.log('Performance Metrics:', {
                    'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
                    'Total Load Time': perfData.loadEventEnd - perfData.fetchStart
                });
            }
        }
    });
}

/* ===================================
   INITIALIZATION CALL
   =================================== */

// Initialize accessibility and performance monitoring
// These are called separately as they're optional enhancements
document.addEventListener('DOMContentLoaded', function() {
    initializeAccessibility();
    initializePerformanceMonitoring();
});

/* ===================================
   EXPORT FOR MODULE SYSTEMS
   =================================== */

// If using module system, export key functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeCardInteractions,
        initializeScrollEffects,
        initializeAnimations,
        debounce,
        throttle
    };
}
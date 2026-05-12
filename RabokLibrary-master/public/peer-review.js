/**
 * Peer Review & Research Repository JavaScript
 * 
 * Handles all functionality for the academic submission and review platform:
 * - User authentication and registration
 * - Manuscript submission workflow
 * - Dashboard management
 * - Review assignment and tracking
 * - Repository browsing and search
 * - File upload and version control
 * 
 * Author: Raboks Library R&D Team
 * Version: 1.0
 * Last Updated: 2024
 */

/* ===================================
   GLOBAL VARIABLES & STATE
   =================================== */

let currentUser = null;
let currentStep = 1;
let totalSteps = 5;
let uploadedFiles = [];
let authorCount = 1;

// API Configuration — works on localhost and in production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';
const API_ENDPOINTS = {
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        me: '/auth/me',
        logout: '/auth/logout'
    },
    manuscripts: {
        submit: '/manuscripts',
        list: '/manuscripts',
        get: '/manuscripts',
        files: '/manuscripts'
    },
    reviews: {
        list: '/reviews',
        get: '/reviews',
        accept: '/reviews',
        decline: '/reviews',
        submit: '/reviews'
    },
    publications: {
        list: '/publications',
        get: '/publications',
        stats: '/publications/stats'
    },
    uploads: {
        single: '/uploads/single',
        multiple: '/uploads/multiple'
    }
};

/* ===================================
   INITIALIZATION
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthentication();
    initializeSubmissionForm();
    initializeDashboard();
    initializeRepository();
    checkAuthenticationState();
});

/* ===================================
   AUTHENTICATION SYSTEM
   =================================== */

/**
 * Initialize authentication functionality
 */
function initializeAuthentication() {
    const loginBtn = document.getElementById('login-btn');
    const authModal = document.getElementById('auth-modal');
    const authModalClose = document.getElementById('auth-modal-close');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Show authentication modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showAuthModal();
        });
    }
    
    // Close modal
    if (authModalClose) {
        authModalClose.addEventListener('click', hideAuthModal);
    }
    
    // Close modal on overlay click
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
    
    // Switch between login and register forms
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    // Handle form submissions
    const loginFormElement = loginForm?.querySelector('form');
    const registerFormElement = registerForm?.querySelector('form');
    
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    }
    
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegistration);
    }
}

/**
 * Show authentication modal
 */
function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('hidden');
        authModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide authentication modal
 */
function hideAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('hidden');
        authModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

/**
 * Show registration form
 */
function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

/**
 * Show login form
 */
function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submission event
 */
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Perform actual authentication
    performLogin(email, password);
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submission event
 */
function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        institution: formData.get('institution'),
        department: formData.get('department'),
        position: formData.get('position'),
        orcid: formData.get('orcid'),
        password: formData.get('password')
    };
    
    // Validate password confirmation
    const confirmPassword = formData.get('confirmPassword');
    if (userData.password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Perform actual registration
    performRegistration(userData);
}

/**
 * Perform user login via API
 * @param {string} email - User email
 * @param {string} password - User password
 */
async function performLogin(email, password) {
    try {
        showNotification('Authenticating...', 'info');
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.login}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store tokens
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(data.data.user));
        
        currentUser = data.data.user;
        onAuthenticationSuccess();
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
    }
}

/**
 * Perform user registration via API
 * @param {Object} userData - User registration data
 */
async function performRegistration(userData) {
    try {
        showNotification('Creating account...', 'info');
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.register}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Store tokens
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(data.data.user));
        
        currentUser = data.data.user;
        showNotification('Registration successful! Please check your email for verification.', 'success');
        onAuthenticationSuccess();
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed', 'error');
    }
}

/**
 * Handle successful authentication
 */
function onAuthenticationSuccess() {
    hideAuthModal();
    updateAuthenticationUI();
    showDashboard();
    showNotification(`Welcome, ${currentUser.firstName} ${currentUser.lastName}!`, 'success');
}

/**
 * Update UI based on authentication state
 */
function updateAuthenticationUI() {
    const authArea = document.getElementById('auth-area');
    const loginBtn = document.getElementById('login-btn');
    
    if (currentUser && authArea) {
        // Replace login button with user menu
        authArea.innerHTML = `
            <div class="user-menu">
                <div class="user-avatar">
                    <span class="avatar-initials">${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}</span>
                </div>
                <div class="user-info">
                    <div class="user-name">${currentUser.firstName} ${currentUser.lastName}</div>
                    <div class="user-institution">${currentUser.institution}</div>
                </div>
                <div class="user-menu-dropdown">
                    <button class="dropdown-item" onclick="showDashboard()">Dashboard</button>
                    <button class="dropdown-item" onclick="showProfile()">Profile</button>
                    <button class="dropdown-item" onclick="logout()">Sign Out</button>
                </div>
            </div>
        `;
    }
}

/**
 * Check authentication state on page load
 */
async function checkAuthenticationState() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token && storedUser) {
        try {
            // Verify token is still valid
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.me}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data.data.user;
                updateAuthenticationUI();
                showDashboard();
            } else {
                // Token is invalid, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // Clear invalid tokens
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
        }
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Call logout endpoint
            await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.logout}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage
        currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        
        // Reset UI
        const authArea = document.getElementById('auth-area');
        if (authArea) {
            authArea.innerHTML = `
                <button class="auth-button" id="login-btn">
                    <span class="auth-icon">👤</span>
                    <span>Sign In</span>
                </button>
            `;
            
            // Re-initialize login button
            const newLoginBtn = document.getElementById('login-btn');
            if (newLoginBtn) {
                newLoginBtn.addEventListener('click', showAuthModal);
            }
        }
        
        // Hide authenticated sections
        hideDashboard();
        hideSubmissionForm();
        
        showNotification('Signed out successfully', 'info');
    }
}

/* ===================================
   DASHBOARD FUNCTIONALITY
   =================================== */

/**
 * Initialize dashboard functionality
 */
function initializeDashboard() {
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const newSubmissionBtn = document.getElementById('new-submission-btn');
    const uploadManuscriptBtn = document.getElementById('upload-manuscript-btn');
    const inviteCollaboratorBtn = document.getElementById('invite-collaborator-btn');
    
    // Dashboard tab switching
    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchDashboardTab(tabName);
        });
    });
    
    // New submission button
    if (newSubmissionBtn) {
        newSubmissionBtn.addEventListener('click', function() {
            showSubmissionForm();
        });
    }
    
    // Upload manuscript button
    if (uploadManuscriptBtn) {
        uploadManuscriptBtn.addEventListener('click', function() {
            showUploadDialog();
        });
    }
    
    // Invite collaborator button
    if (inviteCollaboratorBtn) {
        inviteCollaboratorBtn.addEventListener('click', function() {
            showInviteDialog();
        });
    }
}

/**
 * Show dashboard section
 */
function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    const submitSection = document.getElementById('submit');
    
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }
    
    if (submitSection) {
        submitSection.classList.add('hidden');
    }
    
    // Update dashboard data
    updateDashboardData();
}

/**
 * Hide dashboard section
 */
function hideDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.add('hidden');
    }
}

/**
 * Switch dashboard tabs
 * @param {string} tabName - Name of the tab to show
 */
function switchDashboardTab(tabName) {
    // Update tab buttons
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    dashboardTabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update panels
    const dashboardPanels = document.querySelectorAll('.dashboard-panel');
    dashboardPanels.forEach(panel => {
        if (panel.id === `${tabName}-panel`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

/**
 * Update dashboard data
 */
function updateDashboardData() {
    if (!currentUser) return;
    
    // Update user info
    const userInitials = document.getElementById('user-initials');
    const userName = document.getElementById('user-name');
    const userInstitution = document.getElementById('user-institution');
    
    if (userInitials) {
        userInitials.textContent = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`;
    }
    
    if (userName) {
        userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    if (userInstitution) {
        userInstitution.textContent = currentUser.institution;
    }
    
    // Update stats (simulated data)
    updateDashboardStats();
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    const stats = {
        submissions: Math.floor(Math.random() * 20) + 5,
        reviews: Math.floor(Math.random() * 15) + 3,
        pendingReviews: Math.floor(Math.random() * 5) + 1,
        publications: Math.floor(Math.random() * 10) + 2
    };
    
    const submissionsCount = document.getElementById('submissions-count');
    const reviewsCount = document.getElementById('reviews-count');
    const pendingReviewsCount = document.getElementById('pending-reviews-count');
    const publicationsCount = document.getElementById('publications-count');
    
    if (submissionsCount) submissionsCount.textContent = stats.submissions;
    if (reviewsCount) reviewsCount.textContent = stats.reviews;
    if (pendingReviewsCount) pendingReviewsCount.textContent = stats.pendingReviews;
    if (publicationsCount) publicationsCount.textContent = stats.publications;
}

/* ===================================
   SUBMISSION FORM FUNCTIONALITY
   =================================== */

/**
 * Initialize submission form functionality
 */
function initializeSubmissionForm() {
    const nextStepBtn = document.getElementById('next-step-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const submitBtn = document.getElementById('submit-manuscript-btn');
    const addAuthorBtn = document.getElementById('add-author-btn');
    const abstractTextarea = document.getElementById('manuscript-abstract');
    
    // Step navigation
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', nextStep);
    }
    
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', prevStep);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitManuscript);
    }
    
    // Add author functionality
    if (addAuthorBtn) {
        addAuthorBtn.addEventListener('click', addAuthor);
    }
    
    // Abstract word count
    if (abstractTextarea) {
        abstractTextarea.addEventListener('input', updateWordCount);
    }
    
    // File upload handlers
    initializeFileUploads();
    
    // Form validation
    initializeFormValidation();
}

/**
 * Show submission form
 */
function showSubmissionForm() {
    const submitSection = document.getElementById('submit');
    const dashboard = document.getElementById('dashboard');
    
    if (submitSection) {
        submitSection.classList.remove('hidden');
    }
    
    if (dashboard) {
        dashboard.classList.add('hidden');
    }
    
    // Reset form to first step
    currentStep = 1;
    updateStepDisplay();
}

/**
 * Hide submission form
 */
function hideSubmissionForm() {
    const submitSection = document.getElementById('submit');
    if (submitSection) {
        submitSection.classList.add('hidden');
    }
}

/**
 * Navigate to next step
 */
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();
            updateSubmissionSummary();
        }
    }
}

/**
 * Navigate to previous step
 */
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

/**
 * Update step display
 */
function updateStepDisplay() {
    const formSteps = document.querySelectorAll('.form-step');
    const currentStepSpan = document.querySelector('.current-step');
    const nextStepBtn = document.getElementById('next-step-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const submitBtn = document.getElementById('submit-manuscript-btn');
    
    // Update step visibility
    formSteps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update step indicator
    if (currentStepSpan) {
        currentStepSpan.textContent = currentStep;
    }
    
    // Update navigation buttons
    if (prevStepBtn) {
        prevStepBtn.disabled = currentStep === 1;
    }
    
    if (nextStepBtn && submitBtn) {
        if (currentStep === totalSteps) {
            nextStepBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextStepBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }
}

/**
 * Validate current step
 * @returns {boolean} Whether current step is valid
 */
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentStepElement) return false;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

/**
 * Add new author to the form
 */
function addAuthor() {
    authorCount++;
    const additionalAuthors = document.getElementById('additional-authors');
    
    const authorHTML = `
        <div class="author-item" data-author="${authorCount}">
            <div class="author-header">
                <h4>Co-Author ${authorCount - 1}</h4>
                <button type="button" class="remove-author-btn" onclick="removeAuthor(${authorCount})">Remove</button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label for="author${authorCount}-first">First Name *</label>
                    <input type="text" id="author${authorCount}-first" name="author${authorCount}FirstName" required>
                </div>
                <div class="form-group">
                    <label for="author${authorCount}-last">Last Name *</label>
                    <input type="text" id="author${authorCount}-last" name="author${authorCount}LastName" required>
                </div>
                <div class="form-group full-width">
                    <label for="author${authorCount}-email">Email *</label>
                    <input type="email" id="author${authorCount}-email" name="author${authorCount}Email" required>
                </div>
                <div class="form-group full-width">
                    <label for="author${authorCount}-affiliation">Affiliation *</label>
                    <input type="text" id="author${authorCount}-affiliation" name="author${authorCount}Affiliation" required>
                </div>
                <div class="form-group">
                    <label for="author${authorCount}-orcid">ORCID ID</label>
                    <input type="text" id="author${authorCount}-orcid" name="author${authorCount}Orcid" 
                           placeholder="0000-0000-0000-0000">
                </div>
            </div>
        </div>
    `;
    
    if (additionalAuthors) {
        additionalAuthors.insertAdjacentHTML('beforeend', authorHTML);
    }
}

/**
 * Remove author from the form
 * @param {number} authorId - Author ID to remove
 */
function removeAuthor(authorId) {
    const authorElement = document.querySelector(`[data-author="${authorId}"]`);
    if (authorElement) {
        authorElement.remove();
    }
}

/**
 * Update abstract word count
 */
function updateWordCount() {
    const abstractTextarea = document.getElementById('manuscript-abstract');
    const wordCountSpan = document.getElementById('abstract-word-count');
    
    if (abstractTextarea && wordCountSpan) {
        const wordCount = abstractTextarea.value.trim().split(/\s+/).length;
        wordCountSpan.textContent = abstractTextarea.value.trim() === '' ? 0 : wordCount;
        
        // Add warning if over limit
        if (wordCount > 300) {
            wordCountSpan.style.color = '#ea4335';
        } else {
            wordCountSpan.style.color = '';
        }
    }
}

/**
 * Initialize file upload functionality
 */
function initializeFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            handleFileUpload(this);
        });
    });
}

/**
 * Handle file upload
 * @param {HTMLInputElement} input - File input element
 */
function handleFileUpload(input) {
    const files = Array.from(input.files);
    const uploadedFilesList = document.getElementById('uploaded-files-list');
    
    files.forEach(file => {
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date(),
            category: input.name
        };
        
        uploadedFiles.push(fileInfo);
        
        // Add to UI
        if (uploadedFilesList) {
            const fileElement = createFileElement(fileInfo);
            uploadedFilesList.appendChild(fileElement);
        }
    });
    
    showNotification(`${files.length} file(s) uploaded successfully`, 'success');
}

/**
 * Create file element for display
 * @param {Object} fileInfo - File information
 * @returns {HTMLElement} File element
 */
function createFileElement(fileInfo) {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';
    
    const fileSize = (fileInfo.size / 1024 / 1024).toFixed(2);
    
    fileElement.innerHTML = `
        <div class="file-icon">📄</div>
        <div class="file-info">
            <div class="file-name">${fileInfo.name}</div>
            <div class="file-meta">${fileSize} MB • ${fileInfo.category}</div>
        </div>
        <div class="file-actions">
            <button class="action-button" onclick="downloadFile('${fileInfo.name}')">Download</button>
            <button class="action-button" onclick="removeFile('${fileInfo.name}')">Remove</button>
        </div>
    `;
    
    return fileElement;
}

/**
 * Update submission summary
 */
function updateSubmissionSummary() {
    if (currentStep !== totalSteps) return;
    
    const form = document.getElementById('manuscript-submission-form');
    const formData = new FormData(form);
    
    // Update summary fields
    const summaryTitle = document.getElementById('summary-title');
    const summaryType = document.getElementById('summary-type');
    const summaryField = document.getElementById('summary-field');
    const summaryAuthors = document.getElementById('summary-authors');
    const summaryFiles = document.getElementById('summary-files');
    
    if (summaryTitle) summaryTitle.textContent = formData.get('title') || '-';
    if (summaryType) summaryType.textContent = formData.get('type') || '-';
    if (summaryField) summaryField.textContent = formData.get('field') || '-';
    if (summaryFiles) summaryFiles.textContent = `${uploadedFiles.length} files`;
    
    // Build authors list
    let authorsList = '';
    for (let i = 1; i <= authorCount; i++) {
        const firstName = formData.get(`author${i}FirstName`);
        const lastName = formData.get(`author${i}LastName`);
        if (firstName && lastName) {
            if (authorsList) authorsList += ', ';
            authorsList += `${firstName} ${lastName}`;
        }
    }
    if (summaryAuthors) summaryAuthors.textContent = authorsList || '-';
}

/**
 * Submit manuscript via API
 */
async function submitManuscript() {
    try {
        const form = document.getElementById('manuscript-submission-form');
        const formData = new FormData(form);
        
        // Validate final agreements
        const agreements = ['originality-agreement', 'ethics-agreement', 'copyright-agreement'];
        const allAgreed = agreements.every(id => document.getElementById(id)?.checked);
        
        if (!allAgreed) {
            showNotification('Please agree to all terms and conditions', 'error');
            return;
        }
        
        // Build manuscript data
        const manuscriptData = {
            title: formData.get('title'),
            abstract: formData.get('abstract'),
            keywords: formData.get('keywords').split(',').map(k => k.trim()),
            type: formData.get('type'),
            field: formData.get('field'),
            subfield: formData.get('subfield'),
            authors: [],
            suggestedReviewers: formData.get('suggestedReviewers') ? 
                formData.get('suggestedReviewers').split('\n').map(r => r.trim()).filter(r => r) : [],
            excludedReviewers: formData.get('excludedReviewers') ? 
                formData.get('excludedReviewers').split('\n').map(r => r.trim()).filter(r => r) : [],
            reviewTimeline: formData.get('reviewTimeline') || 'standard',
            openReview: formData.get('openReview') === 'on',
            preprintConsent: formData.get('preprintConsent') === 'on',
            agreements: {
                originality: true,
                ethics: true,
                copyright: true
            }
        };
        
        // Build authors array
        for (let i = 1; i <= authorCount; i++) {
            const firstName = formData.get(`author${i}FirstName`);
            const lastName = formData.get(`author${i}LastName`);
            const email = formData.get(`author${i}Email`);
            const affiliation = formData.get(`author${i}Affiliation`);
            const orcidId = formData.get(`author${i}Orcid`);
            
            if (firstName && lastName && email && affiliation) {
                manuscriptData.authors.push({
                    firstName,
                    lastName,
                    email,
                    affiliation,
                    orcidId,
                    isCorresponding: i === 1
                });
            }
        }
        
        showNotification('Submitting manuscript...', 'info');
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.manuscripts.submit}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(manuscriptData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Submission failed');
        }
        
        showNotification(`Manuscript submitted successfully! Submission ID: ${data.data.manuscript.submissionId}`, 'success');
        
        // Reset form and return to dashboard
        form.reset();
        uploadedFiles = [];
        authorCount = 1;
        currentStep = 1;
        updateStepDisplay();
        
        setTimeout(() => {
            hideSubmissionForm();
            showDashboard();
        }, 2000);
        
    } catch (error) {
        console.error('Manuscript submission error:', error);
        showNotification(error.message || 'Submission failed', 'error');
    }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const form = document.getElementById('manuscript-submission-form');
    if (!form) return;
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

/**
 * Validate individual field
 * @param {HTMLElement} field - Field to validate
 */
function validateField(field) {
    const isValid = field.checkValidity();
    
    if (isValid) {
        field.classList.remove('error');
    } else {
        field.classList.add('error');
    }
    
    return isValid;
}

/* ===================================
   REPOSITORY FUNCTIONALITY
   =================================== */

/**
 * Initialize repository functionality
 */
function initializeRepository() {
    const repositorySearch = document.getElementById('repository-search');
    const fieldFilter = document.getElementById('repo-field-filter');
    const typeFilter = document.getElementById('repo-type-filter');
    const yearFilter = document.getElementById('repo-year-filter');
    const sortSelect = document.getElementById('sort-select');
    
    // Search functionality
    if (repositorySearch) {
        let searchTimeout;
        repositorySearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performRepositorySearch(this.value);
            }, 300);
        });
    }
    
    // Filter functionality
    [fieldFilter, typeFilter, yearFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyRepositoryFilters);
        }
    });
    
    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortRepositoryResults(this.value);
        });
    }
    
    // Pagination
    initializeRepositoryPagination();
}

/**
 * Perform repository search via API
 * @param {string} query - Search query
 */
async function performRepositorySearch(query) {
    try {
        const fieldFilter = document.getElementById('repo-field-filter')?.value || '';
        const typeFilter = document.getElementById('repo-type-filter')?.value || '';
        const yearFilter = document.getElementById('repo-year-filter')?.value || '';
        const sortBy = document.getElementById('sort-select')?.value || 'relevance';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        if (fieldFilter) params.append('field', fieldFilter);
        if (typeFilter) params.append('type', typeFilter);
        if (yearFilter) params.append('year', yearFilter);
        if (sortBy) params.append('sort', sortBy);
        params.append('page', '1');
        params.append('limit', '20');
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.publications.list}?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            updateRepositoryResults(data.data);
            showNotification(`Found ${data.data.pagination.total} results`, 'info');
        } else {
            throw new Error(data.message || 'Search failed');
        }
        
    } catch (error) {
        console.error('Repository search error:', error);
        showNotification('Search failed. Please try again.', 'error');
    }
}

/**
 * Apply repository filters
 */
function applyRepositoryFilters() {
    const searchQuery = document.getElementById('repository-search')?.value || '';
    performRepositorySearch(searchQuery);
}

/**
 * Update repository results display
 * @param {Object} data - API response data
 */
function updateRepositoryResults(data) {
    const resultsCount = document.querySelector('.results-count');
    const repositoryGrid = document.querySelector('.repository-grid');
    
    if (resultsCount) {
        resultsCount.textContent = `Showing ${data.publications.length} of ${data.pagination.total} results`;
    }
    
    if (repositoryGrid && data.publications) {
        repositoryGrid.innerHTML = data.publications.map(pub => `
            <article class="repository-item">
                <div class="item-header">
                    <h3 class="item-title">${pub.title}</h3>
                    <div class="item-type">${formatPublicationType(pub.type)}</div>
                </div>
                <div class="item-authors">
                    ${pub.authors.map(author => `${author.firstName} ${author.lastName}`).join(', ')}
                </div>
                <div class="item-meta">
                    <span class="item-journal">${pub.journal || 'Raboks Library'}</span>
                    <span class="item-date">${formatDate(pub.publishedAt)}</span>
                    <span class="item-field">${formatField(pub.field)}</span>
                </div>
                <div class="item-abstract">
                    ${pub.abstract.substring(0, 200)}${pub.abstract.length > 200 ? '...' : ''}
                </div>
                <div class="item-metrics">
                    <span class="metric">
                        <span class="metric-icon">👁️</span>
                        <span class="metric-value">${pub.views} views</span>
                    </span>
                    <span class="metric">
                        <span class="metric-icon">📥</span>
                        <span class="metric-value">${pub.downloads} downloads</span>
                    </span>
                    <span class="metric">
                        <span class="metric-icon">📝</span>
                        <span class="metric-value">${pub.citations} citations</span>
                    </span>
                </div>
                <div class="item-actions">
                    <button class="action-button primary" onclick="viewPublication('${pub._id}')">View Full Text</button>
                    <button class="action-button" onclick="downloadPublication('${pub._id}')">Download PDF</button>
                    <button class="action-button" onclick="citePublication('${pub._id}')">Cite</button>
                    <button class="action-button" onclick="sharePublication('${pub._id}')">Share</button>
                </div>
            </article>
        `).join('');
    }
}

/**
 * Sort repository results
 * @param {string} sortBy - Sort criteria
 */
function sortRepositoryResults(sortBy) {
    console.log('Sorting by:', sortBy);
    
    // Simulate sorting (in real app, this would re-order the results)
    showNotification(`Results sorted by ${sortBy}`, 'info');
}

/**
 * Initialize repository pagination
 */
function initializeRepositoryPagination() {
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                const direction = this.textContent.includes('Previous') ? 'prev' : 'next';
                navigateRepositoryPage(direction);
            }
        });
    });
    
    paginationNumbers.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageNumber = parseInt(this.textContent);
            goToRepositoryPage(pageNumber);
        });
    });
}

/**
 * Navigate repository pages
 * @param {string} direction - Navigation direction ('prev' or 'next')
 */
function navigateRepositoryPage(direction) {
    console.log('Navigating to', direction, 'page');
    // Simulate page navigation
    showNotification(`Loading ${direction} page...`, 'info');
}

/**
 * Go to specific repository page
 * @param {number} pageNumber - Page number to navigate to
 */
function goToRepositoryPage(pageNumber) {
    console.log('Going to page', pageNumber);
    
    // Update active page indicator
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    paginationNumbers.forEach(btn => {
        if (parseInt(btn.textContent) === pageNumber) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    showNotification(`Loading page ${pageNumber}...`, 'info');
}

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'info', 'warning')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Download file (placeholder)
 * @param {string} fileName - Name of file to download
 */
function downloadFile(fileName) {
    showNotification(`Downloading ${fileName}...`, 'info');
    // In real app, this would trigger actual file download
}

/**
 * Remove file (placeholder)
 * @param {string} fileName - Name of file to remove
 */
function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    
    // Remove from UI
    const fileElements = document.querySelectorAll('.uploaded-file');
    fileElements.forEach(element => {
        const fileNameElement = element.querySelector('.file-name');
        if (fileNameElement && fileNameElement.textContent === fileName) {
            element.remove();
        }
    });
    
    showNotification(`${fileName} removed`, 'info');
}

/**
 * Show profile dialog (placeholder)
 */
function showProfile() {
    showNotification('Profile management coming soon', 'info');
}

/**
 * Show upload dialog (placeholder)
 */
function showUploadDialog() {
    showNotification('Upload dialog coming soon', 'info');
}

/**
 * Show invite dialog (placeholder)
 */
function showInviteDialog() {
    showNotification('Collaboration invite coming soon', 'info');
}

/* ===================================
   EXPORT FOR MODULE SYSTEMS
   =================================== */

// If using module system, export key functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showAuthModal,
        hideAuthModal,
        showDashboard,
        showSubmissionForm,
        performRepositorySearch,
        applyRepositoryFilters
    };
}
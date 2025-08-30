// Global variables
let currentPage = 1;
let currentFilters = {
    search: '',
    location: '',
    type: ''
};
let allJobs = [];
let locations = new Set();
let adminToken = localStorage.getItem('adminToken');
let currentAdmin = null;

// API Base URL
const API_BASE_URL = window.location.origin;

// DOM Elements
const adminToggle = document.getElementById('adminToggle');
const adminLoginSection = document.getElementById('adminLoginSection');
const adminDashboardSection = document.getElementById('adminDashboardSection');
const adminJobFormSection = document.getElementById('adminJobFormSection');
const loginForm = document.getElementById('loginForm');
const jobForm = document.getElementById('jobForm');
const cancelBtn = document.getElementById('cancelBtn');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');
const postJobBtn = document.getElementById('postJobBtn');
const exportJobsBtn = document.getElementById('exportJobsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminName = document.getElementById('adminName');
const searchInput = document.getElementById('searchInput');
const locationFilter = document.getElementById('locationFilter');
const typeFilter = document.getElementById('typeFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const jobsGrid = document.getElementById('jobsGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const pagination = document.getElementById('pagination');
const jobModal = document.getElementById('jobModal');
const notification = document.getElementById('notification');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupFormValidation();
});

// Initialize the application
async function initializeApp() {
    await loadJobs();
    populateLocationFilter();
    checkAdminAuth();
}

// Setup event listeners
function setupEventListeners() {
    // Admin toggle
    adminToggle.addEventListener('click', toggleAdminSection);
    
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    cancelLoginBtn.addEventListener('click', hideAdminSection);
    
    // Admin dashboard
    postJobBtn.addEventListener('click', showJobForm);
    exportJobsBtn.addEventListener('click', exportJobs);
    logoutBtn.addEventListener('click', logout);
    
    // Job form
    jobForm.addEventListener('submit', handleJobSubmission);
    cancelBtn.addEventListener('click', hideJobForm);
    
    // Search and filters
    searchInput.addEventListener('input', debounce(handleSearch, 500));
    locationFilter.addEventListener('change', handleFilterChange);
    typeFilter.addEventListener('change', handleFilterChange);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Modal
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target === jobModal) {
            closeModal();
        }
    });
    
    // Character count for textareas
    document.getElementById('shortDescription').addEventListener('input', updateCharCount);
    document.getElementById('fullDescription').addEventListener('input', updateCharCount);
}

// Setup form validation
function setupFormValidation() {
    const inputs = jobForm.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Check admin authentication
function checkAdminAuth() {
    if (adminToken) {
        // Verify token is still valid
        fetch(`${API_BASE_URL}/api/admin/profile`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Token invalid');
            }
        })
        .then(data => {
            currentAdmin = data.admin;
            updateAdminUI();
        })
        .catch(error => {
            console.log('Admin token invalid, logging out');
            logout();
        });
    }
}

// Update admin UI based on authentication status
function updateAdminUI() {
    if (currentAdmin) {
        adminToggle.innerHTML = '<i class="fas fa-user-shield"></i><span>Admin Dashboard</span>';
        adminToggle.setAttribute('aria-label', 'Open admin dashboard');
        adminName.textContent = currentAdmin.name;
    } else {
        adminToggle.innerHTML = '<i class="fas fa-user-shield"></i><span>Admin Login</span>';
        adminToggle.setAttribute('aria-label', 'Admin login');
    }
}

// Toggle admin section
function toggleAdminSection() {
    if (currentAdmin) {
        // Show admin dashboard
        showAdminDashboard();
    } else {
        // Show login form
        showAdminLogin();
    }
}

// Show admin login from hero button
function showAdminLoginFromHero() {
    adminLoginSection.style.display = 'block';
    adminDashboardSection.style.display = 'none';
    adminJobFormSection.style.display = 'none';
    
    // Add a small delay to ensure the element is visible before scrolling
    setTimeout(() => {
        adminLoginSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Show admin login
function showAdminLogin() {
    adminLoginSection.style.display = 'block';
    adminDashboardSection.style.display = 'none';
    adminJobFormSection.style.display = 'none';
    
    // Add a small delay to ensure the element is visible before scrolling
    setTimeout(() => {
        adminLoginSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Show admin dashboard
function showAdminDashboard() {
    adminLoginSection.style.display = 'none';
    adminDashboardSection.style.display = 'block';
    adminJobFormSection.style.display = 'none';
    
    // Add a small delay to ensure the element is visible before scrolling
    setTimeout(() => {
        adminDashboardSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Show job form
function showJobForm() {
    adminJobFormSection.style.display = 'block';
    
    // Add a small delay to ensure the element is visible before scrolling
    setTimeout(() => {
        adminJobFormSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Hide admin section
function hideAdminSection() {
    adminLoginSection.style.display = 'none';
    adminDashboardSection.style.display = 'none';
    adminJobFormSection.style.display = 'none';
    updateAdminUI();
}

// Hide job form
function hideJobForm() {
    adminJobFormSection.style.display = 'none';
    jobForm.reset();
    clearAllErrors();
    updateCharCount();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        
        const result = await response.json();
        
        // Store token and admin info
        adminToken = result.token;
        currentAdmin = result.admin;
        localStorage.setItem('adminToken', adminToken);
        
        showNotification('Login successful!', 'success');
        showAdminDashboard();
        
    } catch (error) {
        console.error('Error during login:', error);
        showNotification(error.message, 'error');
    }
}

// Handle logout
function logout() {
    adminToken = null;
    currentAdmin = null;
    localStorage.removeItem('adminToken');
    hideAdminSection();
    showNotification('Logged out successfully', 'info');
}

// Export jobs (admin only)
async function exportJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/jobs/export`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to export jobs');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cloudblitz-jobs-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Jobs exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting jobs:', error);
        showNotification('Failed to export jobs', 'error');
    }
}

// Load jobs from API
async function loadJobs(page = 1) {
    try {
        showLoading(true);
        
        const queryParams = new URLSearchParams({
            page: page,
            pageSize: 12,
            ...currentFilters
        });

        const response = await fetch(`${API_BASE_URL}/api/jobs?${queryParams}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        allJobs = data.jobs;
        
        displayJobs(allJobs);
        displayPagination(data.pagination);
        
        if (allJobs.length === 0) {
            showEmptyState();
        } else {
            hideEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        showNotification('Failed to load jobs. Please try again later.', 'error');
    } finally {
        showLoading(false);
    }
}

// Display jobs in the grid
function displayJobs(jobs) {
    jobsGrid.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsGrid.appendChild(jobCard);
        
        // Add location to set for filter
        if (job.location) {
            locations.add(job.location);
        }
    });
}

// Create a job card element
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.addEventListener('click', () => openJobModal(job._id));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    // Add keyboard support
    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openJobModal(job._id);
        }
    });
    
    const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="job-header">
            <div>
                <h3 class="job-title">${escapeHtml(job.title)}</h3>
                <p class="job-company">${escapeHtml(job.company)}</p>
            </div>
            <span class="job-type">${job.jobType}</span>
        </div>
        
        <div class="job-meta">
            <div class="job-meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${escapeHtml(job.location)}</span>
            </div>
            <div class="job-meta-item">
                <i class="fas fa-user-tie"></i>
                <span>${escapeHtml(job.experience)}</span>
            </div>
            ${job.salary ? `
            <div class="job-meta-item">
                <i class="fas fa-dollar-sign"></i>
                <span>${escapeHtml(job.salary)}</span>
            </div>
            ` : ''}
        </div>
        
        <p class="job-description">${escapeHtml(job.shortDescription)}</p>
        
        <div class="job-footer">
            <span class="job-date">Posted ${postedDate}</span>
            <a href="${job.applyLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" onclick="event.stopPropagation()">
                <i class="fas fa-external-link-alt"></i>
                Apply
            </a>
        </div>
    `;
    
    return card;
}

// Open job modal
async function openJobModal(jobId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch job details');
        }
        
        const job = await response.json();
        populateModal(job);
        jobModal.style.display = 'block';
        jobModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading job details:', error);
        showNotification('Failed to load job details.', 'error');
    }
}

// Populate modal with job data
function populateModal(job) {
    const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('modalTitle').textContent = job.title;
    document.getElementById('modalCompany').textContent = job.company;
    document.getElementById('modalLocation').textContent = job.location;
    document.getElementById('modalJobType').textContent = job.jobType;
    document.getElementById('modalExperience').textContent = job.experience;
    document.getElementById('modalFullDescription').textContent = job.fullDescription;
    
    // Handle salary display
    const salaryContainer = document.getElementById('modalSalaryContainer');
    const salaryElement = document.getElementById('modalSalary');
    
    if (job.salary) {
        salaryElement.textContent = job.salary;
        salaryContainer.style.display = 'flex';
    } else {
        salaryContainer.style.display = 'none';
    }
    
    // Apply button
    const applyBtn = document.getElementById('modalApplyBtn');
    applyBtn.href = job.applyLink;
}

// Close modal
function closeModal() {
    jobModal.style.display = 'none';
    jobModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

// Handle job submission
async function handleJobSubmission(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(jobForm);
    const jobData = {
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        jobType: formData.get('jobType'),
        experience: formData.get('experience'),
        salary: formData.get('salary') || '',
        shortDescription: formData.get('shortDescription'),
        fullDescription: formData.get('fullDescription'),
        applyLink: formData.get('applyLink')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(jobData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create job');
        }
        
        const result = await response.json();
        
        showNotification('Job posted successfully!', 'success');
        hideJobForm();
        loadJobs(1); // Reload first page to show new job
        
    } catch (error) {
        console.error('Error creating job:', error);
        showNotification(error.message, 'error');
    }
}

// Handle search
function handleSearch() {
    currentFilters.search = searchInput.value.trim();
    currentPage = 1;
    loadJobs(currentPage);
}

// Handle filter changes
function handleFilterChange() {
    currentFilters.location = locationFilter.value;
    currentFilters.type = typeFilter.value;
    currentPage = 1;
    loadJobs(currentPage);
}

// Clear all filters
function clearFilters() {
    currentFilters = {
        search: '',
        location: '',
        type: ''
    };
    
    searchInput.value = '';
    locationFilter.value = '';
    typeFilter.value = '';
    
    currentPage = 1;
    loadJobs(currentPage);
}

// Populate location filter
function populateLocationFilter() {
    const locationsArray = Array.from(locations).sort();
    
    locationsArray.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

// Display pagination
function displayPagination(paginationData) {
    if (paginationData.totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (paginationData.hasPrev) {
        paginationHTML += `<button onclick="changePage(${paginationData.currentPage - 1})" aria-label="Previous page">Previous</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, paginationData.currentPage - 2);
    const endPage = Math.min(paginationData.totalPages, paginationData.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="${i === paginationData.currentPage ? 'active' : ''}" onclick="changePage(${i})" aria-label="Page ${i}">${i}</button>`;
    }
    
    // Next button
    if (paginationData.hasNext) {
        paginationHTML += `<button onclick="changePage(${paginationData.currentPage + 1})" aria-label="Next page">Next</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show loading state
function showLoading(show) {
    if (show) {
        loadingState.style.display = 'block';
        jobsGrid.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        jobsGrid.style.display = 'grid';
    }
}

// Show empty state
function showEmptyState() {
    emptyState.style.display = 'block';
    jobsGrid.style.display = 'none';
}

// Hide empty state
function hideEmptyState() {
    emptyState.style.display = 'none';
    jobsGrid.style.display = 'grid';
}

// Form validation
function validateForm() {
    let isValid = true;
    const inputs = jobForm.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    const errorElement = document.getElementById(`${fieldName}Error`);
    
    // Clear previous error
    clearFieldError(input);
    
    // Required field validation
    if (input.hasAttribute('required') && !value) {
        showFieldError(input, `${getFieldLabel(input)} is required`);
        return false;
    }
    
    // URL validation for apply link
    if (fieldName === 'applyLink' && value) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(value)) {
            showFieldError(input, 'Please enter a valid URL starting with http:// or https://');
            return false;
        }
    }
    
    // Length validation
    if (input.hasAttribute('maxlength')) {
        const maxLength = parseInt(input.getAttribute('maxlength'));
        if (value.length > maxLength) {
            showFieldError(input, `${getFieldLabel(input)} cannot exceed ${maxLength} characters`);
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(input, message) {
    const errorElement = document.getElementById(`${input.name}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        input.classList.add('error');
    }
}

// Clear field error
function clearFieldError(input) {
    const errorElement = document.getElementById(`${input.name}Error`);
    if (errorElement) {
        errorElement.textContent = '';
        input.classList.remove('error');
    }
}

// Clear all errors
function clearAllErrors() {
    const errorElements = jobForm.querySelectorAll('.error-message');
    const errorInputs = jobForm.querySelectorAll('.error');
    
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Get field label
function getFieldLabel(input) {
    const label = jobForm.querySelector(`label[for="${input.id}"]`);
    return label ? label.textContent.replace(' *', '') : input.name;
}

// Update character count
function updateCharCount() {
    const shortDesc = document.getElementById('shortDescription');
    const fullDesc = document.getElementById('fullDescription');
    const shortCount = document.getElementById('shortDescCount');
    const fullCount = document.getElementById('fullDescCount');
    
    if (shortCount) {
        shortCount.textContent = shortDesc.value.length;
    }
    
    if (fullCount) {
        fullCount.textContent = fullDesc.value.length;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notificationElement = document.getElementById('notification');
    const messageElement = notificationElement.querySelector('.notification-message');
    
    // Set message and type
    messageElement.textContent = message;
    notificationElement.className = `notification ${type}`;
    
    // Show notification
    notificationElement.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global function for modal close (accessible from HTML)
window.closeModal = closeModal; 
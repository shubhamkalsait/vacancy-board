// Global variables
let currentPage = 1;
let currentFilters = {
    search: '',
    location: '',
    type: '',
    experience: ''
};
let allJobs = [];
let currentJob = null;

// API Base URL
const API_BASE_URL = window.location.origin;

// DOM Elements
const jobsList = document.getElementById('jobsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const noJobsMessage = document.getElementById('noJobsMessage');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationFilter = document.getElementById('locationFilter');
const typeFilter = document.getElementById('typeFilter');
const experienceFilter = document.getElementById('experienceFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const jobModal = document.getElementById('jobModal');
const modalClose = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
async function initializeApp() {
    await loadJobs();
    await loadStats();
    populateLocationFilter();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filter functionality
    locationFilter.addEventListener('change', handleFilterChange);
    typeFilter.addEventListener('change', handleFilterChange);
    experienceFilter.addEventListener('change', handleFilterChange);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Modal functionality
    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target === jobModal) {
            closeModal();
        }
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Load jobs from API
async function loadJobs(page = 1) {
    try {
        showLoading(true);
        
        const queryParams = new URLSearchParams({
            page: page,
            limit: 9,
            ...currentFilters
        });

        const response = await fetch(`${API_BASE_URL}/api/vacancies?${queryParams}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        allJobs = data.vacancies;
        
        displayJobs(allJobs);
        displayPagination(data.currentPage, data.totalPages, data.total);
        
        if (allJobs.length === 0) {
            showNoJobs();
        } else {
            hideNoJobs();
        }
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError('Failed to load jobs. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Display jobs in the grid
function displayJobs(jobs) {
    jobsList.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsList.appendChild(jobCard);
    });
}

// Create a job card element
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.addEventListener('click', () => openJobModal(job._id));
    
    const postedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const tags = job.tags && job.tags.length > 0 
        ? job.tags.slice(0, 3).map(tag => `<span class="job-tag">${tag}</span>`).join('')
        : '';
    
    card.innerHTML = `
        <div class="job-header">
            <div>
                <h3 class="job-title">${escapeHtml(job.title)}</h3>
                <p class="job-company">${escapeHtml(job.company)}</p>
            </div>
            <span class="job-type">${job.type}</span>
        </div>
        
        <div class="job-meta">
            <div class="job-meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${escapeHtml(job.location)}</span>
            </div>
            <div class="job-meta-item">
                <i class="fas fa-clock"></i>
                <span>${escapeHtml(job.experience)}</span>
            </div>
            <div class="job-meta-item">
                <i class="fas fa-dollar-sign"></i>
                <span>${escapeHtml(job.salary)}</span>
            </div>
        </div>
        
        <p class="job-description">${escapeHtml(job.description.substring(0, 150))}${job.description.length > 150 ? '...' : ''}</p>
        
        ${tags ? `<div class="job-tags">${tags}</div>` : ''}
        
        <div class="job-footer">
            <span class="job-date">Posted ${postedDate}</span>
            <a href="${job.applyLink}" target="_blank" class="apply-btn" onclick="event.stopPropagation()">
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
        const response = await fetch(`${API_BASE_URL}/api/vacancies/${jobId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch job details');
        }
        
        const job = await response.json();
        currentJob = job;
        
        populateModal(job);
        jobModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading job details:', error);
        showError('Failed to load job details.');
    }
}

// Populate modal with job data
function populateModal(job) {
    const postedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('modalTitle').textContent = job.title;
    document.getElementById('modalCompany').textContent = job.company;
    document.getElementById('modalLocation').textContent = job.location;
    document.getElementById('modalType').textContent = job.type;
    document.getElementById('modalSalary').textContent = job.salary;
    document.getElementById('modalDescription').textContent = job.description;
    
    // Requirements
    const requirementsList = document.getElementById('modalRequirements');
    requirementsList.innerHTML = '';
    job.requirements.forEach(req => {
        const li = document.createElement('li');
        li.textContent = req;
        requirementsList.appendChild(li);
    });
    
    // Benefits
    const benefitsSection = document.getElementById('modalBenefitsSection');
    const benefitsList = document.getElementById('modalBenefits');
    
    if (job.benefits && job.benefits.length > 0) {
        benefitsList.innerHTML = '';
        job.benefits.forEach(benefit => {
            const li = document.createElement('li');
            li.textContent = benefit;
            benefitsList.appendChild(li);
        });
        benefitsSection.style.display = 'block';
    } else {
        benefitsSection.style.display = 'none';
    }
    
    // Apply button
    const applyBtn = document.getElementById('applyBtn');
    applyBtn.href = job.applyLink;
}

// Close modal
function closeModal() {
    jobModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentJob = null;
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
    currentFilters.experience = experienceFilter.value;
    currentPage = 1;
    loadJobs(currentPage);
}

// Clear all filters
function clearFilters() {
    currentFilters = {
        search: '',
        location: '',
        type: '',
        experience: ''
    };
    
    searchInput.value = '';
    locationFilter.value = '';
    typeFilter.value = '';
    experienceFilter.value = '';
    
    currentPage = 1;
    loadJobs(currentPage);
}

// Display pagination
function displayPagination(currentPage, totalPages, total) {
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies/stats/overview`);
        
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('totalJobs').textContent = stats.activeVacancies;
            document.getElementById('totalCompanies').textContent = getUniqueCompanies();
            document.getElementById('totalViews').textContent = stats.totalViews.toLocaleString();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Get unique companies count
function getUniqueCompanies() {
    const companies = new Set(allJobs.map(job => job.company));
    return companies.size;
}

// Populate location filter
function populateLocationFilter() {
    const locations = [...new Set(allJobs.map(job => job.location))].sort();
    
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.style.display = 'block';
        jobsList.style.display = 'none';
    } else {
        loadingSpinner.style.display = 'none';
        jobsList.style.display = 'grid';
    }
}

// Show no jobs message
function showNoJobs() {
    noJobsMessage.style.display = 'block';
    jobsList.style.display = 'none';
}

// Hide no jobs message
function hideNoJobs() {
    noJobsMessage.style.display = 'none';
    jobsList.style.display = 'grid';
}

// Show error message
function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 3000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Share job function
function shareJob() {
    if (navigator.share && currentJob) {
        navigator.share({
            title: currentJob.title,
            text: `Check out this job opportunity: ${currentJob.title} at ${currentJob.company}`,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Job link copied to clipboard!');
        });
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 3000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Smooth scrolling for navigation
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.job-card, .feature, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Debounce function for search
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

// Debounced search
const debouncedSearch = debounce(handleSearch, 500);

// Add debounced search to input
searchInput.addEventListener('input', debouncedSearch); 
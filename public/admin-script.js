// Global variables
let currentAdmin = null;
let currentVacancies = [];
let currentPage = 1;
let totalPages = 1;
let vacancyToDelete = null;

// API Base URL
const API_BASE_URL = window.location.origin;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const adminName = document.getElementById('adminName');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Verify token and load dashboard
        verifyToken(token);
    } else {
        showLoginSection();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Add vacancy form
    const addVacancyForm = document.getElementById('addVacancyForm');
    if (addVacancyForm) {
        addVacancyForm.addEventListener('submit', handleAddVacancy);
    }
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleUpdateProfile);
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // Search functionality
    const vacancySearch = document.getElementById('vacancySearch');
    if (vacancySearch) {
        vacancySearch.addEventListener('input', debounce(handleVacancySearch, 500));
    }
    
    // Add vacancy button
    const addVacancyBtn = document.getElementById('addVacancyBtn');
    if (addVacancyBtn) {
        addVacancyBtn.addEventListener('click', () => navigateToSection('add-vacancy'));
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => navigateToSection('vacancies'));
    }
    
    // Requirements and benefits
    setupDynamicInputs();
    
    // Password toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const password = formData.get('password');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store token and admin info
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));
        
        currentAdmin = data.admin;
        showDashboard();
        loadDashboardData();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    currentAdmin = null;
    showLoginSection();
}

// Verify token
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const admin = await response.json();
            currentAdmin = admin;
            showDashboard();
            loadDashboardData();
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        showLoginSection();
    }
}

// Show login section
function showLoginSection() {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    if (currentAdmin) {
        adminName.textContent = currentAdmin.name;
    }
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadRecentVacancies(),
        loadAllVacancies()
    ]);
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies/stats/overview`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('totalVacancies').textContent = stats.totalVacancies;
            document.getElementById('totalViews').textContent = stats.totalViews.toLocaleString();
            document.getElementById('activeVacancies').textContent = stats.activeVacancies;
            document.getElementById('expiredVacancies').textContent = stats.expiredVacancies;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent vacancies
async function loadRecentVacancies() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies?limit=5`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRecentVacancies(data.vacancies);
        }
    } catch (error) {
        console.error('Error loading recent vacancies:', error);
    }
}

// Display recent vacancies
function displayRecentVacancies(vacancies) {
    const recentList = document.getElementById('recentVacanciesList');
    if (!recentList) return;
    
    recentList.innerHTML = '';
    
    vacancies.forEach(vacancy => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        
        const postedDate = new Date(vacancy.postedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        const isExpired = new Date(vacancy.expiryDate) < new Date();
        const statusClass = isExpired ? 'expired' : 'active';
        const statusText = isExpired ? 'Expired' : 'Active';
        
        item.innerHTML = `
            <div class="recent-item-info">
                <h4>${escapeHtml(vacancy.title)}</h4>
                <p>${escapeHtml(vacancy.company)} • ${escapeHtml(vacancy.location)}</p>
            </div>
            <div class="recent-item-meta">
                <span class="status ${statusClass}">${statusText}</span>
                <div class="date">${postedDate}</div>
            </div>
        `;
        
        recentList.appendChild(item);
    });
}

// Load all vacancies
async function loadAllVacancies(page = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies?page=${page}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentVacancies = data.vacancies;
            currentPage = data.currentPage;
            totalPages = data.totalPages;
            
            displayVacanciesTable(currentVacancies);
            displayVacanciesPagination(currentPage, totalPages);
        }
    } catch (error) {
        console.error('Error loading vacancies:', error);
        showNotification('Failed to load vacancies', 'error');
    }
}

// Display vacancies table
function displayVacanciesTable(vacancies) {
    const tbody = document.getElementById('vacanciesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    vacancies.forEach(vacancy => {
        const row = document.createElement('tr');
        
        const postedDate = new Date(vacancy.postedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const isExpired = new Date(vacancy.expiryDate) < new Date();
        const statusClass = vacancy.isActive && !isExpired ? 'active' : 'inactive';
        const statusText = vacancy.isActive && !isExpired ? 'Active' : 'Inactive';
        
        row.innerHTML = `
            <td>
                <div>
                    <strong>${escapeHtml(vacancy.title)}</strong>
                </div>
            </td>
            <td>${escapeHtml(vacancy.company)}</td>
            <td>${escapeHtml(vacancy.location)}</td>
            <td>${vacancy.type}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${vacancy.views}</td>
            <td>${postedDate}</td>
            <td class="actions">
                <button class="action-btn edit" onclick="editVacancy('${vacancy._id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteVacancy('${vacancy._id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Display vacancies pagination
function displayVacanciesPagination(currentPage, totalPages) {
    const pagination = document.getElementById('vacanciesPagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changeVacanciesPage(${currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="changeVacanciesPage(${i})">${i}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changeVacanciesPage(${currentPage + 1})">Next</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Change vacancies page
function changeVacanciesPage(page) {
    loadAllVacancies(page);
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    const section = this.getAttribute('data-section');
    navigateToSection(section);
}

// Navigate to section
function navigateToSection(section) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Show active section
    document.querySelectorAll('.content-section').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(section).classList.add('active');
    
    // Load section-specific data
    if (section === 'profile') {
        loadProfileData();
    }
}

// Handle add vacancy
async function handleAddVacancy(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const vacancyData = {
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        type: formData.get('type'),
        experience: formData.get('experience'),
        salary: formData.get('salary'),
        description: formData.get('description'),
        requirements: getRequirementsList(),
        benefits: getBenefitsList(),
        applyLink: formData.get('applyLink'),
        expiryDate: formData.get('expiryDate'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
        postedBy: currentAdmin.id
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(vacancyData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create vacancy');
        }
        
        showNotification('Vacancy created successfully!', 'success');
        e.target.reset();
        clearDynamicInputs();
        navigateToSection('vacancies');
        loadDashboardData();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Get requirements list
function getRequirementsList() {
    const requirements = [];
    document.querySelectorAll('.requirement-input').forEach(input => {
        if (input.value.trim()) {
            requirements.push(input.value.trim());
        }
    });
    return requirements;
}

// Get benefits list
function getBenefitsList() {
    const benefits = [];
    document.querySelectorAll('.benefit-input').forEach(input => {
        if (input.value.trim()) {
            benefits.push(input.value.trim());
        }
    });
    return benefits;
}

// Setup dynamic inputs
function setupDynamicInputs() {
    // Requirements
    const addRequirementBtn = document.getElementById('addRequirement');
    if (addRequirementBtn) {
        addRequirementBtn.addEventListener('click', addRequirementInput);
    }
    
    // Benefits
    const addBenefitBtn = document.getElementById('addBenefit');
    if (addBenefitBtn) {
        addBenefitBtn.addEventListener('click', addBenefitInput);
    }
    
    // Remove buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-requirement')) {
            removeRequirementInput(e.target);
        }
        if (e.target.classList.contains('remove-benefit')) {
            removeBenefitInput(e.target);
        }
    });
}

// Add requirement input
function addRequirementInput() {
    const requirementsList = document.getElementById('requirementsList');
    const newItem = document.createElement('div');
    newItem.className = 'requirement-item';
    newItem.innerHTML = `
        <input type="text" class="requirement-input" placeholder="Enter requirement">
        <button type="button" class="remove-requirement">
            <i class="fas fa-times"></i>
        </button>
    `;
    requirementsList.appendChild(newItem);
}

// Remove requirement input
function removeRequirementInput(button) {
    const item = button.closest('.requirement-item');
    if (item && document.querySelectorAll('.requirement-item').length > 1) {
        item.remove();
    }
}

// Add benefit input
function addBenefitInput() {
    const benefitsList = document.getElementById('benefitsList');
    const newItem = document.createElement('div');
    newItem.className = 'benefit-item';
    newItem.innerHTML = `
        <input type="text" class="benefit-input" placeholder="Enter benefit">
        <button type="button" class="remove-benefit">
            <i class="fas fa-times"></i>
        </button>
    `;
    benefitsList.appendChild(newItem);
}

// Remove benefit input
function removeBenefitInput(button) {
    const item = button.closest('.benefit-item');
    if (item && document.querySelectorAll('.benefit-item').length > 1) {
        item.remove();
    }
}

// Clear dynamic inputs
function clearDynamicInputs() {
    // Clear requirements
    const requirementsList = document.getElementById('requirementsList');
    if (requirementsList) {
        requirementsList.innerHTML = `
            <div class="requirement-item">
                <input type="text" class="requirement-input" placeholder="Enter requirement">
                <button type="button" class="remove-requirement">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }
    
    // Clear benefits
    const benefitsList = document.getElementById('benefitsList');
    if (benefitsList) {
        benefitsList.innerHTML = `
            <div class="benefit-item">
                <input type="text" class="benefit-input" placeholder="Enter benefit">
                <button type="button" class="remove-benefit">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }
}

// Edit vacancy
async function editVacancy(vacancyId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies/${vacancyId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const vacancy = await response.json();
            populateEditForm(vacancy);
            document.getElementById('editModal').style.display = 'block';
        }
    } catch (error) {
        showNotification('Failed to load vacancy details', 'error');
    }
}

// Populate edit form
function populateEditForm(vacancy) {
    document.getElementById('editVacancyId').value = vacancy._id;
    document.getElementById('editTitle').value = vacancy.title;
    document.getElementById('editCompany').value = vacancy.company;
    document.getElementById('editLocation').value = vacancy.location;
    document.getElementById('editType').value = vacancy.type;
    document.getElementById('editExperience').value = vacancy.experience;
    document.getElementById('editSalary').value = vacancy.salary;
    document.getElementById('editDescription').value = vacancy.description;
    document.getElementById('editApplyLink').value = vacancy.applyLink;
    document.getElementById('editExpiryDate').value = vacancy.expiryDate.split('T')[0];
    document.getElementById('editIsActive').value = vacancy.isActive.toString();
    
    // Setup edit form submission
    const editForm = document.getElementById('editVacancyForm');
    editForm.onsubmit = handleEditVacancy;
}

// Handle edit vacancy
async function handleEditVacancy(e) {
    e.preventDefault();
    
    const vacancyId = document.getElementById('editVacancyId').value;
    const formData = new FormData(e.target);
    
    const vacancyData = {
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        type: formData.get('type'),
        experience: formData.get('experience'),
        salary: formData.get('salary'),
        description: formData.get('description'),
        applyLink: formData.get('applyLink'),
        expiryDate: formData.get('expiryDate'),
        isActive: formData.get('isActive') === 'true'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies/${vacancyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(vacancyData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update vacancy');
        }
        
        showNotification('Vacancy updated successfully!', 'success');
        closeEditModal();
        loadDashboardData();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Delete vacancy
function deleteVacancy(vacancyId) {
    vacancyToDelete = vacancyId;
    document.getElementById('deleteModal').style.display = 'block';
}

// Confirm delete
async function confirmDelete() {
    if (!vacancyToDelete) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies/${vacancyToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete vacancy');
        }
        
        showNotification('Vacancy deleted successfully!', 'success');
        closeDeleteModal();
        loadDashboardData();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    vacancyToDelete = null;
}

// Handle vacancy search
function handleVacancySearch(e) {
    const searchTerm = e.target.value.trim();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
}

// Load profile data
async function loadProfileData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const admin = await response.json();
            
            document.getElementById('profileName').value = admin.name;
            document.getElementById('profileEmail').value = admin.email;
            document.getElementById('profileUsername').value = admin.username;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Handle update profile
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }
        
        showNotification('Profile updated successfully!', 'success');
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Handle change password
async function handleChangePassword(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const passwordData = {
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword')
    };
    
    const confirmPassword = formData.get('confirmPassword');
    
    if (passwordData.newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(passwordData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to change password');
        }
        
        showNotification('Password changed successfully!', 'success');
        e.target.reset();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        default:
            notification.style.background = '#667eea';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
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
// ==========================================
// UI UTILITIES MODULE
// ==========================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = localStorage.getItem(APP_CONFIG.storageKeys.theme) || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(APP_CONFIG.storageKeys.theme, newTheme);
    
    // Update theme toggle icon
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        if (newTheme === 'dark') {
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            btn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// Initialize theme on page load
window.addEventListener('load', () => {
    const theme = localStorage.getItem(APP_CONFIG.storageKeys.theme) || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        });
    }
});

function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Smooth scroll
function smoothScroll(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

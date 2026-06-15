// ==========================================
// MAIN APPLICATION MODULE
// ==========================================

// Initialize app
window.addEventListener('load', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize data
    initializeAppData();
    
    // Check if user is logged in
    const currentUser = FirebaseService.auth.getCurrentUser();
    
    if (currentUser) {
        if (currentUser.isAdmin) {
            showAdminPanel();
        } else {
            showDashboard();
        }
    } else {
        showLandingPage();
    }
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close notifications dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const notifBell = document.querySelector('.notifications-bell');
        if (notifBell && !notifBell.contains(e.target)) {
            document.getElementById('notificationsDropdown').classList.remove('active');
        }
    });
    
    // Prevent body scroll when modal is open
    document.querySelectorAll('.modal').forEach(modal => {
        const observer = new MutationObserver(() => {
            if (modal.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden
    } else {
        // Page is visible - refresh data
        const currentUser = FirebaseService.auth.getCurrentUser();
        if (currentUser && !currentUser.isAdmin) {
            updateDashboardStats();
        }
    }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth >= 1024) {
        document.querySelector('.sidebar')?.classList.remove('active');
    }
}, 250));

// Prevent accidental navigation
window.addEventListener('beforeunload', () => {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (currentUser) {
        // Could show warning here if needed
    }
});

// Service Worker registration (optional for PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker not available
    });
}

// Export functions for global access
window.APP = {
    showToast,
    toggleTheme,
    formatCurrency,
    formatDate,
    checkUserPlan,
    showDashboard,
    showAdminPanel
};

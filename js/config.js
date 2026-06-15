// ==========================================
// SMARTBUY.AI - CONFIGURATION
// ==========================================

const APP_CONFIG = {
    appName: 'Smartbuy.ai',
    version: '1.0.0',
    
    // Plan configurations
    plans: {
        free: {
            name: 'Free',
            price: 0,
            wishlistLimit: 5,
            analysesPerMonth: 5,
            comparison: false,
            priceAlerts: false,
            savingsPlanner: false,
            advancedAnalytics: false,
            badge: 'free'
        },
        pro: {
            name: 'Pro',
            price: 149,
            wishlistLimit: null,
            analysesPerMonth: 100,
            comparison: true,
            priceAlerts: true,
            savingsPlanner: true,
            advancedAnalytics: true,
            badge: 'pro'
        },
        plus: {
            name: 'Plus',
            price: 299,
            wishlistLimit: null,
            analysesPerMonth: null,
            comparison: true,
            priceAlerts: true,
            savingsPlanner: true,
            advancedAnalytics: true,
            badge: 'plus'
        }
    },
    
    // Admin credentials
    adminCredentials: {
        email: 'admin@smartbuyai.com',
        password: 'Admin123'
    },
    
    // Feature flags
    features: {
        aiAnalysis: true,
        wishlist: true,
        savingsTracker: true,
        priceComparison: true,
        notifications: true,
        gamification: true,
        darkMode: true
    },
    
    // AI Analysis verdicts
    verdicts: {
        'Worth Buying': { emoji: '🟢', color: '#4facfe' },
        'Wait For Discount': { emoji: '🟡', color: '#ffc107' },
        'Not Recommended': { emoji: '🔴', color: '#f5576c' }
    },
    
    // Local storage keys
    storageKeys: {
        currentUser: 'smartbuy_current_user',
        users: 'smartbuy_users',
        products: 'smartbuy_products',
        wishlist: 'smartbuy_wishlist',
        savings: 'smartbuy_savings',
        analyses: 'smartbuy_analyses',
        subscriptionRequests: 'smartbuy_sub_requests',
        notifications: 'smartbuy_notifications',
        notices: 'smartbuy_notices',
        theme: 'smartbuy_theme'
    }
};

// Initialize default data if not exists
function initializeAppData() {
    // Check if users exist, if not create empty array
    if (!localStorage.getItem(APP_CONFIG.storageKeys.users)) {
        localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify([]));
    }
    
    // Check if products exist
    if (!localStorage.getItem(APP_CONFIG.storageKeys.products)) {
        localStorage.setItem(APP_CONFIG.storageKeys.products, JSON.stringify([]));
    }
    
    // Set default theme
    if (!localStorage.getItem(APP_CONFIG.storageKeys.theme)) {
        localStorage.setItem(APP_CONFIG.storageKeys.theme, 'light');
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppData);
} else {
    initializeAppData();
}

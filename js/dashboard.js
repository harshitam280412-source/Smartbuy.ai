// ==========================================
// DASHBOARD MODULE
// ==========================================

let currentDashboardSection = 'overview';

function loadUserData() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Update user avatar
    const avatar = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = avatar;
    document.getElementById('userDisplayName').textContent = currentUser.name;
    document.getElementById('userPlanDisplay').textContent = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1) + ' Plan';
    
    // Update profile
    document.getElementById('profileAvatar').textContent = avatar;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    // Update welcome message
    document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];
    
    // Load statistics
    updateDashboardStats();
}

function updateDashboardStats() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Get wishlist count
    const wishlist = FirebaseService.wishlist.getUserWishlist(currentUser.id);
    document.getElementById('statsWishlist').textContent = wishlist.length;
    
    // Get analyses count
    const analyses = FirebaseService.analyses.getUserAnalyses(currentUser.id);
    const thisMonth = analyses.filter(a => {
        const analyzeDate = new Date(a.analyzedAt);
        const now = new Date();
        return analyzeDate.getMonth() === now.getMonth() && analyzeDate.getFullYear() === now.getFullYear();
    });
    document.getElementById('statsAnalyses').textContent = thisMonth.length;
    
    // Get savings goals
    const savingsGoals = FirebaseService.savings.getUserGoals(currentUser.id);
    let totalSaved = 0;
    savingsGoals.forEach(goal => {
        totalSaved += parseFloat(goal.currentSavings) || 0;
    });
    document.getElementById('statsSaved').textContent = '₹' + totalSaved.toLocaleString();
    
    // Update overview cards
    updateOverviewCards();
}

function updateOverviewCards() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const planDetails = getUserPlanDetails();
    
    // Update plan info
    document.getElementById('planBadge').textContent = planDetails.name + ' Plan';
    document.getElementById('planDescription').textContent = getPlanDescription(currentUser.plan);
    
    // Update plan limits
    const planLimits = document.getElementById('planLimits');
    planLimits.innerHTML = `
        <div class="plan-limit">
            <span class="plan-limit-value">${planDetails.wishlistLimit || '∞'}</span>
            <span class="plan-limit-label">Wishlist Items</span>
        </div>
        <div class="plan-limit">
            <span class="plan-limit-value">${planDetails.analysesPerMonth || '∞'}</span>
            <span class="plan-limit-label">Analyses/Month</span>
        </div>
    `;
}

function getPlanDescription(plan) {
    const descriptions = {
        'free': 'Basic features to get you started',
        'pro': 'Advanced features and priority support',
        'plus': 'Everything in Pro + AI Advisor & Advanced Reports'
    };
    return descriptions[plan] || descriptions.free;
}

function showDashboardSection(section) {
    currentDashboardSection = section;
    
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(el => {
        el.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show requested section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Add active class to nav item
    event.target.closest('.nav-item').classList.add('active');
    
    // Update header title
    const titles = {
        'overview': 'Dashboard Overview',
        'analyzer': 'Product Analyzer',
        'wishlist': 'My Wishlist',
        'savings': 'Savings Tracker',
        'comparison': 'Product Comparison',
        'profile': 'My Profile'
    };
    document.getElementById('sectionTitle').textContent = titles[section] || 'Dashboard';
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
}

function updateDashboardUI() {
    // Load plan info
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const planDetails = getUserPlanDetails();
    
    // Update current plan box
    document.getElementById('planTitle').textContent = planDetails.name + ' Plan';
    document.getElementById('planPrice').textContent = planDetails.price > 0 ? '₹' + planDetails.price + '/month' : '₹0/month';
    
    // Update plan limits
    const planLimitsDiv = document.getElementById('planLimits');
    planLimitsDiv.innerHTML = `
        <div class="plan-limit">
            <span class="plan-limit-value">${planDetails.wishlistLimit || '∞'}</span>
            <span class="plan-limit-label">Wishlist Items</span>
        </div>
        <div class="plan-limit">
            <span class="plan-limit-value">${planDetails.analysesPerMonth || '∞'}</span>
            <span class="plan-limit-label">Analyses/Month</span>
        </div>
        <div class="plan-limit">
            <span class="plan-limit-value">${planDetails.comparison ? '✓' : '✗'}</span>
            <span class="plan-limit-label">Product Comparison</span>
        </div>
    `;
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('active');
    loadNotifications();
}

function loadNotifications() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const notifications = FirebaseService.notifications.getUserNotifications(currentUser.id);
    const notificationsList = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p class="empty-state">No notifications</p>';
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}">
            <div>
                <strong>${notif.title}</strong>
                <p>${notif.message}</p>
                <small>${new Date(notif.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
    
    // Update badge
    const unreadCount = notifications.filter(n => !n.read).length;
    document.getElementById('notificationBadge').textContent = unreadCount;
}

function clearNotifications() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    let notifications = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.notifications) || '[]');
    notifications = notifications.filter(n => n.userId !== currentUser.id);
    localStorage.setItem(APP_CONFIG.storageKeys.notifications, JSON.stringify(notifications));
    
    loadNotifications();
    showToast('Notifications cleared', 'success');
}

function switchProfileTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.profile-tab').forEach(el => {
        el.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tab + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    // Load tab data
    if (tab === 'plan') loadPlanTab();
    if (tab === 'stats') loadStatsTab();
    if (tab === 'achievements') loadAchievementsTab();
}

function loadPlanTab() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const planDetails = getUserPlanDetails();
    
    // Update info section
    document.getElementById('infoPlan').textContent = planDetails.name + ' Plan';
    document.getElementById('infoName').textContent = currentUser.name;
    document.getElementById('infoEmail').textContent = currentUser.email;
    document.getElementById('infoJoinDate').textContent = new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function loadStatsTab() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const wishlist = FirebaseService.wishlist.getUserWishlist(currentUser.id);
    const analyses = FirebaseService.analyses.getUserAnalyses(currentUser.id);
    const savingsGoals = FirebaseService.savings.getUserGoals(currentUser.id);
    
    let totalSaved = 0;
    savingsGoals.forEach(goal => {
        totalSaved += parseFloat(goal.currentSavings) || 0;
    });
    
    document.getElementById('statWishlistCount').textContent = wishlist.length;
    document.getElementById('statAnalysesCount').textContent = analyses.length;
    document.getElementById('statTotalSaved').textContent = '₹' + totalSaved.toLocaleString();
    document.getElementById('statSavingsStreak').textContent = Math.floor(Math.random() * 30) + ' days'; // Demo
}

function loadAchievementsTab() {
    // Demo achievements
    const achievements = [
        { icon: 'fa-star', label: 'First Analysis', unlocked: true },
        { icon: 'fa-heart', label: '5 Wishlist Items', unlocked: false },
        { icon: 'fa-piggy-bank', label: 'Save ₹1000', unlocked: false },
        { icon: 'fa-fire', label: '7-Day Streak', unlocked: false },
        { icon: 'fa-trophy', label: 'Goal Complete', unlocked: false },
        { icon: 'fa-gem', label: 'Pro Member', unlocked: checkUserPlan('pro') }
    ];
    
    const achievementsGrid = document.getElementById('achievementsGrid');
    achievementsGrid.innerHTML = achievements.map(ach => `
        <div class="achievement-item ${ach.unlocked ? '' : 'locked'}">
            <i class="fas ${ach.icon}"></i>
            <p>${ach.label}</p>
            <span class="locked-text">${ach.unlocked ? 'Unlocked' : 'Locked'}</span>
        </div>
    `).join('');
}

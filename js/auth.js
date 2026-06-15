// ==========================================
// AUTHENTICATION MODULE
// ==========================================

function showAuthPage(mode = 'signup') {
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('authPage').classList.add('active');
    toggleAuthForm(mode);
}

function showLandingPage() {
    document.getElementById('authPage').classList.remove('active');
    document.getElementById('landingPage').classList.add('active');
}

function toggleAuthForm(form = null) {
    const signupForm = document.getElementById('signupForm');
    const signinForm = document.getElementById('signinForm');
    const forgotForm = document.getElementById('forgotPasswordForm');
    const authTitle = document.getElementById('authTitle');
    
    if (form === 'signin') {
        signupForm.classList.remove('active');
        signinForm.classList.add('active');
        forgotForm.classList.remove('active');
        authTitle.textContent = 'Sign In';
    } else if (form === 'forgot') {
        signupForm.classList.remove('active');
        signinForm.classList.remove('active');
        forgotForm.classList.add('active');
        authTitle.textContent = 'Forgot Password';
    } else {
        // Toggle between signup and signin
        if (signupForm.classList.contains('active')) {
            signupForm.classList.remove('active');
            signinForm.classList.add('active');
            authTitle.textContent = 'Sign In';
        } else {
            signupForm.classList.add('active');
            signinForm.classList.remove('active');
            authTitle.textContent = 'Sign Up';
        }
    }
}

function showForgotPassword() {
    toggleAuthForm('forgot');
}

// Handle Sign Up
function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const user = FirebaseService.auth.createUser(email, password, name);
        FirebaseService.auth.loginUser(email, password);
        showToast('Account created successfully!', 'success');
        setTimeout(() => {
            showDashboard();
        }, 1500);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Handle Sign In
function handleSignin(event) {
    event.preventDefault();
    
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    
    // Validation
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    try {
        // Check for admin login
        if (email === APP_CONFIG.adminCredentials.email && password === APP_CONFIG.adminCredentials.password) {
            const adminUser = {
                id: 'admin_' + Date.now(),
                email: email,
                name: 'Administrator',
                plan: 'admin',
                isAdmin: true
            };
            localStorage.setItem(APP_CONFIG.storageKeys.currentUser, JSON.stringify(adminUser));
            showToast('Admin logged in successfully!', 'success');
            setTimeout(() => {
                showAdminPanel();
            }, 1500);
        } else {
            const user = FirebaseService.auth.loginUser(email, password);
            showToast('Logged in successfully!', 'success');
            setTimeout(() => {
                showDashboard();
            }, 1500);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Handle Forgot Password
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        showToast('Please enter your email', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    const userExists = users.find(u => u.email === email);
    
    if (!userExists) {
        showToast('Email not found', 'error');
        return;
    }
    
    // In production, send email with reset link
    showToast('Password reset link sent to your email (demo)', 'success');
    setTimeout(() => {
        toggleAuthForm('signin');
    }, 2000);
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        FirebaseService.auth.logout();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Check if user is logged in
function checkAuth() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    
    if (!currentUser) {
        showLandingPage();
        return false;
    }
    
    return currentUser;
}

// Show Dashboard
function showDashboard() {
    const currentUser = checkAuth();
    if (!currentUser) return;
    
    document.getElementById('authPage').classList.remove('active');
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    
    // Reset sidebar
    document.querySelector('.sidebar').classList.remove('active');
    
    // Load user data
    loadUserData();
    updateDashboardUI();
}

// Show Admin Panel
function showAdminPanel() {
    const currentUser = checkAuth();
    if (!currentUser || !currentUser.isAdmin) return;
    
    document.getElementById('authPage').classList.remove('active');
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.remove('active');
    document.getElementById('adminPage').classList.add('active');
    
    loadAdminData();
}

// Check if admin can access
function checkAdminAccess() {
    const currentUser = checkAuth();
    
    if (!currentUser) {
        showAuthPage('login');
        return;
    }
    
    if (!currentUser.isAdmin) {
        showToast('Admin access required', 'error');
        return;
    }
    
    showAdminPanel();
}

// Check user plan
function checkUserPlan(requiredPlan) {
    const currentUser = FirebaseService.auth.getCurrentUser();
    
    if (!currentUser) return false;
    
    const planHierarchy = { 'free': 0, 'pro': 1, 'plus': 2 };
    const userPlanLevel = planHierarchy[currentUser.plan] || 0;
    const requiredLevel = planHierarchy[requiredPlan] || 0;
    
    return userPlanLevel >= requiredLevel;
}

// Get user plan details
function getUserPlanDetails() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return null;
    
    return APP_CONFIG.plans[currentUser.plan] || APP_CONFIG.plans.free;
}

// ==========================================
// ADMIN MODULE
// ==========================================

function loadAdminData() {
    loadAdminStats();
    loadAdminUsers();
    loadAdminProducts();
    loadAdminSubscriptions();
    loadAdminNotices();
    loadAdminAnalytics();
}

function showAdminSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(el => {
        el.classList.remove('active');
    });
    
    // Remove active from nav items
    document.querySelectorAll('.admin-nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById('admin' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
    event.target.closest('.admin-nav-item').classList.add('active');
}

function loadAdminStats() {
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    const subscriptions = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.subscriptionRequests) || '[]');
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.banned).length;
    const premiumUsers = users.filter(u => u.plan !== 'free' && !u.banned).length;
    const pendingRequests = subscriptions.filter(s => s.status === 'pending').length;
    
    document.getElementById('adminTotalUsers').textContent = totalUsers;
    document.getElementById('adminActiveUsers').textContent = activeUsers;
    document.getElementById('adminPremiumUsers').textContent = premiumUsers;
    document.getElementById('adminPendingRequests').textContent = pendingRequests;
    
    // Load recent users
    const recentUsers = users.slice(-5).reverse();
    const recentUsersDiv = document.getElementById('adminRecentUsers');
    recentUsersDiv.innerHTML = recentUsers.map(user => `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border);">
            <p><strong>${user.name}</strong></p>
            <p style="font-size: 0.85rem; color: var(--text-light);">${user.email}</p>
            <p style="font-size: 0.8rem; color: var(--text-light);">${user.plan} • Joined ${new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    `).join('');
    
    // Load pending subscriptions
    const pendingSubs = subscriptions.filter(s => s.status === 'pending').slice(-3);
    const pendingSubsDiv = document.getElementById('adminPendingSubs');
    pendingSubsDiv.innerHTML = pendingSubs.map(sub => `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border);">
            <p><strong>${sub.name}</strong> - ${sub.plan} Plan</p>
            <p style="font-size: 0.85rem; color: var(--text-light);">${sub.email}</p>
            <div style="margin-top: 8px; display: flex; gap: 8px;">
                <button class="btn btn-primary" style="flex: 1; padding: 6px; font-size: 0.85rem;" onclick="approveSubscription('${sub.id}')">Approve</button>
                <button class="btn btn-secondary" style="flex: 1; padding: 6px; font-size: 0.85rem;" onclick="rejectSubscription('${sub.id}')">Reject</button>
            </div>
        </div>
    `).join('');
}

function loadAdminUsers() {
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    displayAdminUsers(users);
}

function displayAdminUsers(users) {
    const tbody = document.getElementById('adminUsersList');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${user.plan.toUpperCase()}</span></td>
            <td><span style="background: ${user.banned ? '#f5576c' : '#4facfe'}22; color: ${user.banned ? '#f5576c' : '#4facfe'}; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${user.banned ? 'Banned' : 'Active'}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="toggleBanUser('${user.id}')">${user.banned ? 'Unban' : 'Ban'}</button>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function searchAdminUsers() {
    const searchTerm = document.getElementById('adminUserSearch').value.toLowerCase();
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    
    const filtered = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm) || 
        u.email.toLowerCase().includes(searchTerm)
    );
    
    displayAdminUsers(filtered);
}

function filterAdminUsers() {
    const filter = document.getElementById('adminUserFilter').value;
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    
    let filtered = users;
    
    if (filter === 'banned') {
        filtered = users.filter(u => u.banned);
    } else if (filter) {
        filtered = users.filter(u => u.plan === filter);
    }
    
    displayAdminUsers(filtered);
}

function toggleBanUser(userId) {
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    user.banned = !user.banned;
    localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify(users));
    
    showToast(user.banned ? 'User banned' : 'User unbanned', 'success');
    loadAdminUsers();
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    let users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify(users));
    
    showToast('User deleted', 'success');
    loadAdminUsers();
}

function loadAdminProducts() {
    const analyses = FirebaseService.analyses.getAllAnalyses();
    displayAdminProducts(analyses);
}

function displayAdminProducts(products) {
    const tbody = document.getElementById('adminProductsList');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.productName}</td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>${product.rating}/5</td>
            <td>${product.score}</td>
            <td>${product.userId.substring(0, 8)}...</td>
            <td>${new Date(product.analyzedAt).toLocaleDateString()}</td>
            <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="viewProductDetails('${product.id}')">View</button></td>
        </tr>
    `).join('');
}

function searchAdminProducts() {
    const searchTerm = document.getElementById('adminProductSearch').value.toLowerCase();
    const analyses = FirebaseService.analyses.getAllAnalyses();
    
    const filtered = analyses.filter(p => 
        p.productName.toLowerCase().includes(searchTerm)
    );
    
    displayAdminProducts(filtered);
}

function loadAdminSubscriptions() {
    const subscriptions = FirebaseService.subscriptions.getAllRequests();
    displaySubscriptionRequests(subscriptions);
}

function displaySubscriptionRequests(requests) {
    const container = document.getElementById('subscriptionRequestsList');
    
    if (requests.length === 0) {
        container.innerHTML = '<p class="empty">No subscription requests</p>';
        return;
    }
    
    container.innerHTML = requests.map(req => `
        <div class="sub-request-card">
            <div class="sub-request-status ${req.status}">${req.status.toUpperCase()}</div>
            <div class="sub-request-info">
                <p><strong>${req.name}</strong></p>
                <p>${req.email}</p>
                <p><strong>Plan:</strong> ${req.plan}</p>
                <p><strong>Reason:</strong> ${req.reason}</p>
                <p><small>Requested: ${new Date(req.requestedAt).toLocaleDateString()}</small></p>
            </div>
            ${req.status === 'pending' ? `
                <div class="sub-request-actions">
                    <button onclick="approveSubscription('${req.id}')">Approve</button>
                    <button onclick="rejectSubscription('${req.id}')">Reject</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function filterAdminSubscriptions() {
    const filter = document.getElementById('adminSubFilter').value;
    const subscriptions = FirebaseService.subscriptions.getAllRequests();
    
    let filtered = subscriptions;
    
    if (filter) {
        filtered = subscriptions.filter(s => s.status === filter);
    }
    
    displaySubscriptionRequests(filtered);
}

function approveSubscription(requestId) {
    FirebaseService.subscriptions.updateRequest(requestId, 'approved');
    showToast('Subscription approved!', 'success');
    loadAdminSubscriptions();
    loadAdminStats();
}

function rejectSubscription(requestId) {
    FirebaseService.subscriptions.updateRequest(requestId, 'rejected');
    showToast('Subscription rejected', 'success');
    loadAdminSubscriptions();
}

function loadAdminNotices() {
    const notices = FirebaseService.notices.getAllNotices();
    displayNotices(notices);
}

function displayNotices(notices) {
    const container = document.getElementById('noticesList');
    
    if (notices.length === 0) {
        container.innerHTML = '<p class="empty">No notices created</p>';
        return;
    }
    
    container.innerHTML = notices.map(notice => `
        <div class="notice-card">
            <div class="notice-type ${notice.type}">${notice.type.toUpperCase()}</div>
            <h4>${notice.title}</h4>
            <p>${notice.message}</p>
            <small>${new Date(notice.createdAt).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function openCreateNoticeModal() {
    document.getElementById('noticeModal').classList.add('active');
}

function closeNoticeModal() {
    document.getElementById('noticeModal').classList.remove('active');
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeMessage').value = '';
    document.getElementById('noticeType').value = 'info';
}

function handleCreateNotice(event) {
    event.preventDefault();
    
    const notice = {
        title: document.getElementById('noticeTitle').value,
        message: document.getElementById('noticeMessage').value,
        type: document.getElementById('noticeType').value
    };
    
    if (!notice.title || !notice.message) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    FirebaseService.notices.createNotice(notice);
    showToast('Notice sent to all users!', 'success');
    
    closeNoticeModal();
    loadAdminNotices();
}

function loadAdminAnalytics() {
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    const analyses = FirebaseService.analyses.getAllAnalyses();
    const premiumUsers = users.filter(u => u.plan !== 'free');
    
    // Calculate growth
    const thisMonth = users.filter(u => {
        const joined = new Date(u.createdAt);
        const now = new Date();
        return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;
    const growth = ((thisMonth / Math.max(1, users.length - thisMonth)) * 100).toFixed(1);
    
    // Calculate conversion
    const conversion = ((premiumUsers.length / Math.max(1, users.length)) * 100).toFixed(1);
    
    // Calculate average savings
    let totalSavings = 0;
    const savingsGoals = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.savings) || '[]');
    savingsGoals.forEach(goal => {
        totalSavings += parseFloat(goal.currentSavings) || 0;
    });
    const avgSavings = Math.round(totalSavings / Math.max(1, users.length));
    
    document.getElementById('userGrowth').textContent = growth + '%';
    document.getElementById('conversionRate').textContent = conversion + '%';
    document.getElementById('totalAnalyses').textContent = analyses.length;
    document.getElementById('avgSavings').textContent = '₹' + avgSavings.toLocaleString();
}

function exportUserReport() {
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    const csv = 'Name,Email,Plan,Status,Joined\n' + users.map(u => 
        `${u.name},${u.email},${u.plan},${u.banned ? 'Banned' : 'Active'},${new Date(u.createdAt).toLocaleDateString()}`
    ).join('\n');
    
    downloadCSV(csv, 'users-report.csv');
    showToast('Report downloaded!', 'success');
}

function exportProductReport() {
    const analyses = FirebaseService.analyses.getAllAnalyses();
    const csv = 'Product,Price,Rating,Score,Date\n' + analyses.map(a => 
        `${a.productName},${a.price},${a.rating},${a.score},${new Date(a.analyzedAt).toLocaleDateString()}`
    ).join('\n');
    
    downloadCSV(csv, 'products-report.csv');
    showToast('Report downloaded!', 'success');
}

function exportAnalyticsReport() {
    const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
    const analyses = FirebaseService.analyses.getAllAnalyses();
    const savingsGoals = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.savings) || '[]');
    
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.plan !== 'free').length;
    let totalSavings = 0;
    savingsGoals.forEach(g => totalSavings += g.currentSavings);
    
    const csv = `Smartbuy.ai Analytics Report\n${new Date().toLocaleDateString()}\n\nMetrics:\nTotal Users,${totalUsers}\nPremium Users,${premiumUsers}\nTotal Analyses,${analyses.length}\nTotal Savings Tracked,₹${totalSavings}`;
    
    downloadCSV(csv, 'analytics-report.csv');
    showToast('Report downloaded!', 'success');
}

function downloadCSV(csv, filename) {
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = filename;
    link.click();
}

function exitAdmin() {
    if (confirm('Exit admin panel?')) {
        FirebaseService.auth.logout();
        location.reload();
    }
}

// ==========================================
// NOTIFICATIONS MODULE
// ==========================================

function addNotification(title, message, type = 'info', icon = 'fas fa-info-circle') {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    FirebaseService.notifications.addNotification(currentUser.id, {
        title: title,
        message: message,
        type: type,
        icon: icon
    });
    
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const notifications = FirebaseService.notifications.getUserNotifications(currentUser.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    document.getElementById('notificationBadge').textContent = unreadCount;
}

// Check for notifications on page load
window.addEventListener('load', () => {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (currentUser) {
        updateNotificationBadge();
    }
});

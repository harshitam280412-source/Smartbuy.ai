// ==========================================
// PROFILE MODULE
// ==========================================

function openEditProfileModal() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    document.getElementById('editProfileName').value = currentUser.name;
    document.getElementById('editProfileEmail').value = currentUser.email;
    document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

function handleEditProfile(event) {
    event.preventDefault();
    
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const name = document.getElementById('editProfileName').value;
    const email = document.getElementById('editProfileEmail').value;
    
    if (!name || !email) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    FirebaseService.auth.updateUser(currentUser.id, { name, email });
    showToast('Profile updated successfully!', 'success');
    
    closeEditProfileModal();
    loadUserData();
}

function openChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('active');
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
}

function handleChangePassword(event) {
    event.preventDefault();
    
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        FirebaseService.auth.changePassword(currentUser.id, currentPassword, newPassword);
        showToast('Password changed successfully!', 'success');
        closeChangePasswordModal();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function requestSubscription(plan) {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    document.getElementById('subPlan').value = plan + ' Plan';
    document.getElementById('subName').value = currentUser.name;
    document.getElementById('subEmail').value = currentUser.email;
    document.getElementById('subReason').value = '';
    document.getElementById('subscriptionModal').classList.add('active');
}

function closeSubscriptionModal() {
    document.getElementById('subscriptionModal').classList.remove('active');
}

function handleSubscriptionRequest(event) {
    event.preventDefault();
    
    const plan = document.getElementById('subPlan').value.replace(' Plan', '');
    const name = document.getElementById('subName').value;
    const email = document.getElementById('subEmail').value;
    const reason = document.getElementById('subReason').value;
    
    if (!name || !email || !reason) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const request = {
        plan: plan,
        name: name,
        email: email,
        reason: reason,
        userId: FirebaseService.auth.getCurrentUser().id
    };
    
    FirebaseService.subscriptions.createRequest(request);
    showToast('Subscription request submitted! Admin will review it soon.', 'success');
    
    // Add notification
    FirebaseService.notifications.addNotification(FirebaseService.auth.getCurrentUser().id, {
        title: 'Subscription Request Sent',
        message: `Your request for ${plan} Plan has been submitted`,
        type: 'subscription',
        icon: 'fas fa-paper-plane'
    });
    
    closeSubscriptionModal();
}

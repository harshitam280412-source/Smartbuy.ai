// ==========================================
// FIREBASE CONFIGURATION
// Note: Using Local Storage as fallback for demo
// In production, connect to real Firebase
// ==========================================

// Firebase configuration would go here
// For this demo, we're using localStorage instead

const FirebaseService = {
    // User Authentication
    auth: {
        createUser: function(email, password, name) {
            const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                throw new Error('User already exists');
            }
            
            const newUser = {
                id: 'user_' + Date.now(),
                email: email,
                password: btoa(password), // Simple encoding (not secure)
                name: name,
                plan: 'free',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                status: 'active',
                banned: false,
                analysesThisMonth: 0,
                wishlistCount: 0,
                totalSaved: 0
            };
            
            users.push(newUser);
            localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify(users));
            
            return newUser;
        },
        
        loginUser: function(email, password) {
            const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
            const user = users.find(u => u.email === email && u.password === btoa(password));
            
            if (!user) {
                throw new Error('Invalid email or password');
            }
            
            if (user.banned) {
                throw new Error('Your account has been banned');
            }
            
            user.lastLogin = new Date().toISOString();
            localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify(users));
            localStorage.setItem(APP_CONFIG.storageKeys.currentUser, JSON.stringify(user));
            
            return user;
        },
        
        getCurrentUser: function() {
            return JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.currentUser) || 'null');
        },
        
        updateUser: function(userId, updates) {
            const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) throw new Error('User not found');
            
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify(users));
            
            // Update current user if it's the logged-in user
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                localStorage.setItem(APP_CONFIG.storageKeys.currentUser, JSON.stringify(users[userIndex]));
            }
            
            return users[userIndex];
        },
        
        logout: function() {
            localStorage.removeItem(APP_CONFIG.storageKeys.currentUser);
        },
        
        changePassword: function(userId, oldPassword, newPassword) {
            const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
            const user = users.find(u => u.id === userId);
            
            if (!user || user.password !== btoa(oldPassword)) {
                throw new Error('Current password is incorrect');
            }
            
            user.password = btoa(newPassword);
            localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify(users));
            
            return true;
        }
    },
    
    // Wishlist Management
    wishlist: {
        addProduct: function(userId, product) {
            const wishlist = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.wishlist) || '[]');
            
            const newProduct = {
                id: 'product_' + Date.now(),
                userId: userId,
                ...product,
                addedAt: new Date().toISOString(),
                purchased: false
            };
            
            wishlist.push(newProduct);
            localStorage.setItem(APP_CONFIG.storageKeys.wishlist, JSON.stringify(wishlist));
            
            return newProduct;
        },
        
        getUserWishlist: function(userId) {
            const wishlist = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.wishlist) || '[]');
            return wishlist.filter(p => p.userId === userId);
        },
        
        deleteProduct: function(productId) {
            let wishlist = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.wishlist) || '[]');
            wishlist = wishlist.filter(p => p.id !== productId);
            localStorage.setItem(APP_CONFIG.storageKeys.wishlist, JSON.stringify(wishlist));
        },
        
        updateProduct: function(productId, updates) {
            const wishlist = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.wishlist) || '[]');
            const productIndex = wishlist.findIndex(p => p.id === productId);
            
            if (productIndex === -1) throw new Error('Product not found');
            
            wishlist[productIndex] = { ...wishlist[productIndex], ...updates };
            localStorage.setItem(APP_CONFIG.storageKeys.wishlist, JSON.stringify(wishlist));
            
            return wishlist[productIndex];
        }
    },
    
    // Savings Goals
    savings: {
        createGoal: function(userId, goal) {
            const savings = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.savings) || '[]');
            
            const newGoal = {
                id: 'goal_' + Date.now(),
                userId: userId,
                ...goal,
                createdAt: new Date().toISOString(),
                completed: false
            };
            
            savings.push(newGoal);
            localStorage.setItem(APP_CONFIG.storageKeys.savings, JSON.stringify(savings));
            
            return newGoal;
        },
        
        getUserGoals: function(userId) {
            const savings = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.savings) || '[]');
            return savings.filter(g => g.userId === userId);
        },
        
        updateGoal: function(goalId, updates) {
            const savings = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.savings) || '[]');
            const goalIndex = savings.findIndex(g => g.id === goalId);
            
            if (goalIndex === -1) throw new Error('Goal not found');
            
            savings[goalIndex] = { ...savings[goalIndex], ...updates };
            
            // Check if goal is completed
            if (savings[goalIndex].currentSavings >= savings[goalIndex].targetPrice) {
                savings[goalIndex].completed = true;
            }
            
            localStorage.setItem(APP_CONFIG.storageKeys.savings, JSON.stringify(savings));
            
            return savings[goalIndex];
        },
        
        deleteGoal: function(goalId) {
            let savings = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.savings) || '[]');
            savings = savings.filter(g => g.id !== goalId);
            localStorage.setItem(APP_CONFIG.storageKeys.savings, JSON.stringify(savings));
        }
    },
    
    // Product Analyses
    analyses: {
        saveAnalysis: function(userId, analysis) {
            const analyses = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.analyses) || '[]');
            
            const newAnalysis = {
                id: 'analysis_' + Date.now(),
                userId: userId,
                ...analysis,
                analyzedAt: new Date().toISOString()
            };
            
            analyses.push(newAnalysis);
            localStorage.setItem(APP_CONFIG.storageKeys.analyses, JSON.stringify(analyses));
            
            return newAnalysis;
        },
        
        getUserAnalyses: function(userId) {
            const analyses = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.analyses) || '[]');
            return analyses.filter(a => a.userId === userId);
        },
        
        getAllAnalyses: function() {
            return JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.analyses) || '[]');
        }
    },
    
    // Subscription Requests
    subscriptions: {
        createRequest: function(request) {
            const requests = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.subscriptionRequests) || '[]');
            
            const newRequest = {
                id: 'sub_' + Date.now(),
                ...request,
                status: 'pending',
                requestedAt: new Date().toISOString()
            };
            
            requests.push(newRequest);
            localStorage.setItem(APP_CONFIG.storageKeys.subscriptionRequests, JSON.stringify(requests));
            
            return newRequest;
        },
        
        getAllRequests: function() {
            return JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.subscriptionRequests) || '[]');
        },
        
        updateRequest: function(requestId, status) {
            const requests = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.subscriptionRequests) || '[]');
            const requestIndex = requests.findIndex(r => r.id === requestId);
            
            if (requestIndex === -1) throw new Error('Request not found');
            
            requests[requestIndex].status = status;
            requests[requestIndex].updatedAt = new Date().toISOString();
            
            // If approved, update user plan
            if (status === 'approved') {
                const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
                const userIndex = users.findIndex(u => u.email === requests[requestIndex].email);
                if (userIndex !== -1) {
                    users[userIndex].plan = requests[requestIndex].plan.toLowerCase();
                    localStorage.setItem(APP_CONFIG.storageKeys.users, JSON.stringify(users));
                }
            }
            
            localStorage.setItem(APP_CONFIG.storageKeys.subscriptionRequests, JSON.stringify(requests));
            
            return requests[requestIndex];
        }
    },
    
    // Notifications
    notifications: {
        addNotification: function(userId, notification) {
            const notifications = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.notifications) || '[]');
            
            const newNotification = {
                id: 'notif_' + Date.now(),
                userId: userId,
                ...notification,
                read: false,
                createdAt: new Date().toISOString()
            };
            
            notifications.push(newNotification);
            localStorage.setItem(APP_CONFIG.storageKeys.notifications, JSON.stringify(notifications));
            
            return newNotification;
        },
        
        getUserNotifications: function(userId) {
            const notifications = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.notifications) || '[]');
            return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        
        markAsRead: function(notificationId) {
            const notifications = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.notifications) || '[]');
            const notifIndex = notifications.findIndex(n => n.id === notificationId);
            
            if (notifIndex !== -1) {
                notifications[notifIndex].read = true;
                localStorage.setItem(APP_CONFIG.storageKeys.notifications, JSON.stringify(notifications));
            }
        }
    },
    
    // App Notices
    notices: {
        createNotice: function(notice) {
            const notices = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.notices) || '[]');
            
            const newNotice = {
                id: 'notice_' + Date.now(),
                ...notice,
                createdAt: new Date().toISOString()
            };
            
            notices.push(newNotice);
            localStorage.setItem(APP_CONFIG.storageKeys.notices, JSON.stringify(notices));
            
            // Add to all users' notifications
            const users = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.users) || '[]');
            users.forEach(user => {
                FirebaseService.notifications.addNotification(user.id, {
                    title: notice.title,
                    message: notice.message,
                    type: 'notice',
                    icon: 'fas fa-megaphone'
                });
            });
            
            return newNotice;
        },
        
        getAllNotices: function() {
            return JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.notices) || '[]');
        }
    }
};

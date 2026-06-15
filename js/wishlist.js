// ==========================================
// WISHLIST MODULE
// ==========================================

function openAddWishlistModal() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const planDetails = getUserPlanDetails();
    const wishlist = FirebaseService.wishlist.getUserWishlist(currentUser.id);
    
    // Check limit for free plan
    if (planDetails.wishlistLimit && wishlist.length >= planDetails.wishlistLimit) {
        showToast(`Wishlist limit reached (${planDetails.wishlistLimit} items). Upgrade your plan!`, 'error');
        return;
    }
    
    document.getElementById('wishlistModal').classList.add('active');
}

function closeWishlistModal() {
    document.getElementById('wishlistModal').classList.remove('active');
    document.getElementById('wishlistProductName').value = '';
    document.getElementById('wishlistProductPrice').value = '';
    document.getElementById('wishlistProductLink').value = '';
    document.getElementById('wishlistProductCategory').value = 'Other';
    document.getElementById('wishlistProductNotes').value = '';
}

function handleAddWishlist(event) {
    event.preventDefault();
    
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const product = {
        name: document.getElementById('wishlistProductName').value,
        price: parseFloat(document.getElementById('wishlistProductPrice').value),
        link: document.getElementById('wishlistProductLink').value,
        category: document.getElementById('wishlistProductCategory').value,
        notes: document.getElementById('wishlistProductNotes').value
    };
    
    if (!product.name || !product.price) {
        showToast('Please fill required fields', 'error');
        return;
    }
    
    FirebaseService.wishlist.addProduct(currentUser.id, product);
    showToast('Product added to wishlist!', 'success');
    
    // Add notification
    FirebaseService.notifications.addNotification(currentUser.id, {
        title: 'Added to Wishlist',
        message: `${product.name} added to your wishlist`,
        type: 'wishlist',
        icon: 'fas fa-heart'
    });
    
    closeWishlistModal();
    loadWishlist();
}

function loadWishlist() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const wishlist = FirebaseService.wishlist.getUserWishlist(currentUser.id);
    displayWishlist(wishlist);
}

function displayWishlist(items) {
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (items.length === 0) {
        wishlistItems.innerHTML = '<p class="empty-state">Your wishlist is empty. Add products to get started!</p>';
        return;
    }
    
    wishlistItems.innerHTML = items.map(item => `
        <div class="wishlist-item" data-id="${item.id}">
            <div class="wishlist-item-category">${item.category}</div>
            <h4>${item.name}</h4>
            <div class="wishlist-item-price">₹${item.price.toLocaleString()}</div>
            ${item.notes ? `<p style="color: var(--text-light); font-size: 0.9rem; margin: 10px 0;">${item.notes}</p>` : ''}
            <div class="wishlist-item-actions">
                <button onclick="editWishlistItem('${item.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteWishlistItem('${item.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                <button onclick="markAsPurchased('${item.id}')" title="Mark as Purchased"><i class="fas fa-check"></i></button>
            </div>
        </div>
    `).join('');
}

function filterWishlist() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const searchTerm = document.getElementById('wishlistSearch').value.toLowerCase();
    const category = document.getElementById('wishlistCategory').value;
    
    let wishlist = FirebaseService.wishlist.getUserWishlist(currentUser.id);
    
    wishlist = wishlist.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || item.category === category;
        return matchesSearch && matchesCategory;
    });
    
    displayWishlist(wishlist);
}

function sortWishlist() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const sortType = document.getElementById('wishlistSort').value;
    let wishlist = FirebaseService.wishlist.getUserWishlist(currentUser.id);
    
    switch(sortType) {
        case 'price-low':
            wishlist.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            wishlist.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            wishlist.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'recent':
        default:
            wishlist.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }
    
    displayWishlist(wishlist);
}

function deleteWishlistItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    FirebaseService.wishlist.deleteProduct(id);
    showToast('Item removed from wishlist', 'success');
    loadWishlist();
}

function editWishlistItem(id) {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const wishlist = FirebaseService.wishlist.getUserWishlist(currentUser.id);
    const item = wishlist.find(p => p.id === id);
    
    if (!item) return;
    
    document.getElementById('wishlistProductName').value = item.name;
    document.getElementById('wishlistProductPrice').value = item.price;
    document.getElementById('wishlistProductLink').value = item.link || '';
    document.getElementById('wishlistProductCategory').value = item.category;
    document.getElementById('wishlistProductNotes').value = item.notes || '';
    
    openAddWishlistModal();
    
    // Delete old item and create new one on submit
    const originalForm = document.getElementById('wishlistForm');
    if (originalForm) {
        originalForm.onsubmit = function(e) {
            e.preventDefault();
            FirebaseService.wishlist.deleteProduct(id);
            handleAddWishlist(e);
        };
    }
}

function markAsPurchased(id) {
    FirebaseService.wishlist.updateProduct(id, { purchased: true });
    showToast('Marked as purchased!', 'success');
    
    // Add notification
    const currentUser = FirebaseService.auth.getCurrentUser();
    FirebaseService.notifications.addNotification(currentUser.id, {
        title: 'Purchase Recorded',
        message: 'Great job! Item marked as purchased',
        type: 'purchase',
        icon: 'fas fa-shopping-bag'
    });
    
    loadWishlist();
}

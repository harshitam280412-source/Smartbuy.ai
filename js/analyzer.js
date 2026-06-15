// ==========================================
// PRODUCT ANALYZER MODULE
// ==========================================

function analyzeProduct() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const link = document.getElementById('productLink').value.trim();
    
    if (!link) {
        showToast('Please enter a product link', 'error');
        return;
    }
    
    // Check usage limit
    const planDetails = getUserPlanDetails();
    if (planDetails.analysesPerMonth) {
        const analyses = FirebaseService.analyses.getUserAnalyses(currentUser.id);
        const thisMonth = analyses.filter(a => {
            const analyzeDate = new Date(a.analyzedAt);
            const now = new Date();
            return analyzeDate.getMonth() === now.getMonth() && analyzeDate.getFullYear() === now.getFullYear();
        });
        
        if (thisMonth.length >= planDetails.analysesPerMonth) {
            showToast(`You've reached your monthly limit of ${planDetails.analysesPerMonth} analyses. Upgrade your plan!`, 'error');
            return;
        }
    }
    
    // Simulate AI analysis
    const analysis = generateMockAnalysis(link);
    
    // Save to database
    FirebaseService.analyses.saveAnalysis(currentUser.id, analysis);
    
    // Display result
    displayAnalysisResult(analysis);
    
    // Update usage info
    updateAnalysisUsage();
    
    // Add notification
    FirebaseService.notifications.addNotification(currentUser.id, {
        title: 'Product Analyzed',
        message: `${analysis.productName} has been analyzed`,
        type: 'analysis',
        icon: 'fas fa-check-circle'
    });
}

function generateMockAnalysis(link) {
    const verdicts = ['Worth Buying', 'Wait For Discount', 'Not Recommended'];
    const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5-5
    
    return {
        productName: 'Premium Wireless Headphones',
        link: link,
        price: Math.floor(Math.random() * 15000) + 3000,
        rating: rating,
        reviews: Math.floor(Math.random() * 5000) + 500,
        verdict: randomVerdict,
        score: score,
        pros: [
            'Excellent sound quality with deep bass',
            'Comfortable for long sessions',
            'Great battery life (30+ hours)',
            'Active noise cancellation'
        ],
        cons: [
            'Slightly heavy',
            'Limited color options',
            'App connectivity issues reported'
        ],
        recommendation: 'This product offers great value for the price. The sound quality is exceptional and the battery life is impressive. Recommended for daily use.',
        valueForMoney: 'Good'
    };
}

function displayAnalysisResult(analysis) {
    // Update verdict
    const verdictInfo = APP_CONFIG.verdicts[analysis.verdict];
    const verdictBadge = document.querySelector('.verdict-badge');
    verdictBadge.textContent = verdictInfo.emoji + ' ' + analysis.verdict;
    verdictBadge.style.color = verdictInfo.color;
    
    // Update product info
    document.getElementById('analysisProductName').textContent = analysis.productName;
    document.getElementById('analysisProductPrice').textContent = '₹' + analysis.price.toLocaleString();
    
    // Update score
    document.getElementById('analysisScore').textContent = analysis.score;
    document.getElementById('analysisRating').textContent = analysis.rating + '/5';
    document.getElementById('analysisReviews').textContent = analysis.reviews.toLocaleString() + '+';
    
    // Update pros and cons
    document.getElementById('analysisPros').innerHTML = analysis.pros.map(pro => `<li>${pro}</li>`).join('');
    document.getElementById('analysisCons').innerHTML = analysis.cons.map(con => `<li>${con}</li>`).join('');
    
    // Update recommendation
    document.getElementById('analysisRecommendation').textContent = analysis.recommendation;
    
    // Show result
    document.getElementById('analysisResult').style.display = 'block';
    
    // Store current analysis for adding to wishlist
    window.currentAnalysis = analysis;
}

function updateAnalysisUsage() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const planDetails = getUserPlanDetails();
    const analyses = FirebaseService.analyses.getUserAnalyses(currentUser.id);
    const thisMonth = analyses.filter(a => {
        const analyzeDate = new Date(a.analyzedAt);
        const now = new Date();
        return analyzeDate.getMonth() === now.getMonth() && analyzeDate.getFullYear() === now.getFullYear();
    });
    
    document.getElementById('analysesUsed').textContent = thisMonth.length;
    document.getElementById('analysesLimit').textContent = planDetails.analysesPerMonth || '∞';
    
    // Update usage bar
    const percentage = planDetails.analysesPerMonth ? (thisMonth.length / planDetails.analysesPerMonth) * 100 : 100;
    document.getElementById('usageFill').style.width = Math.min(percentage, 100) + '%';
}

function addAnalyzedToWishlist() {
    if (!window.currentAnalysis) return;
    
    const analysis = window.currentAnalysis;
    const wishlistItem = {
        name: analysis.productName,
        price: analysis.price,
        link: analysis.link,
        category: 'Other',
        notes: `Score: ${analysis.score}/100 - ${analysis.verdict}`
    };
    
    const currentUser = FirebaseService.auth.getCurrentUser();
    FirebaseService.wishlist.addProduct(currentUser.id, wishlistItem);
    
    showToast('Added to wishlist!', 'success');
    
    // Add notification
    FirebaseService.notifications.addNotification(currentUser.id, {
        title: 'Added to Wishlist',
        message: `${analysis.productName} added to your wishlist`,
        type: 'wishlist',
        icon: 'fas fa-heart'
    });
}

function resetAnalysis() {
    document.getElementById('productLink').value = '';
    document.getElementById('analysisResult').style.display = 'none';
    window.currentAnalysis = null;
}

function loadAnalysisHistory() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const analyses = FirebaseService.analyses.getUserAnalyses(currentUser.id);
    const analysisList = document.getElementById('analysisList');
    
    if (analyses.length === 0) {
        analysisList.innerHTML = '<p class="empty-state">No analyses yet. Start analyzing products!</p>';
        return;
    }
    
    analysisList.innerHTML = analyses.slice(-5).reverse().map(analysis => `
        <div class="analysis-item">
            <div class="analysis-item-info">
                <h4>${analysis.productName}</h4>
                <p>₹${analysis.price} • Score: ${analysis.score}/100</p>
            </div>
            <div class="analysis-item-actions">
                <span class="verdict-badge">${analysis.verdict}</span>
            </div>
        </div>
    `).join('');
}

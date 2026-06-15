// ==========================================
// PRODUCT COMPARISON MODULE
// ==========================================

function compareProducts() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Check if user has access to comparison
    if (!checkUserPlan('pro')) {
        showToast('Product comparison is available in Pro and Plus plans. Upgrade now!', 'error');
        document.getElementById('comparisonNote').style.display = 'block';
        return;
    }
    
    const link1 = document.getElementById('product1Link').value.trim();
    const link2 = document.getElementById('product2Link').value.trim();
    
    if (!link1 || !link2) {
        showToast('Please enter both product links', 'error');
        return;
    }
    
    // Generate mock comparison data
    const product1 = generateMockAnalysis(link1);
    const product2 = generateMockAnalysis(link2);
    
    displayComparison(product1, product2);
}

function displayComparison(product1, product2) {
    // Determine which is better
    const betterProduct = product1.score > product2.score ? 1 : (product2.score > product1.score ? 2 : 0);
    
    // Update product 1 info
    document.getElementById('comp1Name').textContent = product1.productName;
    document.getElementById('comp1Price').textContent = '₹' + product1.price.toLocaleString();
    document.getElementById('comp1Rating').textContent = product1.rating + '/5';
    document.getElementById('comp1Score').textContent = product1.score;
    
    // Update product 2 info
    document.getElementById('comp2Name').textContent = product2.productName;
    document.getElementById('comp2Price').textContent = '₹' + product2.price.toLocaleString();
    document.getElementById('comp2Rating').textContent = product2.rating + '/5';
    document.getElementById('comp2Score').textContent = product2.score;
    
    // Update winner badge
    const winnerBadge = document.getElementById('winnerBadge');
    if (betterProduct === 1) {
        winnerBadge.textContent = '🏆 ' + product1.productName + ' is Better';
    } else if (betterProduct === 2) {
        winnerBadge.textContent = '🏆 ' + product2.productName + ' is Better';
    } else {
        winnerBadge.textContent = '⚖️ Both are Equal';
    }
    
    // Create feature comparison table
    const features = [
        { name: 'Price', p1: '₹' + product1.price, p2: '₹' + product2.price },
        { name: 'Rating', p1: product1.rating + '/5', p2: product2.rating + '/5' },
        { name: 'Reviews', p1: product1.reviews.toLocaleString(), p2: product2.reviews.toLocaleString() },
        { name: 'Verdict', p1: product1.verdict, p2: product2.verdict },
        { name: 'Value', p1: product1.valueForMoney, p2: product2.valueForMoney }
    ];
    
    const table = document.getElementById('comparisonTable');
    table.innerHTML = features.map(feature => `
        <tr>
            <td><strong>${feature.name}</strong></td>
            <td>${feature.p1}</td>
            <td>${feature.p2}</td>
        </tr>
    `).join('');
    
    document.getElementById('comparisonResult').style.display = 'block';
    document.getElementById('comparisonNote').style.display = 'none';
    
    // Scroll to result
    setTimeout(() => {
        document.getElementById('comparisonResult').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

function resetComparison() {
    document.getElementById('product1Link').value = '';
    document.getElementById('product2Link').value = '';
    document.getElementById('comparisonResult').style.display = 'none';
}

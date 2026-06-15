// ==========================================
// SAVINGS TRACKER MODULE
// ==========================================

function openAddSavingsModal() {
    document.getElementById('savingsModal').classList.add('active');
}

function closeSavingsModal() {
    document.getElementById('savingsModal').classList.remove('active');
    document.getElementById('savingsGoalName').value = '';
    document.getElementById('savingsGoalPrice').value = '';
    document.getElementById('savingsGoalCurrent').value = '0';
    document.getElementById('savingsGoalDate').value = '';
}

function handleAddSavingsGoal(event) {
    event.preventDefault();
    
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const goal = {
        name: document.getElementById('savingsGoalName').value,
        targetPrice: parseFloat(document.getElementById('savingsGoalPrice').value),
        currentSavings: parseFloat(document.getElementById('savingsGoalCurrent').value) || 0,
        targetDate: document.getElementById('savingsGoalDate').value
    };
    
    if (!goal.name || !goal.targetPrice) {
        showToast('Please fill required fields', 'error');
        return;
    }
    
    if (goal.currentSavings > goal.targetPrice) {
        showToast('Current savings cannot exceed target price', 'error');
        return;
    }
    
    FirebaseService.savings.createGoal(currentUser.id, goal);
    showToast('Savings goal created!', 'success');
    
    // Add notification
    FirebaseService.notifications.addNotification(currentUser.id, {
        title: 'New Savings Goal',
        message: `Goal "${goal.name}" created. Start saving!`,
        type: 'savings',
        icon: 'fas fa-piggy-bank'
    });
    
    closeSavingsModal();
    loadSavingsGoals();
}

function loadSavingsGoals() {
    const currentUser = FirebaseService.auth.getCurrentUser();
    if (!currentUser) return;
    
    const goals = FirebaseService.savings.getUserGoals(currentUser.id);
    displaySavingsGoals(goals);
    updateSavingsStats(goals);
}

function displaySavingsGoals(goals) {
    const savingsGoalsDiv = document.getElementById('savingsGoals');
    
    if (goals.length === 0) {
        savingsGoalsDiv.innerHTML = '<p class="empty-state">No savings goals yet. Create one to start tracking!</p>';
        return;
    }
    
    savingsGoalsDiv.innerHTML = goals.map(goal => {
        const percentage = (goal.currentSavings / goal.targetPrice) * 100;
        const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        
        return `
            <div class="savings-goal" data-id="${goal.id}">
                <div class="savings-goal-header">
                    <h4>${goal.name}</h4>
                    ${goal.completed ? '<span style="color: #4facfe; font-weight: 600; font-size: 0.85rem;">✓ Completed</span>' : ''}
                </div>
                <div class="savings-goal-progress">
                    <span>₹${goal.currentSavings.toLocaleString()} / ₹${goal.targetPrice.toLocaleString()}</span>
                    <span>${Math.round(percentage)}%</span>
                </div>
                <div class="savings-goal-progress-bar">
                    <div class="savings-goal-progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="savings-goal-info">
                    ${daysLeft ? `<p>Target: ${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue by ' + Math.abs(daysLeft) + ' days'}</p>` : ''}
                </div>
                <div class="savings-goal-actions">
                    <button onclick="updateSavingsAmount('${goal.id}')">Add Savings</button>
                    <button onclick="deleteSavingsGoal('${goal.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateSavingsStats(goals) {
    let totalSaved = 0;
    let activeGoals = 0;
    let completedGoals = 0;
    
    goals.forEach(goal => {
        totalSaved += goal.currentSavings;
        if (goal.completed) {
            completedGoals++;
        } else {
            activeGoals++;
        }
    });
    
    document.getElementById('totalSaved').textContent = '₹' + totalSaved.toLocaleString();
    document.getElementById('activeGoals').textContent = activeGoals;
    document.getElementById('completedGoals').textContent = completedGoals;
}

function updateSavingsAmount(goalId) {
    const amount = prompt('Enter amount to add to savings:');
    
    if (amount === null) return;
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    const currentUser = FirebaseService.auth.getCurrentUser();
    const goals = FirebaseService.savings.getUserGoals(currentUser.id);
    const goal = goals.find(g => g.id === goalId);
    
    if (!goal) return;
    
    const newAmount = goal.currentSavings + amountNum;
    FirebaseService.savings.updateGoal(goalId, { currentSavings: newAmount });
    
    showToast('Savings updated!', 'success');
    
    // Add notification
    FirebaseService.notifications.addNotification(currentUser.id, {
        title: 'Savings Added',
        message: `Added ₹${amountNum} to "${goal.name}"`,
        type: 'savings',
        icon: 'fas fa-plus-circle'
    });
    
    loadSavingsGoals();
}

function deleteSavingsGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    FirebaseService.savings.deleteGoal(goalId);
    showToast('Savings goal deleted', 'success');
    loadSavingsGoals();
}

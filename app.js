// Subscription data - Edit this array to manage your subscriptions
const subscriptions = [
    // Software
    {
        name: "LLama Life",
        category: "Software",
        price: 39.00,
        frequency: "yearly",
        nextDate: "2026-05-03",
        type: "billing",
        skipDeadline: "2026-05-01"
    },
    {
        name: "Claude Code",
        category: "Software",
        price: 20.00,
        frequency: "monthly",
        nextDate: "2026-02-17",
        type: "billing",
        skipDeadline: "2026-02-15"
    },

    // Skincare
    {
        name: "Hero Cosmetics",
        category: "Skincare",
        price: 44.70,  // $42.37 + 5.5% tax
        frequency: "90days",
        nextDate: "2026-02-06",
        type: "shipping",
        skipDeadline: "2026-02-03"
    },
    {
        name: "Kiehl's",
        category: "Skincare",
        price: 32.28,  // $30.60 + 5.5% tax
        frequency: "biannually",
        nextDate: "2026-10-13",
        type: "shipping",
        skipDeadline: "2026-10-03"
    },
    {
        name: "Covergirl",
        category: "Skincare",
        price: 7.03,  // $6.66 + 5.5% tax
        frequency: "biannually",
        nextDate: "2026-07-28",
        type: "shipping",
        skipDeadline: "2026-07-21"
    },

];

// Frequency multipliers for annual cost calculation
const frequencyMultipliers = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    "90days": 4.06,  // 365/90
    quarterly: 4,
    biannually: 2,
    yearly: 1
};

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Calculate days until a date
function daysUntil(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString + 'T00:00:00');
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate annual cost for a subscription
function getAnnualCost(subscription) {
    const multiplier = frequencyMultipliers[subscription.frequency] || 12;
    return subscription.price * multiplier;
}

// Get frequency display text
function getFrequencyText(frequency) {
    const labels = {
        weekly: 'Weekly',
        biweekly: 'Every 2 weeks',
        monthly: 'Monthly',
        "90days": 'Every 90 days',
        quarterly: 'Quarterly',
        biannually: 'Every 6 months',
        yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
}

// Render upcoming deadlines and shipments
function renderUpcoming() {
    const container = document.getElementById('upcoming-list');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find subscriptions with upcoming events in next 14 days
    const upcoming = [];

    subscriptions.forEach(sub => {
        // Check skip deadline
        if (sub.skipDeadline) {
            const days = daysUntil(sub.skipDeadline);
            if (days >= 0 && days <= 14) {
                upcoming.push({
                    name: sub.name,
                    date: sub.skipDeadline,
                    days: days,
                    eventType: 'skip-deadline',
                    label: 'Skip deadline'
                });
            }
        }

        // Check shipping/billing date
        const nextDays = daysUntil(sub.nextDate);
        if (nextDays >= 0 && nextDays <= 14) {
            upcoming.push({
                name: sub.name,
                date: sub.nextDate,
                days: nextDays,
                eventType: sub.type === 'shipping' ? 'shipping' : 'billing',
                label: sub.type === 'shipping' ? 'Ships' : 'Bills'
            });
        }
    });

    // Sort by days away
    upcoming.sort((a, b) => a.days - b.days);

    if (upcoming.length === 0) {
        container.innerHTML = '<div class="no-upcoming">No upcoming deadlines or shipments in the next 14 days</div>';
        return;
    }

    container.innerHTML = upcoming.map(item => {
        const urgentClass = item.days <= 2 ? 'urgent' : '';
        const typeClass = item.eventType === 'shipping' ? 'shipping' : '';
        const daysText = item.days === 0 ? 'Today' :
                        item.days === 1 ? 'Tomorrow' :
                        `${item.days} days away`;

        return `
            <div class="upcoming-item ${typeClass} ${urgentClass}">
                <div class="upcoming-info">
                    <span class="upcoming-name">${item.name}</span>
                    <span class="upcoming-type">${item.label}</span>
                </div>
                <div class="upcoming-date">
                    <div class="date">${formatDate(item.date)}</div>
                    <div class="days-away ${urgentClass}">${daysText}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render stats
function renderStats() {
    // Calculate total annual cost
    const totalAnnual = subscriptions.reduce((sum, sub) => sum + getAnnualCost(sub), 0);
    document.getElementById('total-annual').textContent = formatCurrency(totalAnnual);
    document.getElementById('monthly-avg').textContent = formatCurrency(totalAnnual / 12);

    // Calculate cost by category
    const categoryTotals = {};
    subscriptions.forEach(sub => {
        const annual = getAnnualCost(sub);
        categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + annual;
    });

    // Sort categories by cost (highest first)
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    const categoryContainer = document.getElementById('category-stats');
    categoryContainer.innerHTML = sortedCategories.map(([category, cost]) => `
        <div class="category-item">
            <span class="category-name">${category}</span>
            <span class="category-cost">${formatCurrency(cost)}/yr</span>
        </div>
    `).join('');

    // Render individual subscription stats (sorted by annual cost)
    const sortedSubs = [...subscriptions].sort((a, b) => getAnnualCost(b) - getAnnualCost(a));
    const subStatsContainer = document.getElementById('subscription-stats');
    subStatsContainer.innerHTML = sortedSubs.map(sub => `
        <div class="subscription-stat-item">
            <span class="sub-name">${sub.name}</span>
            <div class="sub-details">
                <span class="sub-frequency">${getFrequencyText(sub.frequency)}</span>
                <span class="sub-annual">${formatCurrency(getAnnualCost(sub))}/yr</span>
            </div>
        </div>
    `).join('');
}

// Render full subscription table
function renderTable() {
    const tbody = document.getElementById('subscriptions-tbody');

    // Sort by next date
    const sorted = [...subscriptions].sort((a, b) =>
        new Date(a.nextDate) - new Date(b.nextDate)
    );

    tbody.innerHTML = sorted.map(sub => `
        <tr>
            <td>${sub.name}</td>
            <td>${sub.category}</td>
            <td>${getFrequencyText(sub.frequency)}</td>
            <td class="price">${formatCurrency(sub.price)}</td>
            <td class="annual-cost">${formatCurrency(getAnnualCost(sub))}</td>
            <td>${formatDate(sub.nextDate)}</td>
        </tr>
    `).join('');
}

// Update last updated timestamp
function updateTimestamp() {
    document.getElementById('last-updated').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize the app
function init() {
    renderUpcoming();
    renderStats();
    renderTable();
    updateTimestamp();
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);

// Subscription data - Edit this array to manage your subscriptions
const subscriptions = [
    // Streaming & Entertainment
    {
        name: "Netflix",
        category: "Streaming",
        price: 15.99,
        frequency: "monthly",
        nextDate: "2026-02-15",
        type: "billing"
    },
    {
        name: "Spotify Family",
        category: "Streaming",
        price: 16.99,
        frequency: "monthly",
        nextDate: "2026-02-08",
        type: "billing"
    },
    {
        name: "Disney+",
        category: "Streaming",
        price: 13.99,
        frequency: "monthly",
        nextDate: "2026-02-20",
        type: "billing"
    },

    // Software & Tools
    {
        name: "Adobe Creative Cloud",
        category: "Software",
        price: 54.99,
        frequency: "monthly",
        nextDate: "2026-02-05",
        type: "billing"
    },
    {
        name: "1Password",
        category: "Software",
        price: 35.88,
        frequency: "yearly",
        nextDate: "2026-03-15",
        type: "billing"
    },
    {
        name: "GitHub Pro",
        category: "Software",
        price: 4.00,
        frequency: "monthly",
        nextDate: "2026-02-12",
        type: "billing"
    },

    // Physical Subscriptions (with skip deadlines)
    {
        name: "HelloFresh",
        category: "Food & Beverage",
        price: 69.99,
        frequency: "weekly",
        nextDate: "2026-02-03",
        type: "shipping",
        skipDeadline: "2026-02-01"
    },
    {
        name: "Blue Apron",
        category: "Food & Beverage",
        price: 47.95,
        frequency: "weekly",
        nextDate: "2026-02-05",
        type: "shipping",
        skipDeadline: "2026-02-02"
    },
    {
        name: "Trade Coffee",
        category: "Food & Beverage",
        price: 24.00,
        frequency: "biweekly",
        nextDate: "2026-02-10",
        type: "shipping",
        skipDeadline: "2026-02-06"
    },
    {
        name: "Birchbox",
        category: "Personal Care",
        price: 15.00,
        frequency: "monthly",
        nextDate: "2026-02-18",
        type: "shipping",
        skipDeadline: "2026-02-10"
    },
    {
        name: "Dollar Shave Club",
        category: "Personal Care",
        price: 10.00,
        frequency: "monthly",
        nextDate: "2026-02-22",
        type: "shipping",
        skipDeadline: "2026-02-15"
    },

    // Fitness & Health
    {
        name: "Gym Membership",
        category: "Fitness",
        price: 49.99,
        frequency: "monthly",
        nextDate: "2026-02-01",
        type: "billing"
    },
    {
        name: "Peloton App",
        category: "Fitness",
        price: 12.99,
        frequency: "monthly",
        nextDate: "2026-02-14",
        type: "billing"
    },

    // News & Reading
    {
        name: "The New York Times",
        category: "News & Reading",
        price: 17.00,
        frequency: "monthly",
        nextDate: "2026-02-07",
        type: "billing"
    },
    {
        name: "The Economist",
        category: "News & Reading",
        price: 189.00,
        frequency: "yearly",
        nextDate: "2026-06-15",
        type: "billing"
    },

    // Cloud Storage
    {
        name: "iCloud+ 200GB",
        category: "Cloud Storage",
        price: 2.99,
        frequency: "monthly",
        nextDate: "2026-02-11",
        type: "billing"
    },
    {
        name: "Google One 2TB",
        category: "Cloud Storage",
        price: 99.99,
        frequency: "yearly",
        nextDate: "2026-08-20",
        type: "billing"
    }
];

// Frequency multipliers for annual cost calculation
const frequencyMultipliers = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    quarterly: 4,
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
        quarterly: 'Quarterly',
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

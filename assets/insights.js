// Backend URL config (loaded from backend-config.js or localStorage)
const BACKEND_URL = (typeof window !== 'undefined' && (window.BACKEND_URL || localStorage.getItem('backend_url') || 'http://127.0.0.1:5002'));

// --- THEME HANDLING ---
(function initTheme() {
    try {
        const stored = localStorage.getItem('theme');
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        const theme = stored || (prefersLight ? 'light' : 'dark');
        document.body.classList.toggle('theme-light', theme === 'light');
        updateThemeToggleLabel(theme);
    } catch (_) {}
})();

function updateThemeToggleLabel(theme) {
    const label = document.getElementById('theme-toggle-label');
    if (label) label.textContent = theme === 'light' ? 'Night' : 'Day';
}

const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('theme-light');
        const theme = isLight ? 'light' : 'dark';
        try { localStorage.setItem('theme', theme); } catch (_) {}
        updateThemeToggleLabel(theme);
    });
}

// --- CHART.JS LOGIC ---
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chartAnimationDuration = prefersReducedMotion ? 0 : 800;

// Chart configurations
const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
        duration: chartAnimationDuration,
        easing: 'easeOutQuart'
    },
    plugins: {
        legend: {
            labels: {
                color: '#e5e7eb'
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#9ca3af'
            },
            grid: {
                color: '#374151'
            }
        },
        x: {
            ticks: {
                color: '#9ca3af'
            },
            grid: {
                color: '#374151'
            }
        }
    }
};

// Sex Chart
new Chart(document.getElementById('sexChart'), {
    type: 'bar',
    data: {
        labels: ['Female', 'Male'],
        datasets: [{
            label: 'Survival Rate (%)',
            data: [74, 19],
            backgroundColor: ['#ec4899', '#3b82f6'],
            borderColor: ['#ec4899', '#3b82f6'],
            borderWidth: 1
        }]
    },
    options: chartOptions
});

// Class Chart
new Chart(document.getElementById('classChart'), {
    type: 'bar',
    data: {
        labels: ['1st Class', '2nd Class', '3rd Class'],
        datasets: [{
            label: 'Survival Rate (%)',
            data: [62, 43, 26],
            backgroundColor: ['#eab308', '#f59e0b', '#dc2626'],
            borderColor: ['#eab308', '#f59e0b', '#dc2626'],
            borderWidth: 1
        }]
    },
    options: chartOptions
});

// Age Chart
new Chart(document.getElementById('ageChart'), {
    type: 'line',
    data: {
        labels: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '70+'],
        datasets: [{
            label: 'Survival Rate (%)',
            data: [59, 38, 35, 39, 35, 29, 20, 12],
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            tension: 0.4,
            fill: false
        }]
    },
    options: chartOptions
});

// Fare Chart
new Chart(document.getElementById('fareChart'), {
    type: 'line',
    data: {
        labels: ['0-10', '10-50', '50-100', '100-200', '200+'],
        datasets: [{
            label: 'Survival Rate (%)',
            data: [20, 35, 55, 70, 85],
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            tension: 0.4,
            fill: false
        }]
    },
    options: chartOptions
});

// Port Chart
new Chart(document.getElementById('portChart'), {
    type: 'bar',
    data: {
        labels: ['Cherbourg', 'Queenstown', 'Southampton'],
        datasets: [{
            label: 'Survival Rate (%)',
            data: [55, 39, 34],
            backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7'],
            borderColor: ['#6366f1', '#8b5cf6', '#a855f7'],
            borderWidth: 1
        }]
    },
    options: chartOptions
});

// Family Size Chart
new Chart(document.getElementById('familyChart'), {
    type: 'bar',
    data: {
        labels: ['Alone', '1-2', '3-4', '5+'],
        datasets: [{
            label: 'Survival Rate (%)',
            data: [30, 55, 72, 20],
            backgroundColor: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
            borderColor: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
            borderWidth: 1
        }]
    },
    options: chartOptions
});

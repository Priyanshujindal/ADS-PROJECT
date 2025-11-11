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

// --- COMPARISON MODE TOGGLE ---
let isComparisonMode = false;

const modeToggle = document.getElementById('mode-toggle');
const singleMode = document.getElementById('single-mode');
const comparisonMode = document.getElementById('comparison-mode');
const singleResult = document.getElementById('single-result');
const comparisonResult = document.getElementById('comparison-result');
const predictorTitle = document.getElementById('predictor-title');
const predictorDescription = document.getElementById('predictor-description');
const modeToggleText = document.getElementById('mode-toggle-text');

if (modeToggle) {
    modeToggle.addEventListener('click', () => {
        isComparisonMode = !isComparisonMode;
        
        if (isComparisonMode) {
            singleMode.classList.add('hidden');
            comparisonMode.classList.remove('hidden');
            singleResult.classList.add('hidden');
            comparisonResult.classList.remove('hidden');
            predictorTitle.textContent = 'Compare Survival Predictions';
            predictorDescription.textContent = 'Enter details for two people to compare their predicted survival probabilities side by side.';
            modeToggleText.textContent = 'Single Mode';
        } else {
            singleMode.classList.remove('hidden');
            comparisonMode.classList.add('hidden');
            singleResult.classList.remove('hidden');
            comparisonResult.classList.add('hidden');
            predictorTitle.textContent = 'Could You Have Survived?';
            predictorDescription.textContent = 'Enter your details below to see the model\'s prediction. Watch the live estimate update as you type.';
            modeToggleText.textContent = 'Comparison Mode';
        }
    });
}

// --- PREDICTOR LOGIC (calls backend API) ---
async function predictSurvival() {
    const btn = document.getElementById('predict-btn');
    const resultContainer = document.getElementById('result-container');
    const errorText = document.getElementById('error-text');
    const spinner = document.getElementById('btn-spinner');
    const probRing = document.getElementById('prob-ring');

    errorText.classList.add('hidden');
    errorText.textContent = '';

    // 1. Get user inputs
    const pclass = parseFloat(document.getElementById('pclass').value);
    const sex = parseFloat(document.getElementById('sex').value);
    const age = parseFloat(document.getElementById('age').value);
    const sibsp = parseFloat(document.getElementById('sibsp').value);
    const parch = parseFloat(document.getElementById('parch').value);
    const fare = parseFloat(document.getElementById('fare').value);
    const embarked = document.getElementById('embarked').value;

    // Simple validation
    if (Number.isNaN(age) || Number.isNaN(fare)) {
        errorText.textContent = 'Please enter valid numeric values for Age and Fare.';
        errorText.classList.remove('hidden');
        return;
    }

    // Loading UI
    btn.disabled = true;
    btn.classList.add('opacity-70');
    spinner.classList.remove('hidden');
    resultContainer.className = "w-full text-center p-8 rounded-2xl min-h-[280px] flex flex-col items-center justify-center";
    resultContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center">
            <div class="radial-progress mb-6" style="--value:50%;--ring-color:#60A5FA" data-label="..."></div>
            <div class="px-6 py-3 rounded-full bg-blue-500/20 border border-blue-400/30 mb-4">
                <p class="text-lg font-semibold text-blue-300">Analyzing...</p>
            </div>
            <p class="text-sm text-gray-400">Processing your data with ML model</p>
        </div>`;

    try {
        const res = await fetch(`${BACKEND_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pclass, sex, age, sibsp, parch, fare, embarked })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const prob = data.probability;
        const prob_percent = (prob * 100).toFixed(1);
        const ringColor = prob >= 0.5 ? '#34D399' : '#F87171';
        const statusText = prob >= 0.5 ? 'Likely Survived' : 'Likely Perished';
        const statusIcon = prob >= 0.5 ? '✓' : '✗';
        
        resultContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <div class="radial-progress mb-6" style="--value:${prob_percent}%;--ring-color:${ringColor}" data-label="${prob_percent}%"></div>
                <div class="px-6 py-3 rounded-full ${prob >= 0.5 ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-red-500/20 border border-red-400/30'} mb-4">
                    <h3 class="text-2xl font-bold" style="color:${ringColor}">
                        ${statusIcon} ${statusText}
                    </h3>
                </div>
                <p class="text-lg text-gray-300 mb-2">Estimated Survival Probability</p>
                <p class="text-3xl font-black" style="color:${ringColor}">${prob_percent}%</p>
                <p class="text-sm text-gray-400 mt-4">Based on your input characteristics</p>
            </div>
        `;
        
        // Add glow effect based on result
        resultContainer.className = `w-full text-center p-8 rounded-2xl min-h-[280px] flex flex-col items-center justify-center ${prob >= 0.5 ? 'glow-survived' : 'glow-perished'}`;
    } catch (e) {
        errorText.textContent = `Prediction failed: ${e.message}. Is the backend running on port 5001?`;
        errorText.classList.remove('hidden');
        resultContainer.className = "w-full text-center p-8 rounded-2xl min-h-[280px] flex flex-col items-center justify-center";
        resultContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <svg class="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-gray-300 text-lg">Unable to get prediction</p>
                <p class="text-sm text-gray-400 mt-2">Please check your connection and try again</p>
            </div>
        `;
    } finally {
        btn.disabled = false;
        btn.classList.remove('opacity-70');
        spinner.classList.add('hidden');
    }
}


// --- CHART.JS LOGIC ---
// These are the stats from your train.csv, hard-coded for the dashboard

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chartAnimationDuration = prefersReducedMotion ? 0 : 800;

// Chart 1: Survival by Sex
const sexChart = new Chart(document.getElementById('sexChart'), {
    type: 'bar',
    data: {
        labels: ['Female', 'Male'],
        datasets: [
            {
                label: 'Perished',
                data: [81, 468],
                backgroundColor: 'rgba(248, 113, 113, 0.8)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Survived',
                data: [233, 109],
                backgroundColor: 'rgba(52, 211, 153, 0.8)',
                borderColor: 'rgba(5, 150, 105, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    },
    options: {
        animation: {
            duration: chartAnimationDuration,
            easing: 'easeOutQuart'
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: { 
                ticks: { color: '#d1d5db', font: { size: 12, weight: 'bold' } },
                grid: { color: 'rgba(255, 255, 255, 0.05)', display: false }
            },
            y: { 
                ticks: { color: '#d1d5db', font: { size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        plugins: {
            legend: { 
                labels: { 
                    color: '#e5e7eb', 
                    font: { size: 12, weight: '500' },
                    padding: 15,
                    usePointStyle: true
                },
                position: 'top'
            }
        }
    }
});

// Chart 2: Survival by Class
const classChart = new Chart(document.getElementById('classChart'), {
    type: 'bar',
    data: {
        labels: ['1st Class', '2nd Class', '3rd Class'],
        datasets: [
            {
                label: 'Perished',
                data: [80, 97, 372],
                backgroundColor: 'rgba(248, 113, 113, 0.8)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Survived',
                data: [136, 87, 119],
                backgroundColor: 'rgba(52, 211, 153, 0.8)',
                borderColor: 'rgba(5, 150, 105, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    },
    options: {
        animation: {
            duration: chartAnimationDuration,
            easing: 'easeOutQuart'
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: { 
                ticks: { color: '#d1d5db', font: { size: 12, weight: 'bold' } },
                grid: { color: 'rgba(255, 255, 255, 0.05)', display: false }
            },
            y: { 
                ticks: { color: '#d1d5db', font: { size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        plugins: {
            legend: { 
                labels: { 
                    color: '#e5e7eb', 
                    font: { size: 12, weight: '500' },
                    padding: 15,
                    usePointStyle: true
                },
                position: 'top'
            }
        }
    }
});

// Chart 3: Survival by Age (Binned)
const ageChart = new Chart(document.getElementById('ageChart'), {
    type: 'bar',
    data: {
        labels: ['0-10', '11-20', '21-30', '31-40', '41-50', '51+'],
        datasets: [
            {
                label: 'Perished',
                data: [26, 61, 146, 80, 50, 42],
                backgroundColor: 'rgba(248, 113, 113, 0.8)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Survived',
                data: [38, 41, 77, 48, 33, 22],
                backgroundColor: 'rgba(52, 211, 153, 0.8)',
                borderColor: 'rgba(5, 150, 105, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    },
    options: {
        animation: {
            duration: chartAnimationDuration,
            easing: 'easeOutQuart'
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: { 
                ticks: { color: '#d1d5db', font: { size: 12, weight: 'bold' } },
                grid: { color: 'rgba(255, 255, 255, 0.05)', display: false }
            },
            y: { 
                ticks: { color: '#d1d5db', font: { size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        plugins: {
            legend: { 
                labels: { 
                    color: '#e5e7eb', 
                    font: { size: 12, weight: '500' },
                    padding: 15,
                    usePointStyle: true
                },
                position: 'top'
            }
        }
    }
});

// IntersectionObserver to reveal sections on scroll (optimized)
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, { 
    threshold: 0.1,
    rootMargin: '50px'
});

// Use requestAnimationFrame for better performance
requestAnimationFrame(() => {
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
});


// --- COMPARISON PREDICTION FUNCTION ---
async function comparePredictions() {
    const compareBtn = document.getElementById('compare-btn');
    const compareSpinner = document.getElementById('compare-spinner');
    const compareErrorText = document.getElementById('compare-error-text');
    const comparisonContainer = document.getElementById('comparison-container');

    compareErrorText.classList.add('hidden');
    compareErrorText.textContent = '';

    // Get Person 1 inputs
    const p1_pclass = parseFloat(document.getElementById('p1-pclass').value);
    const p1_sex = parseFloat(document.getElementById('p1-sex').value);
    const p1_age = parseFloat(document.getElementById('p1-age').value);
    const p1_sibsp = parseFloat(document.getElementById('p1-sibsp').value);
    const p1_parch = parseFloat(document.getElementById('p1-parch').value);
    const p1_fare = parseFloat(document.getElementById('p1-fare').value);
    const p1_embarked = document.getElementById('p1-embarked').value;

    // Get Person 2 inputs
    const p2_pclass = parseFloat(document.getElementById('p2-pclass').value);
    const p2_sex = parseFloat(document.getElementById('p2-sex').value);
    const p2_age = parseFloat(document.getElementById('p2-age').value);
    const p2_sibsp = parseFloat(document.getElementById('p2-sibsp').value);
    const p2_parch = parseFloat(document.getElementById('p2-parch').value);
    const p2_fare = parseFloat(document.getElementById('p2-fare').value);
    const p2_embarked = document.getElementById('p2-embarked').value;

    // Validation
    if (Number.isNaN(p1_age) || Number.isNaN(p1_fare) || Number.isNaN(p2_age) || Number.isNaN(p2_fare)) {
        compareErrorText.textContent = 'Please enter valid numeric values for Age and Fare for both people.';
        compareErrorText.classList.remove('hidden');
        return;
    }

    // Loading UI
    compareBtn.disabled = true;
    compareBtn.classList.add('opacity-70');
    compareSpinner.classList.remove('hidden');
    comparisonContainer.innerHTML = `
        <div class="text-center py-8">
            <div class="inline-block radial-progress mb-4" style="--value:50%;--ring-color:#60A5FA" data-label="..."></div>
            <p class="text-gray-300">Analyzing both predictions...</p>
        </div>
    `;

    try {
        // Make two parallel API calls
        const [res1, res2] = await Promise.all([
            fetch(`${BACKEND_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pclass: p1_pclass, sex: p1_sex, age: p1_age, sibsp: p1_sibsp, parch: p1_parch, fare: p1_fare, embarked: p1_embarked })
            }),
            fetch(`${BACKEND_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pclass: p2_pclass, sex: p2_sex, age: p2_age, sibsp: p2_sibsp, parch: p2_parch, fare: p2_fare, embarked: p2_embarked })
            })
        ]);

        if (!res1.ok || !res2.ok) {
            throw new Error('Failed to get predictions');
        }

        const data1 = await res1.json();
        const data2 = await res2.json();

        const prob1 = data1.probability;
        const prob2 = data2.probability;
        const prob1_percent = (prob1 * 100).toFixed(1);
        const prob2_percent = (prob2 * 100).toFixed(1);
        const diff = Math.abs(prob1 - prob2);
        const diff_percent = (diff * 100).toFixed(1);

        const ringColor1 = prob1 >= 0.5 ? '#34D399' : '#F87171';
        const ringColor2 = prob2 >= 0.5 ? '#34D399' : '#F87171';
        const statusText1 = prob1 >= 0.5 ? 'Likely Survived' : 'Likely Perished';
        const statusText2 = prob2 >= 0.5 ? 'Likely Survived' : 'Likely Perished';
        const statusIcon1 = prob1 >= 0.5 ? '✓' : '✗';
        const statusIcon2 = prob2 >= 0.5 ? '✓' : '✗';

        // Display comparison results
        comparisonContainer.innerHTML = `
            <div class="space-y-4">
                <!-- Person 1 Result -->
                <div class="panel rounded-xl p-4 border border-blue-400/30 ${prob1 >= 0.5 ? 'glow-survived' : 'glow-perished'}">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span class="text-blue-400 font-bold text-sm">1</span>
                        </div>
                        <h3 class="text-base font-bold text-white">Person 1</h3>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="radial-progress flex-shrink-0" style="--size:80px;--value:${prob1_percent}%;--ring-color:${ringColor1}" data-label="${prob1_percent}%"></div>
                        <div class="flex-1">
                            <div class="px-3 py-1.5 rounded-full ${prob1 >= 0.5 ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-red-500/20 border border-red-400/30'} mb-2 inline-block">
                                <p class="text-xs font-bold" style="color:${ringColor1}">${statusIcon1} ${statusText1}</p>
                            </div>
                            <p class="text-xs text-gray-400">${prob1_percent}% survival probability</p>
                        </div>
                    </div>
                </div>

                <!-- Person 2 Result -->
                <div class="panel rounded-xl p-4 border border-emerald-400/30 ${prob2 >= 0.5 ? 'glow-survived' : 'glow-perished'}">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <span class="text-emerald-400 font-bold text-sm">2</span>
                        </div>
                        <h3 class="text-base font-bold text-white">Person 2</h3>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="radial-progress flex-shrink-0" style="--size:80px;--value:${prob2_percent}%;--ring-color:${ringColor2}" data-label="${prob2_percent}%"></div>
                        <div class="flex-1">
                            <div class="px-3 py-1.5 rounded-full ${prob2 >= 0.5 ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-red-500/20 border border-red-400/30'} mb-2 inline-block">
                                <p class="text-xs font-bold" style="color:${ringColor2}">${statusIcon2} ${statusText2}</p>
                            </div>
                            <p class="text-xs text-gray-400">${prob2_percent}% survival probability</p>
                        </div>
                    </div>
                </div>

                <!-- Comparison Summary -->
                <div class="panel rounded-xl p-4 border border-purple-400/30">
                    <h3 class="text-base font-bold text-white mb-3 text-center">Comparison</h3>
                    <div class="space-y-2 mb-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-300">Difference:</span>
                            <span class="text-sm font-bold text-purple-400">${diff_percent}%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-300">Better Chance:</span>
                            <span class="text-xs font-semibold ${prob1 > prob2 ? 'text-blue-400' : 'text-emerald-400'}">
                                Person ${prob1 > prob2 ? '1' : '2'}
                            </span>
                        </div>
                    </div>
                    <div class="pt-3 border-t border-white/10">
                        <canvas id="comparisonChart" height="100"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Create comparison chart
        setTimeout(() => {
            const ctx = document.getElementById('comparisonChart');
            if (ctx) {
                // Destroy existing chart if any
                if (window.comparisonChartInstance) {
                    window.comparisonChartInstance.destroy();
                }
                window.comparisonChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Person 1', 'Person 2'],
                        datasets: [{
                            label: 'Survival Probability (%)',
                            data: [prob1_percent, prob2_percent],
                            backgroundColor: [ringColor1, ringColor2],
                            borderColor: [ringColor1, ringColor2],
                            borderWidth: 2,
                            borderRadius: 6
                        }]
                    },
                    options: {
                        animation: {
                            duration: chartAnimationDuration,
                            easing: 'easeOutQuart'
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    color: '#d1d5db',
                                    font: { size: 11 },
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            },
                            x: {
                                ticks: {
                                    color: '#e5e7eb',
                                    font: { size: 12, weight: '500' }
                                },
                                grid: { display: false }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                titleColor: '#f3f4f6',
                                bodyColor: '#d1d5db',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 12,
                                callbacks: {
                                    label: function(context) {
                                        return context.parsed.y + '% survival probability';
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }, 100);

    } catch (e) {
        compareErrorText.textContent = `Comparison failed: ${e.message}. Is the backend running on port 5001?`;
        compareErrorText.classList.remove('hidden');
        comparisonContainer.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <p>Unable to compare predictions</p>
                <p class="text-sm mt-2">Please check your connection and try again</p>
            </div>
        `;
    } finally {
        compareBtn.disabled = false;
        compareBtn.classList.remove('opacity-70');
        compareSpinner.classList.add('hidden');
    }
}



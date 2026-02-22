// Analytics Dashboard JavaScript

let charts = {};
let allUserData = [];
let analyticsData = {};

// Initialize dashboard
function initDashboard() {
    seedMockData(); // Ensure mock data exists before loading
    loadAllData();
    calculateAnalytics();
    renderOverview();
    renderTopIssues();
    renderUserBehavior();
    renderFunnel();
    renderSegmentation();
    checkAwarenessAlerts();
}

// Function to generate and seed mock data if database is empty
function seedMockData() {
    let allUsersData = [];
    let allUserLogins = [];
    let demographicsTracking = [];
    let questionAnalytics = {};
    let funnelAnalytics = { visited: 0, attempted: 0, completed: 0 };

    const existingData = localStorage.getItem('allUsersData');
    if (existingData) {
        allUsersData = JSON.parse(existingData);
        const mockCount = allUsersData.filter(u => u.email && u.email.startsWith('mockuser')).length;
        if (mockCount >= 300) return; // Already fully seeded

        try { allUserLogins = JSON.parse(localStorage.getItem('allUserLogins') || '[]'); } catch (e) { }
        try { demographicsTracking = JSON.parse(localStorage.getItem('demographicsTracking') || '[]'); } catch (e) { }
        try { questionAnalytics = JSON.parse(localStorage.getItem('questionAnalytics') || '{}'); } catch (e) { }
        try { const f = JSON.parse(localStorage.getItem('funnelAnalytics')); if (f) funnelAnalytics = f; } catch (e) { }

        // Clean out old smaller mock batches
        allUsersData = allUsersData.filter(u => !u.email || !u.email.startsWith('mockuser'));
        allUserLogins = allUserLogins.filter(u => !u.email || !u.email.startsWith('mockuser'));
        demographicsTracking = demographicsTracking.filter(u => !u.email || !u.email.startsWith('mockuser'));
    }

    console.log("Seeding scale mock data for analytics...");
    const numberOfUsers = 300;

    const ages = ['13-17', '18-22', '23-27', '28-32', '33+'];
    const genders = ['male', 'female', 'non-binary', 'prefer-not-to-say'];
    const professions = ['student', 'working', 'both', 'other'];
    const answerOptions = {
        1: ['high', 'moderate', 'low', 'very_low'],
        2: ['9+', '7-8', '5-6', 'less_5'],
        3: ['rarely', 'sometimes', 'often', 'daily'],
        4: ['very_active', 'active', 'moderate', 'inactive'],
        5: ['none', 'mild', 'moderate', 'severe'],
        6: ['excellent', 'good', 'fair', 'poor'],
        7: ['never', 'rarely', 'sometimes', 'often'],
        8: ['never', 'rarely', 'sometimes', 'often'],
        9: ['excellent', 'good', 'fair', 'poor'],
        10: ['none', 'minor', 'moderate', 'major']
    };

    funnelAnalytics.visited += numberOfUsers + 120;
    funnelAnalytics.attempted += numberOfUsers + 45;
    funnelAnalytics.completed += numberOfUsers;

    for (let i = 1; i <= numberOfUsers; i++) {
        const email = `mockuser${i}@example.com`;
        const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);

        const age = ages[Math.floor(Math.random() * ages.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const profession = professions[Math.floor(Math.random() * professions.length)];

        const answers = {};
        const questionTimes = {};
        for (let q = 1; q <= 10; q++) {
            const opts = answerOptions[q];
            let selectedIndex;
            // Bias answers to show some rising trends (e.g. stress, sleep issues)
            if (q === 2 || q === 3) {
                selectedIndex = Math.min(opts.length - 1, Math.floor(Math.random() * 2) + 2);
            } else {
                selectedIndex = Math.floor(Math.random() * opts.length);
            }
            answers[q] = opts[selectedIndex];

            const timeSpent = Math.floor(Math.random() * 8000) + 2000;
            questionTimes[q] = timeSpent;

            if (!questionAnalytics[q]) questionAnalytics[q] = [];
            questionAnalytics[q].push(timeSpent);
        }

        allUsersData.push({
            email: email,
            timestamp: timestamp,
            lastUpdated: timestamp,
            data: {
                demographics: { age, profession, gender },
                questionnaire: {
                    demographics: { age, profession, gender },
                    answers: answers,
                    questionTimes: questionTimes,
                    completedAt: timestamp + 60000
                },
                completion: { completed: true, timestamp: timestamp + 60000 }
            }
        });

        allUserLogins.push({
            email: email,
            firstLogin: timestamp - 86400000,
            lastLogin: timestamp,
            loginCount: Math.floor(Math.random() * 5) + 1
        });

        demographicsTracking.push({
            email: email,
            age: age,
            gender: gender,
            profession: profession,
            timestamp: timestamp
        });
    }

    localStorage.setItem('allUsersData', JSON.stringify(allUsersData));
    localStorage.setItem('allUserLogins', JSON.stringify(allUserLogins));
    localStorage.setItem('demographicsTracking', JSON.stringify(demographicsTracking));
    localStorage.setItem('questionAnalytics', JSON.stringify(questionAnalytics));
    localStorage.setItem('funnelAnalytics', JSON.stringify(funnelAnalytics));
}

// Load all user data
function loadAllData() {
    const usersData = localStorage.getItem('allUsersData');
    const questionAnalytics = localStorage.getItem('questionAnalytics');
    const funnelData = localStorage.getItem('funnelAnalytics');
    const userLogins = localStorage.getItem('allUserLogins');
    const demographicsTracking = localStorage.getItem('demographicsTracking');

    allUserData = usersData ? JSON.parse(usersData) : [];
    analyticsData.questionTimes = questionAnalytics ? JSON.parse(questionAnalytics) : {};
    analyticsData.funnel = funnelData ? JSON.parse(funnelData) : {};
    analyticsData.userLogins = userLogins ? JSON.parse(userLogins) : [];
    analyticsData.demographicsTracking = demographicsTracking ? JSON.parse(demographicsTracking) : [];
}

// Helper: merge questionnaire demographics with login demographics tracking
function getMergedDemographics(email, questionnaireDemographics) {
    const base = questionnaireDemographics ? { ...questionnaireDemographics } : {};
    const tracking = analyticsData.demographicsTracking || [];
    const tracked = tracking.find(d => d.email === email);

    if (tracked) {
        if (!base.age && tracked.age) base.age = tracked.age;
        if (!base.profession && tracked.profession) base.profession = tracked.profession;
    }

    return base;
}

// Calculate analytics from user data
function calculateAnalytics() {
    const issues = {};
    const ageGroups = {};
    const professions = {};
    const questionTimes = {};

    allUserData.forEach(user => {
        if (user.data && user.data.questionnaire) {
            const qData = user.data.questionnaire;
            const demographics = getMergedDemographics(user.email, qData.demographics || {});
            const answers = qData.answers || {};

            // Track issues
            const userIssues = analyzeUserIssues(answers);
            userIssues.forEach(issue => {
                issues[issue] = (issues[issue] || 0) + 1;
            });

            // Track by age
            const age = demographics.age || 'unknown';
            if (!ageGroups[age]) {
                ageGroups[age] = { issues: {} };
            }
            userIssues.forEach(issue => {
                ageGroups[age].issues[issue] = (ageGroups[age].issues[issue] || 0) + 1;
            });

            // Track by profession
            const profession = demographics.profession || 'unknown';
            if (!professions[profession]) {
                professions[profession] = { issues: {} };
            }
            userIssues.forEach(issue => {
                professions[profession].issues[issue] = (professions[profession].issues[issue] || 0) + 1;
            });

            // Track question times
            if (qData.questionTimes) {
                Object.keys(qData.questionTimes).forEach(qId => {
                    if (!questionTimes[qId]) {
                        questionTimes[qId] = [];
                    }
                    questionTimes[qId].push(qData.questionTimes[qId]);
                });
            }
        }
    });

    analyticsData.issues = issues;
    analyticsData.ageGroups = ageGroups;
    analyticsData.professions = professions;
    analyticsData.questionTimes = questionTimes;
}

// Analyze user issues from answers
function analyzeUserIssues(answers) {
    const issues = [];

    if (answers[1] === 'low' || answers[1] === 'very_low') issues.push('Low Energy');
    if (answers[2] === '5-6' || answers[2] === 'less_5') issues.push('Sleep Deprivation');
    if (answers[3] === 'often' || answers[3] === 'daily') issues.push('High Stress/Anxiety');
    if (answers[4] === 'moderate' || answers[4] === 'inactive') issues.push('Physical Inactivity');
    if (answers[5] === 'moderate' || answers[5] === 'severe') issues.push('Physical Pain');
    if (answers[6] === 'fair' || answers[6] === 'poor') issues.push('Poor Nutrition');
    if (answers[7] === 'often' || answers[7] === 'sometimes') issues.push('Coping Difficulties');
    if (answers[8] === 'often') issues.push('Concentration Issues');
    if (answers[9] === 'fair' || answers[9] === 'poor') issues.push('Social Isolation');

    return issues;
}

// Get top 5 issues
function getTop5Issues() {
    const issues = analyticsData.issues || {};
    return Object.entries(issues)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
}

// Render Overview Tab
function renderOverview() {
    // Use real login data, not questionnaire data
    const totalUsers = analyticsData.userLogins.length;
    const completed = allUserData.filter(u => u.data && u.data.completion && u.data.completion.completed).length;
    const completionRate = totalUsers > 0 ? Math.round((completed / totalUsers) * 100) : 0;

    // Calculate average completion time
    let totalTime = 0;
    let timeCount = 0;
    allUserData.forEach(user => {
        if (user.data && user.data.questionnaire && user.data.questionnaire.questionTimes) {
            const times = Object.values(user.data.questionnaire.questionTimes);
            totalTime += times.reduce((a, b) => a + b, 0);
            timeCount += times.length;
        }
    });
    const avgTime = timeCount > 0 ? Math.round((totalTime / timeCount) / 1000 / 60) : 0;

    // Update with real data
    const totalUsersEl = document.getElementById('totalUsers');
    const completedEl = document.getElementById('completedAssessments');
    const avgTimeEl = document.getElementById('avgCompletionTime');
    const completionRateEl = document.getElementById('completionRate');

    if (totalUsersEl) totalUsersEl.textContent = totalUsers;
    if (completedEl) completedEl.textContent = completed;
    if (avgTimeEl) avgTimeEl.textContent = avgTime;
    if (completionRateEl) completionRateEl.textContent = completionRate + '%';

    // Top Issues Chart
    const topIssues = getTop5Issues();
    const ctx = document.getElementById('topIssuesChart');
    if (ctx) {
        if (charts.topIssues) charts.topIssues.destroy();
        charts.topIssues = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topIssues.map(i => i.name),
                datasets: [{
                    label: 'Number of Users',
                    data: topIssues.map(i => i.count),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 101, 101, 1)',
                        'rgba(251, 146, 60, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// Render Top 5 Issues Tab
function renderTopIssues() {
    const topIssues = getTop5Issues();
    const container = document.getElementById('topIssuesList');

    if (container) {
        container.innerHTML = topIssues.map((issue, index) => `
            <div class="issue-item">
                <div>
                    <span style="font-weight: bold; color: #0ea5e9; margin-right: 8px;">#${index + 1}</span>
                    <span class="issue-name">${issue.name}</span>
                </div>
                <span class="issue-count">${issue.count} users</span>
            </div>
        `).join('');
    }

    // Pie Chart
    const ctx = document.getElementById('issuesPieChart');
    if (ctx) {
        if (charts.issuesPie) charts.issuesPie.destroy();
        charts.issuesPie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: topIssues.map(i => i.name),
                datasets: [{
                    data: topIssues.map(i => i.count),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Render User Behavior Tab
function renderUserBehavior() {
    const questionLabels = [
        'Energy Levels', 'Sleep', 'Stress', 'Activity', 'Pain',
        'Nutrition', 'Coping', 'Concentration', 'Social', 'Life Changes'
    ];

    const avgTimes = [];
    for (let i = 1; i <= 10; i++) {
        const times = analyticsData.questionTimes[i] || [];
        const avg = times.length > 0
            ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 1000)
            : 0;
        avgTimes.push(avg);
    }

    const ctx = document.getElementById('questionTimeChart');
    if (ctx) {
        if (charts.questionTime) charts.questionTime.destroy();
        charts.questionTime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: questionLabels,
                datasets: [{
                    label: 'Average Time (seconds)',
                    data: avgTimes,
                    borderColor: 'rgba(14, 165, 233, 1)',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (seconds)'
                        }
                    }
                }
            }
        });
    }

    // Question Difficulty List
    const container = document.getElementById('questionDifficultyList');
    if (container) {
        const difficulties = questionLabels.map((label, index) => ({
            label,
            time: avgTimes[index],
            questionId: index + 1
        })).sort((a, b) => b.time - a.time);

        container.innerHTML = difficulties.map((q, index) => `
            <div class="issue-item" style="border-left-color: ${index < 3 ? '#ef4444' : '#0ea5e9'};">
                <div>
                    <span class="issue-name">${q.label}</span>
                </div>
                <span class="issue-count">${q.time}s avg</span>
            </div>
        `).join('');
    }
}

// Render Funnel Analytics
function renderFunnel() {
    // Reload funnel data to get latest
    const funnelData = localStorage.getItem('funnelAnalytics');
    const funnel = funnelData ? JSON.parse(funnelData) : {};

    const visited = funnel.visited || 0;
    const attempted = funnel.attempted || 0;
    const completed = funnel.completed || 0;

    const steps = [
        { label: 'Visited Page', value: visited, color: '#0ea5e9', dropoff: visited - attempted },
        { label: 'Started Questionnaire', value: attempted, color: '#10b981', dropoff: attempted - completed },
        { label: 'Completed Assessment', value: completed, color: '#f59e0b', dropoff: 0 }
    ];

    const maxValue = Math.max(visited, 1);

    const container = document.getElementById('funnelContainer');
    if (container) {
        if (visited === 0 && attempted === 0 && completed === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <p style="font-size: 16px; margin-bottom: 8px;">No funnel data available yet</p>
                    <p style="font-size: 14px;">Users need to visit and start the questionnaire to see data here.</p>
                </div>
            `;
        } else {
            container.innerHTML = steps.map((step, index) => `
            <div class="funnel-step">
                <div class="funnel-label">${step.label}</div>
                <div class="funnel-bar">
                    <div class="funnel-fill" style="width: ${(step.value / maxValue) * 100}%; background: ${step.color};"></div>
                </div>
                <div class="funnel-value">
                    <div style="font-size: 18px; font-weight: bold;">${step.value}</div>
                    <div style="font-size: 12px; color: #6b7280;">users</div>
                </div>
                <div class="funnel-stats" style="min-width: 150px; margin-left: 20px;">
                    ${step.label === 'Started Questionnaire' ? `
                        <div style="font-size: 13px; font-weight: 500; color: #059669;">${visited > 0 ? Math.round((step.value / visited) * 100) : 0}% conversion</div>
                        <div style="font-size: 11px; color: #ef4444;">${steps[0].dropoff} users dropped off</div>
                    ` : ''}
                    ${step.label === 'Completed Assessment' ? `
                        <div style="font-size: 13px; font-weight: 500; color: #d97706;">${attempted > 0 ? Math.round((step.value / attempted) * 100) : 0}% conversion</div>
                        <div style="font-size: 11px; color: #ef4444;">${steps[1].dropoff} users dropped off</div>
                    ` : ''}
                    ${step.label === 'Visited Page' ? `
                        <div style="font-size: 13px; color: #6b7280;">Baseline</div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        }
    }

    // Funnel Chart
    const ctx = document.getElementById('funnelChart');
    if (ctx) {
        if (charts.funnel) charts.funnel.destroy();
        charts.funnel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: steps.map(s => s.label),
                datasets: [{
                    label: 'Users',
                    data: steps.map(s => s.value),
                    backgroundColor: steps.map(s => s.color),
                    borderColor: steps.map(s => s.color),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Render Segmentation
function renderSegmentation() {
    updateSegmentation();
}

function updateSegmentation() {
    const ageFilter = document.getElementById('ageFilter').value;
    const professionFilter = document.getElementById('professionFilter').value;

    let filteredData = allUserData;

    if (ageFilter !== 'all') {
        filteredData = filteredData.filter(u =>
            u.data && getMergedDemographics(u.email, (u.data.questionnaire && u.data.questionnaire.demographics) || u.data.demographics || {}).age === ageFilter
        );
    }

    if (professionFilter !== 'all') {
        filteredData = filteredData.filter(u =>
            u.data && getMergedDemographics(u.email, (u.data.questionnaire && u.data.questionnaire.demographics) || u.data.demographics || {}).profession === professionFilter
        );
    }

    // Calculate issues by age group
    const ageGroups = {};
    filteredData.forEach(user => {
        if (user.data && user.data.questionnaire) {
            const mergedDemo = getMergedDemographics(
                user.email,
                (user.data.questionnaire && user.data.questionnaire.demographics) || user.data.demographics || {}
            );
            const age = mergedDemo.age || 'unknown';
            const issues = analyzeUserIssues(user.data.questionnaire.answers || {});
            issues.forEach(issue => {
                if (!ageGroups[age]) ageGroups[age] = {};
                ageGroups[age][issue] = (ageGroups[age][issue] || 0) + 1;
            });
        }
    });

    // Calculate issues by profession
    const professions = {};
    filteredData.forEach(user => {
        if (user.data && user.data.questionnaire) {
            const mergedDemo = getMergedDemographics(
                user.email,
                (user.data.questionnaire && user.data.questionnaire.demographics) || user.data.demographics || {}
            );
            const prof = mergedDemo.profession || 'unknown';
            const issues = analyzeUserIssues(user.data.questionnaire.answers || {});
            issues.forEach(issue => {
                if (!professions[prof]) professions[prof] = {};
                professions[prof][issue] = (professions[prof][issue] || 0) + 1;
            });
        }
    });

    // Age Group Chart
    const ageLabels = Object.keys(ageGroups);
    const allIssues = new Set();
    ageLabels.forEach(age => {
        Object.keys(ageGroups[age]).forEach(issue => allIssues.add(issue));
    });

    const ctx1 = document.getElementById('ageGroupChart');
    if (ctx1 && ageLabels.length > 0) {
        if (charts.ageGroup) charts.ageGroup.destroy();
        charts.ageGroup = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: Array.from(allIssues),
                datasets: ageLabels.map((age, index) => ({
                    label: age,
                    data: Array.from(allIssues).map(issue => ageGroups[age][issue] || 0),
                    backgroundColor: `rgba(${100 + index * 50}, ${150 + index * 30}, ${200 + index * 20}, 0.8)`
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Profession Chart
    const profLabels = Object.keys(professions);
    const ctx2 = document.getElementById('professionChart');
    if (ctx2 && profLabels.length > 0) {
        if (charts.profession) charts.profession.destroy();
        charts.profession = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: profLabels,
                datasets: [{
                    data: profLabels.map(prof =>
                        Object.values(professions[prof]).reduce((a, b) => a + b, 0)
                    ),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Segmentation Details
    const detailsContainer = document.getElementById('segmentationDetails');
    if (detailsContainer) {
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">';

        ageLabels.forEach(age => {
            const issues = ageGroups[age];
            const total = Object.values(issues).reduce((a, b) => a + b, 0);
            html += `
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                    <h3 style="margin-bottom: 12px; color: #111827;">${age} years</h3>
                    ${Object.entries(issues).map(([issue, count]) => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>${issue}</span>
                            <strong>${count}</strong>
                        </div>
                    `).join('')}
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                        <strong>Total: ${total}</strong>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        detailsContainer.innerHTML = html;
    }
}

// Check Awareness Alerts
function checkAwarenessAlerts() {
    const topIssues = getTop5Issues();
    if (topIssues.length > 0 && topIssues[0].count >= 3) {
        showAwarenessPopup(topIssues[0]);
    }
}

function showAwarenessPopup(issue) {
    const popup = document.getElementById('awarenessPopup');
    const overlay = document.getElementById('popupOverlay');
    const content = document.getElementById('popupContent');

    content.innerHTML = `
        <p><strong>Alert:</strong> ${issue.name} is affecting ${issue.count} users.</p>
        <p style="margin-top: 12px;">This is a rising concern among youth. Consider implementing targeted interventions and awareness programs.</p>
    `;

    popup.classList.add('active');
    overlay.classList.add('active');
}

function closeAwarenessPopup() {
    document.getElementById('awarenessPopup').classList.remove('active');
    document.getElementById('popupOverlay').classList.remove('active');
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Reload data when switching to specific tabs
    if (tabName === 'funnel') {
        loadAllData();
        renderFunnel();
    } else if (tabName === 'overview') {
        loadAllData();
        calculateAnalytics();
        renderOverview();
        renderTopIssues();
    } else if (tabName === 'behavior') {
        loadAllData();
        calculateAnalytics();
        renderUserBehavior();
    } else if (tabName === 'segmentation') {
        loadAllData();
        calculateAnalytics();
        renderSegmentation();
    } else if (tabName === 'issues') {
        loadAllData();
        calculateAnalytics();
        renderTopIssues();
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'index.html';
}

// Refresh funnel data manually
function refreshFunnelData() {
    loadAllData();
    renderFunnel();
}

// Reset all dashboard analytics data
function resetDashboardData() {
    if (confirm('Are you sure you want to reset ALL analytics data? This will clear 5 types of data: User Assessments, Question Times, Funnel Data, User Logins, and Demographics. This action cannot be undone.')) {
        // Clear the 5 main analytics keys
        localStorage.removeItem('allUsersData');
        localStorage.removeItem('questionAnalytics');
        localStorage.removeItem('funnelAnalytics');
        localStorage.removeItem('allUserLogins');
        localStorage.removeItem('demographicsTracking');

        // Clear supporting tracking keys
        localStorage.removeItem('userFunnelTracking');
        localStorage.removeItem('questionnaireAnswers');
        localStorage.removeItem('questionnaireCompleted');
        localStorage.removeItem('questionnaireCompleteData');
        localStorage.removeItem('userDemographics');

        // Clear OTP session data (optional but good for clean slate)
        localStorage.removeItem('userOTP');
        localStorage.removeItem('userOTPEmail');
        localStorage.removeItem('userOTPExpiry');

        // Reload the page to refresh all charts and stats
        alert('All 5 analytics data sources have been reset successfully.');
        location.reload();
    }
}

// Reset funnel data (kept for specific funnel reset if needed, or can be removed)
function resetFunnelData() {
    if (confirm('Are you sure you want to reset all funnel analytics data? This cannot be undone.')) {
        localStorage.removeItem('funnelAnalytics');
        localStorage.removeItem('userFunnelTracking');
        loadAllData();
        renderFunnel();
        alert('Funnel data has been reset.');
    }
}

// Initialize on load
window.addEventListener('load', initDashboard);

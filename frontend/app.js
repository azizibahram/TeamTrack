// ============================================
// TeamTrack - Modern Dashboard Application
// Enhanced with Gamification Features
// ============================================

// Utility Functions
const utils = {
    // Animate number counter
    animateCounter: (element, target, duration = 1000) => {
        const start = parseInt(element.textContent) || 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeProgress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    },

    // Format date
    formatDate: (date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    },

    // Get attendance class
    getAttendanceClass: (attendance) => {
        switch (attendance) {
            case 'Present': return 'present';
            case 'Absent': return 'absent';
            case 'Late': return 'late';
            default: return 'unknown';
        }
    },

    // Get attendance icon
    getAttendanceIcon: (attendance) => {
        switch (attendance) {
            case 'Present': return 'fa-check';
            case 'Absent': return 'fa-times';
            case 'Late': return 'fa-clock';
            default: return 'fa-question';
        }
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Add stagger delay to elements
    staggerAnimation: (elements, baseDelay = 0.1) => {
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * baseDelay}s`;
        });
    },

    // Trigger confetti effect
    triggerConfetti: () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00d4ff', '#a855f7', '#f472b6', '#ffd700']
        });
    }
};

// Achievement System
class AchievementSystem {
    constructor() {
        this.badges = {
            earlyBird: { id: 'early-bird', icon: 'fa-sun', name: 'Early Bird', desc: 'Arrived before 9:00 AM' },
            taskPoster: { id: 'task-poster', icon: 'fa-clipboard-list', name: 'Active Poster', desc: 'Posted tasks today' },
            perfectWeek: { id: 'perfect-week', icon: 'fa-calendar-check', name: 'Perfect Week', desc: '100% attendance this week' },
            consistent: { id: 'consistent', icon: 'fa-star', name: 'Consistent', desc: 'Posted tasks all week' },
            streak5: { id: 'streak-5', icon: 'fa-fire', name: 'On Fire!', desc: '5-day attendance streak' }
        };
    }

    // Calculate badges for an employee
    calculateBadges(employee, weeklyAttendance) {
        const badges = [];
        
        // Early Bird - check if arrived before 9:00 AM (based on not being late)
        if (employee.attendance === 'Present') {
            badges.push(this.badges.earlyBird);
        }
        
        // Active Poster - has tasks posted today
        if (employee.todayTasks.length > 0) {
            badges.push(this.badges.taskPoster);
        }
        
        // Perfect Week - check all days in weekly attendance
        if (weeklyAttendance && this.hasPerfectWeek(employee.name, weeklyAttendance)) {
            badges.push(this.badges.perfectWeek);
        }
        
        // Consistent - posted tasks all week (has week tasks)
        if (employee.weekTasks.length >= 5) {
            badges.push(this.badges.consistent);
        }
        
        // Streak - simulate streak based on attendance
        if (employee.attendance === 'Present') {
            const streakDays = Math.floor(Math.random() * 5) + 1; // Simulated for demo
            if (streakDays >= 5) {
                badges.push(this.badges.streak5);
            }
        }
        
        return badges;
    }

    hasPerfectWeek(employeeName, weeklyAttendance) {
        const days = Object.keys(weeklyAttendance);
        if (days.length < 5) return false;
        
        return days.every(day => {
            const dayData = weeklyAttendance[day];
            return dayData && dayData[employeeName] === 'Present';
        });
    }

    // Render badges HTML
    renderBadges(badges) {
        if (badges.length === 0) {
            return '<span style="color: var(--color-text-muted); font-size: 0.8rem;">-</span>';
        }
        
        return `
            <div class="badges-container">
                ${badges.map(badge => `
                    <div class="badge ${badge.id}" data-tooltip="${badge.name}: ${badge.desc}">
                        <i class="fas ${badge.icon}"></i>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Show achievement popup
    showAchievement(badgeName) {
        const popup = document.getElementById('achievement-popup');
        const nameEl = document.getElementById('achievement-name');
        
        nameEl.textContent = badgeName;
        popup.classList.add('show');
        
        utils.triggerConfetti();
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 4000);
    }
}

// Points & Level System
class LevelSystem {
    constructor() {
        this.levels = [
            { name: 'Novice', minPoints: 0, color: '#6b7280' },
            { name: 'Contributor', minPoints: 100, color: '#00d4ff' },
            { name: 'Expert', minPoints: 300, color: '#a855f7' },
            { name: 'Master', minPoints: 600, color: '#ffd700' },
            { name: 'Legend', minPoints: 1000, color: '#f472b6' }
        ];
    }

    // Calculate points for an employee based on weekly performance
    calculatePoints(employee, weeklyAttendance) {
        let points = 0;
        
        // Points for weekly attendance (from weeklyAttendance data)
        if (weeklyAttendance) {
            Object.values(weeklyAttendance).forEach(dayData => {
                if (dayData && dayData[employee.name]) {
                    const status = dayData[employee.name];
                    if (status === 'Present') {
                        points += 20;  // On-time attendance
                    } else if (status === 'Late') {
                        points += 10;  // Late attendance
                    }
                    // Absent = 0 points
                }
            });
        }
        
        // Points for today's attendance
        if (employee.attendance === 'Present') points += 20;
        if (employee.attendance === 'Late') points += 10;
        
        // Points for weekly tasks (consistent activity)
        points += employee.weekTasks.length * 5;
        
        // Bonus for posting tasks today
        if (employee.todayTasks.length > 0) {
            points += 15;  // Daily activity bonus
            points += employee.todayTasks.length * 3;  // Points per task posted
        }
        
        // Early bird bonus (if present today and has tasks)
        if (employee.attendance === 'Present' && employee.todayTasks.length > 0) {
            points += 10;  // Early bird bonus for being on time AND productive
        }
        
        return points;
    }

    // Get level info based on points
    getLevelInfo(points) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (points >= this.levels[i].minPoints) {
                const nextLevel = this.levels[i + 1];
                return {
                    current: this.levels[i],
                    next: nextLevel,
                    progress: nextLevel 
                        ? ((points - this.levels[i].minPoints) / (nextLevel.minPoints - this.levels[i].minPoints)) * 100
                        : 100
                };
            }
        }
        return { current: this.levels[0], next: this.levels[1], progress: 0 };
    }

    // Calculate attendance streak - consecutive days of being present (Present or Late)
    calculateAttendanceStreak(employee, weeklyAttendance) {
        if (!weeklyAttendance) return 0;
        
        let streak = 0;
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // Count consecutive present days from the end of the week
        for (let i = days.length - 1; i >= 0; i--) {
            const dayData = weeklyAttendance[days[i]];
            if (dayData && (dayData[employee.name] === 'Present' || dayData[employee.name] === 'Late')) {
                streak++;
            } else if (dayData && dayData[employee.name] === 'Absent') {
                break; // Streak broken by absence
            }
            // If no data for that day, continue checking previous days
        }
        
        return streak;
    }

    // Calculate task streak - consecutive days of posting tasks from Saturday (Friday is vacation)
    calculateTaskStreak(employee, weeklyAttendance) {
        if (!employee.dailyTaskCounts) {
            return 0;
        }
        
        let streak = 0;
        // Week starts Saturday, ends Thursday (Friday is vacation)
        const workDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        
        // Count consecutive days with tasks from Saturday forward
        for (let i = 0; i < workDays.length; i++) {
            const day = workDays[i];
            const taskCount = employee.dailyTaskCounts[day] || 0;
            
            if (taskCount > 0) {
                streak++;
            } else {
                break; // Streak broken when no tasks on a work day
            }
        }
        
        return streak;
    }
}

// Leaderboard Manager
class LeaderboardManager {
    constructor(achievementSystem, levelSystem) {
        this.achievementSystem = achievementSystem;
        this.levelSystem = levelSystem;
        this.podium = document.getElementById('podium');
        this.list = document.getElementById('leaderboard-list');
    }

    update(employees, weeklyAttendance) {
        // Calculate scores for all employees
        const rankedEmployees = employees
            .filter(emp => emp.name !== 'Azizi')
            .map(emp => {
                const points = this.levelSystem.calculatePoints(emp, weeklyAttendance);
                const badges = this.achievementSystem.calculateBadges(emp, weeklyAttendance);
                return { ...emp, points, badges };
            })
            .sort((a, b) => b.points - a.points);

        this.renderPodium(rankedEmployees.slice(0, 3));
        this.renderList(rankedEmployees.slice(3));
        
        return rankedEmployees;
    }

    renderPodium(top3) {
        const positions = [
            { id: 'podium-1', index: 0, delay: 0 },
            { id: 'podium-2', index: 1, delay: 0.1 },
            { id: 'podium-3', index: 2, delay: 0.2 }
        ];

        positions.forEach(pos => {
            const employee = top3[pos.index];
            const el = document.getElementById(pos.id);
            
            if (employee && el) {
                el.style.animationDelay = `${pos.delay}s`;
                el.querySelector('.podium-avatar img').src = employee.photo;
                el.querySelector('.podium-name').textContent = employee.name;
                el.querySelector('.podium-points').textContent = `${employee.points} pts`;
            }
        });
    }

    renderList(remaining) {
        this.list.innerHTML = remaining.map((emp, index) => `
            <div class="leaderboard-item" style="animation-delay: ${index * 0.05}s">
                <div class="leaderboard-rank">${index + 4}</div>
                <img src="${emp.photo}" alt="${emp.name}" class="leaderboard-avatar">
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${emp.name}</div>
                    <div class="leaderboard-role">${emp.role || 'Team Member'}</div>
                </div>
                <div class="leaderboard-badges">
                    ${emp.badges.slice(0, 3).map(badge => `
                        <div class="badge ${badge.id}" style="width: 24px; height: 24px; font-size: 0.65rem;">
                            <i class="fas ${badge.icon}"></i>
                        </div>
                    `).join('')}
                </div>
                <div class="leaderboard-points">${emp.points} pts</div>
            </div>
        `).join('');
    }
}

// Team Goals Manager
class TeamGoalsManager {
    constructor() {
        this.goals = {
            attendance: { element: 'goal-attendance', target: 95 },
            tasks: { element: 'goal-tasks', target: 90 },
            ontime: { element: 'goal-ontime', target: 85 }
        };
    }

    update(employees, weeklyAttendance) {
        const nonAzizi = employees.filter(emp => emp.name !== 'Azizi');
        const total = nonAzizi.length;
        
        if (total === 0) return;

        // Calculate attendance rate
        const present = nonAzizi.filter(emp => emp.attendance === 'Present').length;
        const attendanceRate = Math.round((present / total) * 100);
        
        // Calculate task completion rate (simulated)
        const tasksRate = Math.min(100, Math.round((nonAzizi.reduce((sum, emp) => sum + emp.todayTasks.length, 0) / (total * 3)) * 100));
        
        // Calculate on-time rate
        const onTime = nonAzizi.filter(emp => emp.attendance === 'Present').length;
        const onTimeRate = Math.round((onTime / total) * 100);

        this.updateGoal('attendance', attendanceRate);
        this.updateGoal('tasks', tasksRate);
        this.updateGoal('ontime', onTimeRate);
    }

    updateGoal(type, value) {
        const percentEl = document.getElementById(`${this.goals[type].element}-percent`);
        const barEl = document.querySelector(`#${this.goals[type].element}-bar .goal-fill`);
        const glowEl = document.querySelector(`#${this.goals[type].element}-bar .goal-glow`);
        
        if (percentEl && barEl) {
            percentEl.textContent = `${value}%`;
            barEl.style.width = `${value}%`;
            if (glowEl) glowEl.style.width = `${value}%`;
            
            // Color based on progress
            if (value >= 90) {
                percentEl.style.color = 'var(--color-success)';
            } else if (value >= 70) {
                percentEl.style.color = 'var(--color-warning)';
            } else {
                percentEl.style.color = 'var(--color-danger)';
            }
        }
    }
}

// Top Performer Manager
class TopPerformerManager {
    constructor(achievementSystem, levelSystem) {
        this.achievementSystem = achievementSystem;
        this.levelSystem = levelSystem;
        this.photoEl = document.getElementById('top-performer-photo');
        this.nameEl = document.getElementById('top-performer-name');
        this.roleEl = document.getElementById('top-performer-role');
        this.pointsEl = document.getElementById('top-performer-points');
        this.attendanceStreakEl = document.getElementById('top-performer-attendance-streak');
        this.taskStreakEl = document.getElementById('top-performer-task-streak');
        this.badgesEl = document.getElementById('top-performer-badges');
    }

    update(topEmployee, weeklyAttendance) {
        if (!topEmployee) return;

        // Update photo
        if (this.photoEl) {
            this.photoEl.src = topEmployee.photo;
        }

        // Update name
        if (this.nameEl) {
            this.nameEl.textContent = topEmployee.name;
        }

        // Update role
        if (this.roleEl) {
            this.roleEl.textContent = topEmployee.role || 'Team Member';
        }

        // Update points
        if (this.pointsEl) {
            this.pointsEl.textContent = `${topEmployee.points} pts`;
        }

        // Update attendance streak
        if (this.attendanceStreakEl) {
            const attendanceStreak = this.levelSystem.calculateAttendanceStreak(topEmployee, weeklyAttendance);
            this.attendanceStreakEl.textContent = `${attendanceStreak} day attendance streak`;
        }

        // Update task streak
        if (this.taskStreakEl) {
            const taskStreak = this.levelSystem.calculateTaskStreak(topEmployee, weeklyAttendance);
            this.taskStreakEl.textContent = `${taskStreak} day task streak`;
        }

        // Update badges
        if (this.badgesEl && topEmployee.badges) {
            this.badgesEl.innerHTML = topEmployee.badges.slice(0, 5).map(badge => `
                <div class="badge ${badge.id}" data-tooltip="${badge.name}: ${badge.desc}">
                    <i class="fas ${badge.icon}"></i>
                </div>
            `).join('');
        }
    }
}

// Stats Manager
class StatsManager {
    constructor() {
        this.elements = {
            present: document.getElementById('stat-present'),
            absent: document.getElementById('stat-absent'),
            late: document.getElementById('stat-late'),
            total: document.getElementById('stat-total')
        };
    }

    update(employees) {
        const stats = {
            present: 0,
            absent: 0,
            late: 0,
            total: employees.filter(emp => emp.name !== 'Azizi').length
        };

        employees.forEach(emp => {
            if (emp.name === 'Azizi') return;
            const status = utils.getAttendanceClass(emp.attendance);
            if (stats[status] !== undefined) {
                stats[status]++;
            }
        });

        // Animate counters
        Object.keys(stats).forEach(key => {
            if (this.elements[key]) {
                utils.animateCounter(this.elements[key], stats[key]);
            }
        });
    }
}

// News Manager
class NewsManager {
    constructor() {
        this.container = document.getElementById('news-content');
    }

    update(news) {
        if (!news || news.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state" style="padding: 1rem;">
                    <i class="fas fa-newspaper"></i>
                    <p style="font-size: 0.85rem;">No news today</p>
                </div>
            `;
            return;
        }

        this.container.innerHTML = news.map((item, index) => `
            <div class="news-item" style="animation-delay: ${index * 0.1}s">
                <div class="news-item-author">
                    <i class="fas fa-user"></i> ${item.user}
                </div>
                <div class="news-item-text">${item.text}</div>
            </div>
        `).join('');
    }
}

// Profile Manager
class ProfileManager {
    constructor() {
        this.photo = document.getElementById('azizi-photo');
        this.message = document.getElementById('azizi-message');
    }

    update(azizi) {
        if (azizi) {
            this.photo.src = azizi.photo;
            this.message.innerHTML = `
                <strong><i class="fas fa-tasks"></i> Today's Focus</strong>
                <ul>
                    ${azizi.todayTasks.map(task => `<li>${task.text}</li>`).join('')}
                </ul>
            `;
        }
    }
}

// Employees Table Manager
class EmployeesTableManager {
    constructor(achievementSystem) {
        this.table = document.getElementById('employees-table');
        this.dataTable = null;
        this.achievementSystem = achievementSystem;
    }

    update(employees, weeklyAttendance) {
        const tbody = this.table.querySelector('tbody');
        const filteredEmployees = employees.filter(emp => emp.name !== 'Azizi');

        // Destroy existing DataTable if exists
        if (this.dataTable) {
            this.dataTable.destroy();
        }

        tbody.innerHTML = filteredEmployees.map((employee, index) => {
            const badges = this.achievementSystem.calculateBadges(employee, weeklyAttendance);
            
            return `
            <tr style="animation-delay: ${index * 0.05}s">
                <td>
                    <img src="${employee.photo}" alt="${employee.name}" class="employee-photo">
                </td>
                <td>
                    <div class="employee-name">${employee.name}</div>
                </td>
                <td>
                    <div class="employee-email">${employee.email}</div>
                </td>
                <td>
                    <span class="employee-role">
                        <i class="fas fa-briefcase"></i>
                        ${employee.role || 'Team Member'}
                    </span>
                </td>
                <td>
                    ${this.achievementSystem.renderBadges(badges)}
                </td>
                <td>
                    <div class="task-list">
                        ${employee.todayTasks.slice(0, 3).map(task => `
                            <div class="task-item">
                                <i class="fas fa-check-circle"></i>
                                <span>${task.text}</span>
                            </div>
                        `).join('')}
                        ${employee.todayTasks.length > 3 ? `
                            <div class="task-item" style="opacity: 0.6;">
                                <i class="fas fa-ellipsis-h"></i>
                                <span>+${employee.todayTasks.length - 3} more tasks</span>
                            </div>
                        ` : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${utils.getAttendanceClass(employee.attendance)}">
                        <i class="fas ${utils.getAttendanceIcon(employee.attendance)}"></i>
                        ${employee.attendance}
                    </span>
                </td>
            </tr>
        `}).join('');

        // Initialize DataTable
        this.dataTable = $(this.table).DataTable({
            pageLength: 10,
            responsive: true,
            language: {
                search: '',
                searchPlaceholder: 'Search employees...',
                lengthMenu: 'Show _MENU_ entries',
                info: 'Showing _START_ to _END_ of _TOTAL_ entries',
                paginate: {
                    previous: '<i class="fas fa-chevron-left"></i>',
                    next: '<i class="fas fa-chevron-right"></i>'
                }
            },
            columnDefs: [
                { orderable: false, targets: [0, 4, 5] }
            ],
            drawCallback: () => {
                const rows = this.table.querySelectorAll('tbody tr');
                utils.staggerAnimation(rows, 0.03);
            }
        });
    }
}

// Weekly Report Manager
class WeeklyReportManager {
    constructor() {
        this.container = document.getElementById('weekly-report');
        this.dataTable = null;
    }

    update(employees, weeklyAttendance, weekOffset) {
        if (!weeklyAttendance || Object.keys(weeklyAttendance).length === 0) {
            this.container.innerHTML = '';
            return;
        }

        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() + 1) % 7 - (weekOffset * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekLabel = weekOffset === 0 
            ? 'This Week Report' 
            : `Week: ${utils.formatDate(weekStart)} - ${utils.formatDate(weekEnd)}`;

        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayLabels = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

        const filteredEmployees = employees.filter(emp => emp.name !== 'Azizi');

        this.container.innerHTML = `
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h2 class="section-title">${weekLabel}</h2>
                <div class="section-line"></div>
            </div>
            <div class="table-container glass-card weekly-report-container">
                <div class="table-glow"></div>
                <table id="weekly-table" class="weekly-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            ${dayLabels.map(day => `<th>${day}</th>`).join('')}
                            <th>Weekly Tasks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredEmployees.map((employee, index) => `
                            <tr style="animation-delay: ${index * 0.05}s">
                                <td>
                                    <div class="weekly-employee">
                                        <img src="${employee.photo}" alt="${employee.name}">
                                        <div class="weekly-employee-info">
                                            <span class="weekly-employee-name">${employee.name}</span>
                                            <span class="weekly-employee-email">${employee.email}</span>
                                        </div>
                                    </div>
                                </td>
                                ${days.map(day => {
                                    const status = weeklyAttendance[day] && weeklyAttendance[day][employee.name];
                                    const statusClass = status ? utils.getAttendanceClass(status) : 'empty';
                                    const icon = status ? utils.getAttendanceIcon(status) : '';
                                    return `
                                        <td>
                                            <div class="attendance-dot ${statusClass}" data-tooltip="${day}: ${status || 'No data'}">
                                                ${icon ? `<i class="fas ${icon}"></i>` : ''}
                                            </div>
                                        </td>
                                    `;
                                }).join('')}
                                <td>
                                    <div class="task-list">
                                        ${employee.weekTasks.slice(0, 2).map(task => `
                                            <div class="task-item">
                                                <i class="fas fa-tasks"></i>
                                                <span>${task.text}</span>
                                            </div>
                                        `).join('')}
                                        ${employee.weekTasks.length > 2 ? `
                                            <div class="task-item" style="opacity: 0.6;">
                                                <i class="fas fa-ellipsis-h"></i>
                                                <span>+${employee.weekTasks.length - 2} more</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Initialize DataTable for weekly report
        if (this.dataTable) {
            this.dataTable.destroy();
        }

        this.dataTable = $('#weekly-table').DataTable({
            pageLength: 10,
            responsive: true,
            searching: false,
            language: {
                lengthMenu: 'Show _MENU_ entries',
                info: 'Showing _START_ to _END_ of _TOTAL_ entries',
                paginate: {
                    previous: '<i class="fas fa-chevron-left"></i>',
                    next: '<i class="fas fa-chevron-right"></i>'
                }
            },
            drawCallback: () => {
                const rows = document.querySelectorAll('#weekly-table tbody tr');
                utils.staggerAnimation(rows, 0.03);
            }
        });
    }
}

// Week Tabs Manager
class WeekTabsManager {
    constructor() {
        this.container = document.getElementById('week-tabs-container');
        this.currentOffset = 0;
        this.onWeekChange = null;
    }

    generate() {
        const now = new Date();
        let tabsHtml = '';

        for (let i = 0; i < 8; i++) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (now.getDay() + 1) % 7 - (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const label = i === 0 
                ? 'This Week' 
                : `${utils.formatDate(weekStart)} - ${utils.formatDate(weekEnd)}`;

            tabsHtml += `
                <button class="week-tab ${i === 0 ? 'active' : ''}" data-week="${i}">
                    <span>${label}</span>
                </button>
            `;
        }

        this.container.innerHTML = tabsHtml;
        this.attachListeners();
    }

    attachListeners() {
        const tabs = this.container.querySelectorAll('.week-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const weekOffset = parseInt(e.currentTarget.dataset.week);
                this.switchWeek(weekOffset);
            });
        });
    }

    switchWeek(weekOffset) {
        if (weekOffset === this.currentOffset) return;

        this.currentOffset = weekOffset;

        // Update active state
        const tabs = this.container.querySelectorAll('.week-tab');
        tabs.forEach(tab => {
            const tabWeek = parseInt(tab.dataset.week);
            if (tabWeek === weekOffset) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Trigger callback
        if (this.onWeekChange) {
            this.onWeekChange(weekOffset);
        }
    }
}

// Loading Screen Manager
class LoadingManager {
    constructor() {
        this.element = document.getElementById('loading');
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        setTimeout(() => {
            this.element.classList.add('hidden');
        }, 500);
    }
}

// Main Application
class TeamTrackApp {
    constructor() {
        this.loading = new LoadingManager();
        this.achievementSystem = new AchievementSystem();
        this.levelSystem = new LevelSystem();
        
        this.stats = new StatsManager();
        this.news = new NewsManager();
        this.profile = new ProfileManager();
        this.employeesTable = new EmployeesTableManager(this.achievementSystem);
        this.weeklyReport = new WeeklyReportManager();
        this.weekTabs = new WeekTabsManager();
        this.leaderboard = new LeaderboardManager(this.achievementSystem, this.levelSystem);
        this.teamGoals = new TeamGoalsManager();
        this.topPerformer = new TopPerformerManager(this.achievementSystem, this.levelSystem);
        
        this.socket = null;
        this.currentData = null;

        // Bind week change handler
        this.weekTabs.onWeekChange = this.handleWeekChange.bind(this);
    }

    async init() {
        try {
            // Generate week tabs
            this.weekTabs.generate();

            // Fetch initial data
            await this.fetchData();

            // Connect to real-time updates
            this.connectSocket();

            // Hide loading screen
            this.loading.hide();

        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load dashboard data');
            this.loading.hide();
        }
    }

    async fetchData(weekOffset = 0) {
        try {
            const response = await fetch(`http://localhost:3000/api/employees?weekOffset=${weekOffset}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const data = await response.json();
            this.currentData = data;
            this.updateUI(data);
            
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    updateUI(data) {
        const { employees, news, weeklyAttendance } = data;

        // Update stats
        this.stats.update(employees);

        // Update news
        this.news.update(news);

        // Update HOD profile
        const azizi = employees.find(emp => emp.name === 'Azizi');
        this.profile.update(azizi);

        // Update gamification features
        const rankedEmployees = this.leaderboard.update(employees, weeklyAttendance);
        this.teamGoals.update(employees, weeklyAttendance);
        
        // Update Top Performer - #1 ranked employee
        if (rankedEmployees && rankedEmployees.length > 0) {
            this.topPerformer.update(rankedEmployees[0], weeklyAttendance);
        }

        // Update employees table
        this.employeesTable.update(employees, weeklyAttendance);

        // Update weekly report
        this.weeklyReport.update(employees, weeklyAttendance, this.weekTabs.currentOffset);
    }

    async handleWeekChange(weekOffset) {
        this.loading.show();
        
        try {
            await this.fetchData(weekOffset);
        } catch (error) {
            console.error('Error switching week:', error);
        } finally {
            this.loading.hide();
        }
    }

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to real-time updates');
        });

        this.socket.on('update', (newData) => {
            console.log('Received real-time update');
            // Only update if viewing current week
            if (this.weekTabs.currentOffset === 0) {
                this.currentData = newData;
                this.updateUI(newData);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from real-time updates');
        });
    }

    showError(message) {
        const container = document.querySelector('.main-container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'glass-card';
        errorDiv.style.cssText = `
            padding: 2rem;
            text-align: center;
            margin: 2rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--color-danger); margin-bottom: 1rem;"></i>
            <h3 style="color: var(--color-text); margin-bottom: 0.5rem;">Oops! Something went wrong</h3>
            <p style="color: var(--color-text-muted);">${message}</p>
        `;
        container.appendChild(errorDiv);
    }
}

// Initialize App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TeamTrackApp();
    app.init();
});

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
    }
});

// Add smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TeamTrackApp, utils };
}
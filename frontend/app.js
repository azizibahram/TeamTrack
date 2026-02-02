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
        
        // Points for in-progress tasks
        points += (employee.weekTasks?.length || 0) * 3;
        
        // Points for completed tasks (worth more!)
        points += (employee.weekCompletedTasks?.length || 0) * 10;
        
        // Task completion rate bonus
        const totalTasks = (employee.weekTasks?.length || 0) + (employee.weekCompletedTasks?.length || 0);
        const completedTasks = employee.weekCompletedTasks?.length || 0;
        if (totalTasks > 0) {
            const completionRate = completedTasks / totalTasks;
            if (completionRate === 1.0) {
                points += 50;  // Perfect completion bonus
            } else if (completionRate >= 0.8) {
                points += 30;  // High completion bonus
            } else if (completionRate >= 0.5) {
                points += 15;  // Good completion bonus
            }
        }
        
        // Daily activity bonus for completing tasks
        if (employee.todayCompletedTasks?.length > 0) {
            points += 20;  // Daily completion bonus
            points += employee.todayCompletedTasks.length * 5;  // Points per completed task
        }
        
        // Early bird bonus (if present today and completed tasks)
        if (employee.attendance === 'Present' && employee.todayCompletedTasks?.length > 0) {
            points += 15;  // Early bird + productive bonus
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

    // Calculate task streak - consecutive days of posting tasks from Saturday to Thursday
    // Counts from Saturday forward to Thursday (Friday is vacation)
    // Based on dailyTaskCounts which tracks in-progress tasks from tasks channel
    calculateTaskStreak(employee, weeklyAttendance) {
        if (!employee.dailyTaskCounts) {
            return 0;
        }
        
        let streak = 0;
        // Week starts Saturday, ends Thursday (Friday is vacation)
        const workDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        
        // Count consecutive days with tasks from Saturday forward
        // This matches how the weekly report shows in-progress tasks
        for (let i = 0; i < workDays.length; i++) {
            const day = workDays[i];
            const taskCount = employee.dailyTaskCounts[day] || 0;
            
            // Count if employee posted tasks (in-progress) on that day
            if (taskCount > 0) {
                streak++;
            } else {
                // If we've already counted some days, stop here
                // This means they had a streak but it ended
                if (streak > 0) {
                    break;
                }
                // If no streak started yet, continue checking
                // (they might start their streak on Sunday or Monday)
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
        this.employees = [];
        this.weeklyAttendance = null;
    }

    update(employees, weeklyAttendance) {
        this.employees = employees;
        this.weeklyAttendance = weeklyAttendance;
        
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
        this.bindClickEvents(rankedEmployees, weeklyAttendance, this.levelSystem, this.achievementSystem);
        
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
                el.querySelector('.podium-avatar img').dataset.employeeId = employee.id;
                el.querySelector('.podium-name').textContent = employee.name;
                el.querySelector('.podium-name').dataset.employeeId = employee.id;
                el.querySelector('.podium-points').textContent = `${employee.points} pts`;
            }
        });
    }

    renderList(remaining) {
        this.list.innerHTML = remaining.map((emp, index) => `
            <div class="leaderboard-item" style="animation-delay: ${index * 0.05}s" data-employee-id="${emp.id}">
                <div class="leaderboard-rank">${index + 4}</div>
                <img src="${emp.photo}" alt="${emp.name}" class="leaderboard-avatar" data-employee-id="${emp.id}">
                <div class="leaderboard-info">
                    <div class="leaderboard-name" data-employee-id="${emp.id}">${emp.name}</div>
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
    
    bindClickEvents(employees, weeklyAttendance, levelSystem, achievementSystem) {
        // Bind clicks for podium
        const podiumAvatars = document.querySelectorAll('.podium-avatar img');
        const podiumNames = document.querySelectorAll('.podium-name');
        
        podiumAvatars.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.employeeId;
                const employee = employees.find(emp => emp.id === employeeId);
                if (employee) {
                    window.employeeModal.open(employee, weeklyAttendance, levelSystem, achievementSystem);
                }
            });
        });
        
        podiumNames.forEach(name => {
            name.style.cursor = 'pointer';
            name.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.employeeId;
                const employee = employees.find(emp => emp.id === employeeId);
                if (employee) {
                    window.employeeModal.open(employee, weeklyAttendance, levelSystem, achievementSystem);
                }
            });
        });
        
        // Bind clicks for list items
        const listItems = document.querySelectorAll('.leaderboard-item');
        listItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                const employeeId = item.dataset.employeeId;
                const employee = employees.find(emp => emp.id === employeeId);
                if (employee) {
                    window.employeeModal.open(employee, weeklyAttendance, levelSystem, achievementSystem);
                }
            });
        });
    }
}

// Team Goals Manager
class TeamGoalsManager {
    constructor() {
        this.goals = {
            attendance: { element: 'goal-attendance', target: 95 },
            tasks: { element: 'goal-tasks', target: 90 },
            completion: { element: 'goal-completion', target: 80 }
        };
    }

    update(employees, weeklyAttendance) {
        const nonAzizi = employees.filter(emp => emp.name !== 'Azizi');
        const total = nonAzizi.length;
        
        if (total === 0) return;

        // Calculate attendance rate
        const present = nonAzizi.filter(emp => emp.attendance === 'Present' || emp.attendance === 'Late').length;
        const attendanceRate = Math.round((present / total) * 100);
        
        // Calculate task completion rate using done_tasks channel data
        let totalTasks = 0;
        let completedTasks = 0;
        
        nonAzizi.forEach(emp => {
            const inProgress = emp.weekTasks?.length || 0;
            const completed = emp.weekCompletedTasks?.length || 0;
            totalTasks += inProgress + completed;
            completedTasks += completed;
        });
        
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Calculate on-time rate
        const onTime = nonAzizi.filter(emp => emp.attendance === 'Present').length;
        const onTimeRate = Math.round((onTime / total) * 100);

        this.updateGoal('attendance', attendanceRate);
        this.updateGoal('tasks', completionRate);
        this.updateGoal('completion', onTimeRate);
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

// Employee Profile Modal Manager
class EmployeeProfileModal {
    constructor() {
        this.modal = document.getElementById('employee-modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.getElementById('modal-close');
        this.currentData = null;
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Close button click
        this.closeBtn?.addEventListener('click', () => this.close());
        
        // Click outside to close
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.close();
            }
        });
    }
    
    open(employee, weeklyAttendance, levelSystem, achievementSystem) {
        if (!this.modal || !this.modalBody) return;
        
        this.currentData = { employee, weeklyAttendance };
        
        const points = levelSystem.calculatePoints(employee, weeklyAttendance);
        const levelInfo = levelSystem.getLevelInfo(points);
        const badges = achievementSystem.calculateBadges(employee, weeklyAttendance);
        const attendanceStreak = levelSystem.calculateAttendanceStreak(employee, weeklyAttendance);
        const taskStreak = levelSystem.calculateTaskStreak(employee, weeklyAttendance);
        
        // Calculate weekly stats
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const presentDays = days.filter(day => {
            const status = weeklyAttendance?.[day]?.[employee.name];
            return status === 'Present' || status === 'Late';
        }).length;
        
        const absentDays = days.filter(day => {
            const status = weeklyAttendance?.[day]?.[employee.name];
            return status === 'Absent';
        }).length;
        
        const lateDays = days.filter(day => {
            const status = weeklyAttendance?.[day]?.[employee.name];
            return status === 'Late';
        }).length;
        
        // Calculate task stats
        const totalTasks = (employee.weekTasks?.length || 0) + (employee.weekCompletedTasks?.length || 0);
        const completedTasks = employee.weekCompletedTasks?.length || 0;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Generate last 12 weeks (3 months) of mock history
        const weeksHistory = this.generateWeeksHistory(employee, 12);
        
        // Calculate progress to next level
        const nextLevelPoints = levelInfo.next ? levelInfo.next.minPoints : levelInfo.current.minPoints;
        const currentLevelPoints = levelInfo.current.minPoints;
        const pointsInLevel = points - currentLevelPoints;
        const pointsNeeded = nextLevelPoints - currentLevelPoints;
        const progressPercent = levelInfo.next ? Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100)) : 100;
        
        this.modalBody.innerHTML = `
            <div class="modal-profile-card">
                <div class="modal-profile-header">
                    <img src="${employee.photo}" alt="${employee.name}" class="modal-avatar-large">
                    <div class="modal-profile-info">
                        <h2>${employee.name}</h2>
                        <span class="modal-role-badge">${employee.role || 'Team Member'}</span>
                        <div class="modal-contact-info">
                            <span><i class="fas fa-envelope"></i> ${employee.email}</span>
                        </div>
                    </div>
                    <div class="modal-level-badge">

                        <div class="level-text">${levelInfo.current.name}</div>
                    </div>
                </div>
                
                <div class="modal-level-progress">
                    <div class="progress-header">
                        <span>Level Progress</span>
                        <span>${points} / ${nextLevelPoints || 'MAX'} pts</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-footer">
                        ${levelInfo.next ? `<span>${nextLevelPoints - points} points to ${levelInfo.next.name}</span>` : '<span>Maximum level reached!</span>'}
                    </div>
                </div>
            </div>
            
            <div class="modal-stats-grid">
                <div class="modal-stat-card primary">
                    <div class="stat-icon"><i class="fas fa-fire"></i></div>
                    <div class="stat-value">${attendanceStreak}</div>
                    <div class="stat-label">Attendance Streak</div>
                </div>
                <div class="modal-stat-card success">
                    <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                    <div class="stat-value">${taskStreak}</div>
                    <div class="stat-label">Task Streak</div>
                </div>
                <div class="modal-stat-card info">
                    <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                    <div class="stat-value">${presentDays}/6</div>
                    <div class="stat-label">Days Present</div>
                </div>
                <div class="modal-stat-card warning">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-value">${lateDays}</div>
                    <div class="stat-label">Late Days</div>
                </div>
                <div class="modal-stat-card danger">
                    <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                    <div class="stat-value">${absentDays}</div>
                    <div class="stat-label">Absent Days</div>
                </div>
                <div class="modal-stat-card purple">
                    <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                    <div class="stat-value">${badges.length}</div>
                    <div class="stat-label">Badges Earned</div>
                </div>
            </div>
            
            <div class="modal-tasks-overview">
                <div class="overview-card">
                    <div class="overview-header">
                        <i class="fas fa-clipboard-list"></i>
                        <span>Task Completion</span>
                    </div>
                    <div class="overview-body">
                        <div class="completion-ring">
                            <svg viewBox="0 0 100 100">
                                <circle class="ring-bg" cx="50" cy="50" r="45"></circle>
                                <circle class="ring-progress" cx="50" cy="50" r="45" style="stroke-dashoffset: ${283 - (283 * completionRate / 100)}"></circle>
                            </svg>
                            <div class="ring-text">${completionRate}%</div>
                        </div>
                        <div class="completion-stats">
                            <div class="comp-stat">
                                <span class="comp-number">${employee.weekTasks?.length || 0}</span>
                                <span class="comp-label">In Progress</span>
                            </div>
                            <div class="comp-stat">
                                <span class="comp-number">${completedTasks}</span>
                                <span class="comp-label">Completed</span>
                            </div>
                            <div class="comp-stat">
                                <span class="comp-number">${totalTasks}</span>
                                <span class="comp-label">Total</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-header">
                        <i class="fas fa-calendar-alt"></i>
                        <span>This Week's Attendance</span>
                    </div>
                    <div class="overview-body">
                        <div class="attendance-grid">
                            ${days.slice(0, 6).map(day => {
                                const status = weeklyAttendance?.[day]?.[employee.name] || 'Absent';
                                const statusClass = status.toLowerCase();
                                const icon = status === 'Present' ? 'fa-check' : status === 'Late' ? 'fa-clock' : 'fa-times';
                                return `
                                    <div class="attendance-day ${statusClass}">
                                        <span class="day-name">${day.slice(0, 3)}</span>
                                        <i class="fas ${icon}"></i>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-section achievements-section">
                <h4><i class="fas fa-medal"></i> Achievements & Badges</h4>
                <div class="badges-container">
                    ${badges.length > 0 ? achievementSystem.renderBadges(badges) : '<p style="color: var(--color-text-muted);">No badges earned yet. Keep working!</p>'}
                </div>
            </div>
            
            <div class="modal-tasks-section">
                <div class="task-column">
                    <h4><i class="fas fa-tasks"></i> In Progress (${employee.weekTasks?.length || 0})</h4>
                    <div class="modal-tasks-list">
                        ${employee.weekTasks?.length > 0 ? employee.weekTasks.map(task => `
                            <div class="modal-task-item in-progress">
                                <i class="fas fa-circle"></i>
                                <span>${task.text}</span>
                            </div>
                        `).join('') : '<p class="empty-state">No tasks in progress</p>'}
                    </div>
                </div>
                
                <div class="task-column">
                    <h4><i class="fas fa-check-circle"></i> Completed (${employee.weekCompletedTasks?.length || 0})</h4>
                    <div class="modal-tasks-list">
                        ${(employee.weekCompletedTasks || []).length > 0 ? (employee.weekCompletedTasks || []).map(task => `
                            <div class="modal-task-item completed">
                                <i class="fas fa-check-circle"></i>
                                <span>${task.text}</span>
                            </div>
                        `).join('') : '<p class="empty-state">No tasks completed</p>'}
                    </div>
                </div>
            </div>
        `;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    generateWeeksHistory(employee, numWeeks) {
        // Generate mock historical data based on current employee activity
        const history = [];
        const baseTasks = employee.weekTasks?.length || 0;
        const baseCompleted = employee.weekCompletedTasks?.length || 0;
        
        for (let i = numWeeks - 1; i >= 0; i--) {
            // Create some variation in historical data
            const variation = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
            const tasks = Math.max(0, Math.round(baseTasks * variation * (1 - i * 0.02)));
            const completed = Math.max(0, Math.min(tasks, Math.round(baseCompleted * variation * (1 - i * 0.02))));
            
            history.push({ tasks, completed });
        }
        
        return history;
    }
    
    close() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentData = null;
    }
}

// Create global modal instance
window.employeeModal = null;

// Employees Table Manager
class EmployeesTableManager {
    constructor(achievementSystem, levelSystem) {
        this.table = document.getElementById('employees-table');
        this.dataTable = null;
        this.achievementSystem = achievementSystem;
        this.levelSystem = levelSystem;
        this.employees = [];
        this.weeklyAttendance = null;
        
        // Create global modal instance if not exists
        if (!window.employeeModal) {
            window.employeeModal = new EmployeeProfileModal();
        }
    }

    update(employees, weeklyAttendance) {
        this.employees = employees;
        this.weeklyAttendance = weeklyAttendance;
        const tbody = this.table.querySelector('tbody');
        const filteredEmployees = employees.filter(emp => emp.name !== 'Azizi');

        // Destroy existing DataTable if exists
        if (this.dataTable) {
            this.dataTable.destroy();
        }

        tbody.innerHTML = filteredEmployees.map((employee, index) => {
            const badges = this.achievementSystem.calculateBadges(employee, weeklyAttendance);
            
            return `
            <tr style="animation-delay: ${index * 0.05}s" data-employee-id="${employee.id}">
                <td>
                    <img src="${employee.photo}" alt="${employee.name}" class="employee-photo" style="cursor: pointer;" data-employee-id="${employee.id}">
                </td>
                <td>
                    <div class="employee-name" style="cursor: pointer;" data-employee-id="${employee.id}">${employee.name}</div>
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
                                <i class="fas fa-circle" style="color: var(--color-warning);"></i>
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
                    <div class="task-list">
                        ${(employee.todayCompletedTasks || []).slice(0, 3).map(task => `
                            <div class="task-item">
                                <i class="fas fa-check-circle" style="color: var(--color-success);"></i>
                                <span>${task.text}</span>
                            </div>
                        `).join('')}
                        ${(employee.todayCompletedTasks || []).length > 3 ? `
                            <div class="task-item" style="opacity: 0.6;">
                                <i class="fas fa-ellipsis-h"></i>
                                <span>+${employee.todayCompletedTasks.length - 3} more done</span>
                            </div>
                        ` : ''}
                        ${(employee.todayCompletedTasks || []).length === 0 ? `
                            <span style="color: var(--color-text-muted); font-size: 0.85rem;">-</span>
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
                this.bindRowClicks();
            }
        });
        
        this.bindRowClicks();
    }
    
    bindRowClicks() {
        // Bind click events to employee photos and names
        const clickableElements = this.table.querySelectorAll('.employee-photo, .employee-name');
        clickableElements.forEach(el => {
            el.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.employeeId;
                const employee = this.employees.find(emp => emp.id === employeeId);
                if (employee && window.employeeModal) {
                    window.employeeModal.open(employee, this.weeklyAttendance, this.levelSystem, this.achievementSystem);
                }
            });
        });
    }
}

// Weekly Report Manager
class WeeklyReportManager {
    constructor() {
        this.container = document.getElementById('weekly-report');
        this.dataTable = null;
        this.employees = [];
        this.weeklyAttendance = null;
    }

    update(employees, weeklyAttendance, weekOffset) {
        this.employees = employees;
        this.weeklyAttendance = weeklyAttendance;
        
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
                            <th>In Progress</th>
                            <th>Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredEmployees.map((employee, index) => `
                            <tr style="animation-delay: ${index * 0.05}s" data-employee-id="${employee.id}">
                                <td>
                                    <div class="weekly-employee" style="cursor: pointer;" data-employee-id="${employee.id}">
                                        <img src="${employee.photo}" alt="${employee.name}" data-employee-id="${employee.id}">
                                        <div class="weekly-employee-info">
                                            <span class="weekly-employee-name" data-employee-id="${employee.id}">${employee.name}</span>
                                            <span class="weekly-employee-email">${employee.email}</span>
                                        </div>
                                    </div>
                                </td>
                                ${days.map(day => {
                                    // Get attendance status from weeklyAttendance data
                                    let status = weeklyAttendance[day] && weeklyAttendance[day][employee.name];
                                    
                                    // Determine if this day is in the future
                                    const dayIndex = days.indexOf(day);
                                    const today = new Date();
                                    const currentDayIndex = (today.getDay() + 1) % 7; // Saturday = 0, Sunday = 1, etc.
                                    const isFutureDay = dayIndex > currentDayIndex;
                                    
                                    // If no status found:
                                    // - Future days: show empty
                                    // - Past/current days: mark as Absent
                                    if (!status) {
                                        if (isFutureDay) {
                                            // Future day - show empty
                                            return `
                                                <td>
                                                    <div class="attendance-dot empty" data-tooltip="${day}: Future">
                                                    </div>
                                                </td>
                                            `;
                                        } else {
                                            // Past or current day - mark as Absent
                                            status = 'Absent';
                                        }
                                    }
                                    
                                    const statusClass = utils.getAttendanceClass(status);
                                    const icon = utils.getAttendanceIcon(status);
                                    return `
                                        <td>
                                            <div class="attendance-dot ${statusClass}" data-tooltip="${day}: ${status}">
                                                <i class="fas ${icon}"></i>
                                            </div>
                                        </td>
                                    `;
                                }).join('')}
                                <td>
                                    <div class="task-list">
                                        ${employee.weekTasks.slice(0, 2).map(task => `
                                            <div class="task-item">
                                                <i class="fas fa-circle" style="color: var(--color-warning); font-size: 0.5rem;"></i>
                                                <span>${task.text}</span>
                                            </div>
                                        `).join('')}
                                        ${employee.weekTasks.length > 2 ? `
                                            <div class="task-item" style="opacity: 0.6;">
                                                <i class="fas fa-ellipsis-h"></i>
                                                <span>+${employee.weekTasks.length - 2} more</span>
                                            </div>
                                        ` : ''}
                                        ${employee.weekTasks.length === 0 ? `<span style="color: var(--color-text-muted); font-size: 0.8rem;">-</span>` : ''}
                                    </div>
                                </td>
                                <td>
                                    <div class="task-list">
                                        ${(employee.weekCompletedTasks || []).slice(0, 2).map(task => `
                                            <div class="task-item">
                                                <i class="fas fa-check-circle" style="color: var(--color-success);"></i>
                                                <span>${task.text}</span>
                                            </div>
                                        `).join('')}
                                        ${(employee.weekCompletedTasks || []).length > 2 ? `
                                            <div class="task-item" style="opacity: 0.6;">
                                                <i class="fas fa-ellipsis-h"></i>
                                                <span>+${employee.weekCompletedTasks.length - 2} more done</span>
                                            </div>
                                        ` : ''}
                                        ${(employee.weekCompletedTasks || []).length === 0 ? `<span style="color: var(--color-text-muted); font-size: 0.8rem;">-</span>` : ''}
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
                this.bindRowClicks();
            }
        });
        
        this.bindRowClicks();
    }
    
    bindRowClicks() {
        // Bind click events to employee names and photos in weekly report
        const clickableElements = document.querySelectorAll('.weekly-employee, .weekly-employee img, .weekly-employee-name');
        clickableElements.forEach(el => {
            el.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.employeeId || e.target.closest('[data-employee-id]')?.dataset.employeeId;
                const employee = this.employees.find(emp => emp.id === employeeId);
                if (employee && window.employeeModal) {
                    window.employeeModal.open(employee, this.weeklyAttendance, window.levelSystem, window.achievementSystem);
                }
            });
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
        this.employeesTable = new EmployeesTableManager(this.achievementSystem, this.levelSystem);
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
            
            // Initialize print button
            this.initPrintButton();

            // Hide loading screen
            this.loading.hide();

        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load dashboard data');
            this.loading.hide();
        }
    }
    
    initPrintButton() {
        const printBtn = document.getElementById('print-button');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
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
        
        // Bind click events for leaderboard after UI update
        this.leaderboard.bindClickEvents(employees, weeklyAttendance, this.levelSystem, this.achievementSystem);
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
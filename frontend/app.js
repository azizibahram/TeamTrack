// ============================================
// TeamTrack - Modern Dashboard Application
// Enhanced with smooth animations and effects
// ============================================

// Utility Functions
const utils = {
    // Animate number counter
    animateCounter: (element, target, duration = 1000) => {
        const start = 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
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
    }
};

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
    constructor() {
        this.table = document.getElementById('employees-table');
        this.dataTable = null;
    }

    update(employees) {
        const tbody = this.table.querySelector('tbody');
        const filteredEmployees = employees.filter(emp => emp.name !== 'Azizi');

        // Destroy existing DataTable if exists
        if (this.dataTable) {
            this.dataTable.destroy();
        }

        tbody.innerHTML = filteredEmployees.map((employee, index) => `
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
        `).join('');

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
                { orderable: false, targets: [0, 4] }
            ],
            drawCallback: () => {
                // Re-apply animations after table draw
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
        this.stats = new StatsManager();
        this.news = new NewsManager();
        this.profile = new ProfileManager();
        this.employeesTable = new EmployeesTableManager();
        this.weeklyReport = new WeeklyReportManager();
        this.weekTabs = new WeekTabsManager();
        
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

        // Update employees table
        this.employeesTable.update(employees);

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
        // Page is hidden - can pause animations
        document.body.classList.add('page-hidden');
    } else {
        // Page is visible - resume animations
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
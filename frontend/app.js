document.addEventListener('DOMContentLoaded', async () => {
    const employeesDiv = document.getElementById('employees');
    const newsContentDiv = document.getElementById('news-content');
    try {
        const response = await fetch('http://localhost:3000/api/employees');
        const { employees, news, weeklyAttendance } = await response.json();
        // Display news
        if (news && news.length > 0) {
            newsContentDiv.innerHTML = `
                <div class="space-y-2">
                    ${news.map((item, index) => `
                        <div class="bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg animate-fade-in border border-white border-opacity-10" style="animation-delay: ${index * 0.1}s">
                            <strong class="text-cyan-300">${item.user}:</strong> <i class="fas fa-info-circle mr-2 text-cyan-300"></i>${item.text}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        // Handle Azizi's profile
        const azizi = employees.find(emp => emp.name === 'Azizi');
        if (azizi) {
            document.getElementById('azizi-photo').src = azizi.photo;
            document.getElementById('azizi-message').innerHTML = `
                <strong>Today's Message:</strong><br>
                <ul class="mt-1">
                    ${azizi.todayTasks.map(task => `<li>${task.text}</li>`).join('')}
                </ul>
            `;
        }

        const tableBody = document.querySelector('#employees-table tbody');
        employees.filter(employee => employee.name !== 'Azizi').forEach((employee, index) => {
            const row = document.createElement('tr');
            row.className = 'animate-fade-in';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td class="px-4 py-3">
                    <img src="${employee.photo}" alt="${employee.name}" class="w-12 h-12 rounded-full border-2 border-indigo-200">
                </td>
                <td class="px-4 py-3 font-medium text-white">${employee.name}</td>
                <td class="px-4 py-3 text-gray-300 text-sm">${employee.email}</td>
                <td class="px-4 py-3 text-cyan-300 text-sm">${employee.role}</td>
                <td class="px-4 py-3">
                    <ul class="space-y-1">
                        ${employee.todayTasks.map(task => `<li class="text-sm text-gray-200">${task.text}</li>`).join('')}
                    </ul>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold ${getAttendanceClass(employee.attendance)}">
                        <i class="fas ${employee.attendance === 'Present' ? 'fa-check-circle' : employee.attendance === 'Absent' ? 'fa-times-circle' : 'fa-question-circle'} mr-1"></i>
                        ${employee.attendance}
                    </span>
                </td>
            `;
            tableBody.appendChild(row);
        });
        // Initialize DataTable
        $('#employees-table').DataTable({
            "paging": true,
            "searching": true,
            "ordering": true,
            "info": true,
            "autoWidth": false,
            "responsive": true
        });

        // Display weekly report
        const reportDiv = document.getElementById('weekly-report');
        if (weeklyAttendance && Object.keys(weeklyAttendance).length > 0) {
            reportDiv.innerHTML = `
                <h2 class="text-3xl font-bold text-center mb-8 animate-fade-in text-white drop-shadow-lg">This Week Report</h2>
                <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-white border-opacity-20">
                    <table id="weekly-table" class="w-full table-auto">
                        <thead class="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                            <tr>
                                <th class="px-4 py-3 text-left">Employee</th>
                                <th class="px-2 py-3 text-center">Sat</th>
                                <th class="px-2 py-3 text-center">Sun</th>
                                <th class="px-2 py-3 text-center">Mon</th>
                                <th class="px-2 py-3 text-center">Tue</th>
                                <th class="px-2 py-3 text-center">Wed</th>
                                <th class="px-2 py-3 text-center">Thu</th>
                                <th class="px-2 py-3 text-center">Fri</th>
                                <th class="px-4 py-3 text-left">This Week Tasks</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white divide-opacity-20"></tbody>
                    </table>
                </div>
            `;
            const reportBody = document.querySelector('#weekly-table tbody');
            employees.filter(employee => employee.name !== 'Azizi').forEach((employee, index) => {
                const row = document.createElement('tr');
                row.className = 'animate-fade-in';
                row.style.animationDelay = `${index * 0.1}s`;
                row.innerHTML = `
                    <td class="px-4 py-3">
                        <div class="flex items-center">
                            <img src="${employee.photo}" class="w-10 h-10 rounded-full mr-3 border-2 border-indigo-200">
                            <div>
                                <div class="font-medium text-white">${employee.name}</div>
                                <div class="text-sm text-gray-300">${employee.email}</div>
                            </div>
                        </div>
                    </td>
                `;
                const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                days.forEach(day => {
                    const fullDay = {
                        'Sat': 'Saturday',
                        'Sun': 'Sunday',
                        'Mon': 'Monday',
                        'Tue': 'Tuesday',
                        'Wed': 'Wednesday',
                        'Thu': 'Thursday',
                        'Fri': 'Friday'
                    }[day];
                    const status = weeklyAttendance[fullDay] && weeklyAttendance[fullDay][employee.name];
                    row.innerHTML += `
                        <td class="px-2 py-3 text-center">
                            <div class="w-8 h-8 mx-auto rounded-full ${status ? getAttendanceClass(status) : 'bg-gray-300'} flex items-center justify-center">
                                ${status === 'Present' ? '<i class="fas fa-check text-white text-xs"></i>' : status === 'Absent' ? '<i class="fas fa-times text-white text-xs"></i>' : ''}
                            </div>
                        </td>
                    `;
                });
                row.innerHTML += `
                    <td class="px-4 py-3">
                        <ul class="space-y-1 max-h-24 overflow-y-auto">
                            ${employee.weekTasks.map(task => `<li class="text-sm text-gray-200">${task.text}</li>`).join('')}
                        </ul>
                    </td>
                `;
                reportBody.appendChild(row);
            });
            // Initialize DataTable for weekly report
            $('#weekly-table').DataTable({
                "paging": true,
                "searching": true,
                "ordering": true,
                "info": true,
                "autoWidth": false,
                "responsive": true
            });
        }
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Error fetching employees:', error);
        employeesDiv.innerHTML = '<p class="text-red-500">Error loading data.</p>';
        document.getElementById('loading').style.display = 'none';
    }
});

function getAttendanceClass(status) {
    switch (status) {
        case 'Present': return 'status-present';
        case 'Absent': return 'status-absent';
        case 'Late': return 'status-late';
        default: return 'status-unknown';
    }
}
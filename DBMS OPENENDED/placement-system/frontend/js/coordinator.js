// Coordinator API Functions
async function getStatistics() {
    return await apiCall('/coordinator/statistics');
}

async function getCoordinatorStudents() {
    return await apiCall('/coordinator/students');
}

async function getCoordinatorCompanies() {
    return await apiCall('/coordinator/companies');
}

async function getCoordinatorApplications() {
    return await apiCall('/coordinator/applications');
}

async function getPlacedStudents() {
    return await apiCall('/coordinator/placed-students');
}

async function getUnplacedStudents() {
    return await apiCall('/coordinator/unplaced-students');
}

async function getDepartmentStats() {
    return await apiCall('/coordinator/department-stats');
}

// Load statistics dashboard
async function loadStatistics() {
    try {
        const result = await getStatistics();
        if (result.success) {
            const stats = result.data;
            document.getElementById('totalStudents').textContent = stats.totalStudents;
            document.getElementById('totalCompanies').textContent = stats.totalCompanies;
            document.getElementById('totalApplications').textContent = stats.totalApplications;
            document.getElementById('placedStudents').textContent = stats.placedStudents;
            document.getElementById('unplacedStudents').textContent = stats.unplacedStudents;
            document.getElementById('avgPackage').textContent = stats.avgPackage.toFixed(2);
            document.getElementById('highestPackage').textContent = stats.highestPackage;
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load all students
async function loadStudents() {
    try {
        const result = await getCoordinatorStudents();
        if (result.success) {
            const tbody = document.querySelector('#studentsTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No students found</td></tr>';
                return;
            }

            result.data.forEach(student => {
                const row = document.createElement('tr');
                const placementBadge = `<span class="badge badge-${student.PlacementStatus === 'Placed' ? 'success' : 'danger'}">${student.PlacementStatus}</span>`;

                row.innerHTML = `
          <td>${student.Stud_ID}</td>
          <td>${student.Stud_Name}</td>
          <td>${student.Dept}</td>
          <td>${student.CGPA}</td>
          <td>${student.Email}</td>
          <td>${student.Phone}</td>
          <td>${student.ProfileComplete ? 'Yes' : 'No'}</td>
          <td>${placementBadge}</td>
          <td>${student.PlacementStatus === 'Placed' ? `${student.Comp_Name} (₹${student.Package} LPA)` : '-'}</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load all companies
async function loadCompanies() {
    try {
        const result = await getCoordinatorCompanies();
        if (result.success) {
            const tbody = document.querySelector('#companiesTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No companies found</td></tr>';
                return;
            }

            result.data.forEach(company => {
                const row = document.createElement('tr');

                row.innerHTML = `
          <td>${company.Comp_ID}</td>
          <td>${company.Comp_Name}</td>
          <td>${company.Role}</td>
          <td>₹${company.Package} LPA</td>
          <td>${company.Total_Applications || 0}</td>
          <td>${company.Shortlisted || 0}</td>
          <td>${company.Selected || 0}</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load all applications
async function loadApplications() {
    try {
        const result = await getCoordinatorApplications();
        if (result.success) {
            const tbody = document.querySelector('#applicationsTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No applications found</td></tr>';
                return;
            }

            result.data.forEach(app => {
                const row = document.createElement('tr');
                const statusBadge = `<span class="badge badge-${getStatusColor(app.Status)}">${app.Status}</span>`;

                row.innerHTML = `
          <td>${app.App_ID}</td>
          <td>${app.Stud_Name}</td>
          <td>${app.Dept}</td>
          <td>${app.CGPA}</td>
          <td>${app.Comp_Name}</td>
          <td>${app.Role}</td>
          <td>₹${app.Package} LPA</td>
          <td>${statusBadge}</td>
          <td>${new Date(app.Applied_At).toLocaleDateString()}</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load placed students
async function loadPlacedStudents() {
    try {
        const result = await getPlacedStudents();
        if (result.success) {
            const tbody = document.querySelector('#placedTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No placed students</td></tr>';
                return;
            }

            result.data.forEach(student => {
                const row = document.createElement('tr');

                row.innerHTML = `
          <td>${student.Stud_Name}</td>
          <td>${student.Dept}</td>
          <td>${student.CGPA}</td>
          <td>${student.Comp_Name}</td>
          <td>${student.Role}</td>
          <td>₹${student.Salary} LPA</td>
          <td>${new Date(student.Join_Date).toLocaleDateString()}</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load unplaced students
async function loadUnplacedStudents() {
    try {
        const result = await getUnplacedStudents();
        if (result.success) {
            const tbody = document.querySelector('#unplacedTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">All students are placed!</td></tr>';
                return;
            }

            result.data.forEach(student => {
                const row = document.createElement('tr');

                row.innerHTML = `
          <td>${student.Stud_Name}</td>
          <td>${student.Dept}</td>
          <td>${student.CGPA}</td>
          <td>${student.Email}</td>
          <td>${student.Phone}</td>
          <td>${student.ApplicationCount || 0}</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load department statistics
async function loadDepartmentStats() {
    try {
        const result = await getDepartmentStats();
        if (result.success) {
            const tbody = document.querySelector('#deptStatsTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No data available</td></tr>';
                return;
            }

            result.data.forEach(dept => {
                const row = document.createElement('tr');

                row.innerHTML = `
          <td><strong>${dept.Dept}</strong></td>
          <td>${dept.Total_Students}</td>
          <td>${dept.Placed_Students}</td>
          <td>${dept.Placement_Percentage}%</td>
          <td>₹${dept.Avg_Package || 0} LPA</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'Applied': return 'info';
        case 'Shortlisted': return 'warning';
        case 'Selected': return 'success';
        case 'Rejected': return 'danger';
        default: return 'info';
    }
}

// Tab switching
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'studentsTab') loadStudents();
    if (tabName === 'companiesTab') loadCompanies();
    if (tabName === 'applicationsTab') loadApplications();
    if (tabName === 'placedTab') loadPlacedStudents();
    if (tabName === 'unplacedTab') loadUnplacedStudents();
    if (tabName === 'deptStatsTab') loadDepartmentStats();
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    updateNavbar();
    loadStatistics();
    openTab('dashboardTab');
});

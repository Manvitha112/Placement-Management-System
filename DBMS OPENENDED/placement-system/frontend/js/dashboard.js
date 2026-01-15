// Comprehensive Dashboard JavaScript
// Used by student, company, and coordinator dashboards

// Show alert message
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    if (alert) {
        alert.textContent = message;
        alert.className = `alert show alert-${type === 'error' ? 'error' : type}`;
        setTimeout(() => alert.classList.remove('show'), 4000);
    }
}

// API Call Helper
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        };
        if (data) options.body = JSON.stringify(data);

        const response = await fetch(`http://localhost:5001/api${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                window.location.href = 'index.html';
            }
            throw new Error(result.message || 'API Error');
        }
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Utility Functions
function getStatusColor(status) {
    switch (status) {
        case 'Applied': return 'warning';
        case 'Shortlisted': return 'info';
        case 'Selected':
        case 'Accepted': return 'success';
        case 'Rejected': return 'danger';
        default: return 'secondary';
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatTime(timeString) {
    return timeString ? timeString.substring(0, 5) : '-';
}

// Filter companies by search
function filterCompanies() {
    const search = document.getElementById('companySearch')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.company-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(search) ? 'block' : 'none';
    });
}

// Filter students by name and department
function filterStudents() {
    const search = document.getElementById('studentSearch')?.value.toLowerCase() || '';
    const dept = document.getElementById('deptFilter')?.value || '';

    if (!window.allStudents) return;

    const filtered = window.allStudents.filter(s =>
        s.Stud_Name.toLowerCase().includes(search) &&
        (!dept || s.Dept === dept)
    );

    const rows = filtered.map(s => `
    <tr>
      <td>${s.Stud_Name}</td>
      <td>${s.Dept}</td>
      <td>${s.CGPA}</td>
      <td>${s.Email}</td>
      <td>${s.Phone}</td>
      <td><span class="badge badge-${s.PlacementStatus === 'Placed' ? 'success' : 'danger'}">${s.PlacementStatus}</span></td>
      <td>${s.Comp_Name || '-'}</td>
      <td>${s.Package || '-'}</td>
    </tr>
  `).join('');

    document.getElementById('studentsTbody').innerHTML = rows || '<tr><td colspan="8">No students found</td></tr>';
}

// Export table to CSV
function exportTableToCSV(filename = 'export.csv') {
    const table = document.querySelector('table');
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        cols.forEach(col => csvRow.push(col.textContent));
        csv.push(csvRow.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', filename);
    link.click();
}

// Switch between tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    const tab = document.getElementById(tabName);
    if (tab) tab.style.display = 'block';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Show/Hide edit form
function showEditProfile() {
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('editProfileView').style.display = 'block';
}

function cancelEdit() {
    document.getElementById('editProfileView').style.display = 'none';
    document.getElementById('profileView').style.display = 'block';
}

// Modal helpers for interview scheduling
function showScheduleInterview(appId) {
    if (document.getElementById('intAppId')) {
        document.getElementById('intAppId').value = appId;
    }
    switchTab('interviews');
}

// Button styling - add CSS classes
document.addEventListener('DOMContentLoaded', function () {
    // Add responsive classes
    const buttons = document.querySelectorAll('.btn-sm');
    buttons.forEach(btn => btn.classList.add('btn-small'));

    // Format time fields
    document.querySelectorAll('input[type="time"]').forEach(input => {
        input.addEventListener('change', function () {
            this.value = this.value.padStart(5, '0');
        });
    });
});

// Student API Functions
async function getStudentProfile() {
    return await apiCall('/student/profile');
}

async function updateStudentProfile(data) {
    return await apiCall('/student/profile', 'PUT', data);
}

async function getCompanies() {
    return await apiCall('/student/companies');
}

async function applyForJob(companyId) {
    return await apiCall('/student/apply', 'POST', { companyId });
}

async function getStudentApplications() {
    return await apiCall('/student/applications');
}

async function getStudentInterviews() {
    return await apiCall('/student/interviews');
}

async function getStudentOffers() {
    return await apiCall('/student/offers');
}

// Load profile data
async function loadProfile() {
    try {
        const result = await getStudentProfile();
        if (result.success) {
            const student = result.data;
            document.getElementById('profileName').textContent = student.Stud_Name || 'N/A';
            document.getElementById('profileEmail').textContent = student.Email || 'N/A';
            document.getElementById('profileDept').textContent = student.Dept || 'N/A';
            document.getElementById('profileCGPA').textContent = student.CGPA || 'N/A';
            document.getElementById('profilePhone').textContent = student.Phone || 'N/A';
            document.getElementById('profileAddress').textContent = student.Address || 'N/A';
            document.getElementById('profileSkills').textContent = student.Skills || 'N/A';

            document.getElementById('editCGPA').value = student.CGPA || '';
            document.getElementById('editSemester').value = student.Semester || '';
            document.getElementById('edit10th').value = student.Marks_10th || '';
            document.getElementById('edit12th').value = student.Marks_12th || '';
            document.getElementById('editBacklogs').value = student.Backlogs || '';
            document.getElementById('editPhone').value = student.Phone || '';
            document.getElementById('editAddress').value = student.Address || '';
            document.getElementById('editSkills').value = student.Skills || '';
            document.getElementById('editLinkedIn').value = student.LinkedIn || '';
            document.getElementById('editGitHub').value = student.GitHub || '';
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Update profile
async function saveProfile(event) {
    event.preventDefault();

    const data = {
        CGPA: parseFloat(document.getElementById('editCGPA').value),
        Semester: parseInt(document.getElementById('editSemester').value),
        Marks_10th: parseFloat(document.getElementById('edit10th').value),
        Marks_12th: parseFloat(document.getElementById('edit12th').value),
        Backlogs: parseInt(document.getElementById('editBacklogs').value),
        Phone: document.getElementById('editPhone').value,
        Address: document.getElementById('editAddress').value,
        Skills: document.getElementById('editSkills').value,
        LinkedIn: document.getElementById('editLinkedIn').value,
        GitHub: document.getElementById('editGitHub').value
    };

    try {
        const result = await updateStudentProfile(data);
        if (result.success) {
            showAlert('Profile updated successfully!', 'success');
            loadProfile();
            closeTab('editProfileTab');
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load companies
async function loadCompanies() {
    try {
        const result = await getCompanies();
        if (result.success) {
            const companiesDiv = document.getElementById('companiesList');
            companiesDiv.innerHTML = '';

            if (result.data.length === 0) {
                companiesDiv.innerHTML = '<p class="text-center text-muted">No companies available</p>';
                return;
            }

            result.data.forEach(company => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
          <h3>${company.Comp_Name}</h3>
          <p><strong>Role:</strong> ${company.Role}</p>
          <p><strong>Package:</strong> ₹${company.Package} LPA</p>
          <p><strong>Required CGPA:</strong> ${company.Required_CGPA}</p>
          <p><strong>Location:</strong> ${company.Job_Location || 'N/A'}</p>
          <p class="text-muted">${company.Job_Description || 'No description provided'}</p>
          <button class="btn btn-primary" onclick="applyCompany(${company.Comp_ID})">Apply Now</button>
        `;
                companiesDiv.appendChild(card);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Apply for job
async function applyCompany(companyId) {
    try {
        const result = await applyForJob(companyId);
        if (result.success) {
            showAlert(result.message, 'success');
            loadApplications();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load applications
async function loadApplications() {
    try {
        const result = await getStudentApplications();
        if (result.success) {
            const tbody = document.querySelector('#applicationsTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No applications yet</td></tr>';
                return;
            }

            result.data.forEach(app => {
                const row = document.createElement('tr');
                const statusBadge = `<span class="badge badge-${getStatusColor(app.Status)}">${app.Status}</span>`;

                row.innerHTML = `
          <td>${app.Comp_Name}</td>
          <td>${app.Role}</td>
          <td>₹${app.Package} LPA</td>
          <td>${app.Job_Location}</td>
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

// Load interviews
async function loadInterviews() {
    try {
        const result = await getStudentInterviews();
        if (result.success) {
            const tbody = document.querySelector('#interviewsTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No interviews scheduled</td></tr>';
                return;
            }

            result.data.forEach(interview => {
                const row = document.createElement('tr');
                const resultBadge = interview.Result ? `<span class="badge badge-${getResultColor(interview.Result)}">${interview.Result}</span>` : 'Pending';

                row.innerHTML = `
          <td>${interview.Comp_Name}</td>
          <td>${new Date(interview.Int_Date).toLocaleDateString()}</td>
          <td>${interview.Int_Time}</td>
          <td>Round ${interview.Round_No}</td>
          <td>${interview.Int_Mode}</td>
          <td>${interview.Int_Type}</td>
          <td>${interview.Venue || interview.Meeting_Link || 'N/A'}</td>
          <td>${resultBadge}</td>
          <td>${interview.Remarks || '-'}</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load offers
async function loadOffers() {
    try {
        const result = await getStudentOffers();
        if (result.success) {
            const tbody = document.querySelector('#offersTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No offers received</td></tr>';
                return;
            }

            result.data.forEach(offer => {
                const row = document.createElement('tr');
                const statusBadge = `<span class="badge badge-${getStatusColor(offer.Acceptance_Status)}">${offer.Acceptance_Status}</span>`;

                row.innerHTML = `
          <td>${offer.Comp_Name}</td>
          <td>${offer.Role}</td>
          <td>₹${offer.Salary} LPA</td>
          <td>${new Date(offer.Join_Date).toLocaleDateString()}</td>
          <td>${offer.Bond_Duration} months</td>
          <td>${statusBadge}</td>
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
        case 'Selected': case 'Accepted': return 'success';
        case 'Rejected': return 'danger';
        case 'Pending': return 'info';
        default: return 'info';
    }
}

function getResultColor(result) {
    switch (result) {
        case 'Pass': return 'success';
        case 'Fail': return 'danger';
        case 'Pending': return 'warning';
        default: return 'info';
    }
}

// Tab switching
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'companiesTab') loadCompanies();
    if (tabName === 'applicationsTab') loadApplications();
    if (tabName === 'interviewsTab') loadInterviews();
    if (tabName === 'offersTab') loadOffers();
}

function closeTab(tabName) {
    document.getElementById(tabName).style.display = 'none';
    document.getElementById('profileTab').style.display = 'block';
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    redirectIfNotAuthenticated();
    updateNavbar();
    loadProfile();
    openTab('profileTab');
});

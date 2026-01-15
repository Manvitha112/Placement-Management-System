// Company API Functions
async function getCompanyProfile() {
    return await apiCall('/company/profile');
}

async function updateCompanyProfile(data) {
    return await apiCall('/company/profile', 'PUT', data);
}

async function getCompanyApplications() {
    return await apiCall('/company/applications');
}

async function updateApplicationStatus(appId, status) {
    return await apiCall(`/company/application/${appId}/status`, 'PUT', { status });
}

async function createInterview(data) {
    return await apiCall('/company/interview', 'POST', data);
}

async function getCompanyInterviews() {
    return await apiCall('/company/interviews');
}

async function updateInterviewResult(interviewId, result, remarks) {
    return await apiCall(`/company/interview/${interviewId}/result`, 'PUT', { result, remarks });
}

async function createOffer(data) {
    return await apiCall('/company/offer', 'POST', data);
}

async function getCompanyOffers() {
    return await apiCall('/company/offers');
}

// Load profile data
async function loadProfile() {
    try {
        const result = await getCompanyProfile();
        if (result.success) {
            const company = result.data;
            document.getElementById('profileName').textContent = company.Comp_Name || 'N/A';
            document.getElementById('profileEmail').textContent = company.Email || 'N/A';
            document.getElementById('profileIndustry').textContent = company.Industry || 'N/A';
            document.getElementById('profileRole').textContent = company.Role || 'N/A';
            document.getElementById('profilePackage').textContent = company.Package || 'N/A';
            document.getElementById('profileLocation').textContent = company.Job_Location || 'N/A';

            document.getElementById('editCompName').value = company.Comp_Name || '';
            document.getElementById('editIndustry').value = company.Industry || '';
            document.getElementById('editRole').value = company.Role || '';
            document.getElementById('editPackage').value = company.Package || '';
            document.getElementById('editCGPA').value = company.Required_CGPA || '';
            document.getElementById('editLocation').value = company.Job_Location || '';
            document.getElementById('editDescription').value = company.Job_Description || '';
            document.getElementById('editSkills').value = company.Required_Skills || '';
            document.getElementById('editPositions').value = company.Positions || '';
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Save profile
async function saveProfile(event) {
    event.preventDefault();

    const data = {
        Comp_Name: document.getElementById('editCompName').value,
        Industry: document.getElementById('editIndustry').value,
        Role: document.getElementById('editRole').value,
        Package: parseFloat(document.getElementById('editPackage').value),
        Required_CGPA: parseFloat(document.getElementById('editCGPA').value),
        Job_Location: document.getElementById('editLocation').value,
        Job_Description: document.getElementById('editDescription').value,
        Required_Skills: document.getElementById('editSkills').value,
        Positions: parseInt(document.getElementById('editPositions').value),
        Last_Date: document.getElementById('editLastDate').value
    };

    try {
        const result = await updateCompanyProfile(data);
        if (result.success) {
            showAlert('Profile updated successfully!', 'success');
            loadProfile();
            closeTab('editProfileTab');
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load applications
async function loadApplications() {
    try {
        const result = await getCompanyApplications();
        if (result.success) {
            const tbody = document.querySelector('#applicationsTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted">No applications received</td></tr>';
                return;
            }

            result.data.forEach(app => {
                const row = document.createElement('tr');
                const statusBadge = `<span class="badge badge-${getStatusColor(app.Status)}">${app.Status}</span>`;

                row.innerHTML = `
          <td>${app.Stud_Name}</td>
          <td>${app.Dept}</td>
          <td>${app.CGPA}</td>
          <td>${app.Email}</td>
          <td>${app.Phone}</td>
          <td>${app.Skills}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-success btn-small" onclick="shortlistStudent(${app.App_ID})">Shortlist</button>
              <button class="btn btn-danger btn-small" onclick="rejectStudent(${app.App_ID})">Reject</button>
            </div>
          </td>
          <td>${new Date(app.Applied_At).toLocaleDateString()}</td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Shortlist student
async function shortlistStudent(appId) {
    try {
        const result = await updateApplicationStatus(appId, 'Shortlisted');
        if (result.success) {
            showAlert('Student shortlisted!', 'success');
            loadApplications();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Reject student
async function rejectStudent(appId) {
    try {
        const result = await updateApplicationStatus(appId, 'Rejected');
        if (result.success) {
            showAlert('Student rejected!', 'success');
            loadApplications();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Schedule interview form
async function scheduleInterview(event) {
    event.preventDefault();

    const data = {
        appId: parseInt(document.getElementById('intAppId').value),
        intDate: document.getElementById('intDate').value,
        intTime: document.getElementById('intTime').value,
        roundNo: parseInt(document.getElementById('intRound').value),
        intMode: document.getElementById('intMode').value,
        intType: document.getElementById('intType').value,
        venue: document.getElementById('intVenue').value || null,
        meetingLink: document.getElementById('intLink').value || null,
        remarks: document.getElementById('intRemarks').value || null
    };

    try {
        const result = await createInterview(data);
        if (result.success) {
            showAlert('Interview scheduled!', 'success');
            document.getElementById('interviewForm').reset();
            closeTab('scheduleInterviewTab');
            loadInterviews();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load interviews
async function loadInterviews() {
    try {
        const result = await getCompanyInterviews();
        if (result.success) {
            const tbody = document.querySelector('#interviewsTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No interviews scheduled</td></tr>';
                return;
            }

            result.data.forEach(interview => {
                const row = document.createElement('tr');
                const resultBadge = interview.Result ? `<span class="badge badge-${getResultColor(interview.Result)}">${interview.Result}</span>` : 'Pending';

                row.innerHTML = `
          <td>${interview.Stud_Name}</td>
          <td>${interview.Email}</td>
          <td>${new Date(interview.Int_Date).toLocaleDateString()}</td>
          <td>${interview.Int_Time}</td>
          <td>Round ${interview.Round_No}</td>
          <td>${interview.Int_Mode}</td>
          <td>${interview.Int_Type}</td>
          <td>${resultBadge}</td>
          <td>
            <button class="btn btn-primary btn-small" onclick="updateResult(${interview.Int_ID})">Update Result</button>
          </td>
        `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Update interview result
function updateResult(interviewId) {
    const result = prompt('Enter result (Pass/Fail):');
    if (!result) return;

    if (!['Pass', 'Fail'].includes(result)) {
        showAlert('Invalid result. Enter Pass or Fail', 'error');
        return;
    }

    const remarks = prompt('Enter remarks (optional):');

    updateInterviewResultHandler(interviewId, result, remarks || '');
}

async function updateInterviewResultHandler(interviewId, result, remarks) {
    try {
        const res = await updateInterviewResult(interviewId, result, remarks);
        if (res.success) {
            showAlert('Interview result updated!', 'success');
            loadInterviews();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Send offer form
async function sendOffer(event) {
    event.preventDefault();

    const data = {
        studId: parseInt(document.getElementById('offerStudId').value),
        salary: parseFloat(document.getElementById('offerSalary').value),
        joinDate: document.getElementById('offerJoinDate').value,
        bondDuration: parseInt(document.getElementById('offerBond').value)
    };

    try {
        const result = await createOffer(data);
        if (result.success) {
            showAlert('Offer sent!', 'success');
            document.getElementById('offerForm').reset();
            closeTab('sendOfferTab');
            loadOffers();
        }
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load offers
async function loadOffers() {
    try {
        const result = await getCompanyOffers();
        if (result.success) {
            const tbody = document.querySelector('#offersTable tbody');
            tbody.innerHTML = '';

            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No offers sent</td></tr>';
                return;
            }

            result.data.forEach(offer => {
                const row = document.createElement('tr');
                const statusBadge = `<span class="badge badge-${getStatusColor(offer.Acceptance_Status)}">${offer.Acceptance_Status}</span>`;

                row.innerHTML = `
          <td>${offer.Stud_Name}</td>
          <td>${offer.Dept}</td>
          <td>${offer.CGPA}</td>
          <td>₹${offer.Salary} LPA</td>
          <td>${new Date(offer.Join_Date).toLocaleDateString()}</td>
          <td>${statusBadge}</td>
          <td>${new Date(offer.Offered_At).toLocaleDateString()}</td>
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
        case 'Rejected': case 'Pending': return 'danger';
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

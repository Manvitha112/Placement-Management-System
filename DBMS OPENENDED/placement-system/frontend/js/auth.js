// API Base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Token Management
function setToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
}

function setUserRole(role) {
    localStorage.setItem('userRole', role);
}

function getUserRole() {
    return localStorage.getItem('userRole');
}

function setUserId(id) {
    localStorage.setItem('userId', id);
}

function getUserId() {
    return localStorage.getItem('userId');
}

function setUserName(name) {
    localStorage.setItem('userName', name);
}

function getUserName() {
    return localStorage.getItem('userName');
}

// API Helper Functions
function getHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: getHeaders()
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
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

// Authentication Functions
async function login(email, password) {
    const result = await apiCall('/auth/login', 'POST', { email, password });

    if (result.success) {
        setToken(result.data.token);
        setUserRole(result.data.role);
        setUserId(result.data.id);
        setUserName(result.data.name);
        return result.data;
    }

    throw new Error(result.message);
}

async function registerStudent(email, password, name, dept, usn) {
    const result = await apiCall('/auth/register/student', 'POST', {
        email,
        password,
        name,
        dept,
        usn
    });

    if (result.success) {
        return result.data;
    }

    throw new Error(result.message);
}

async function registerCompany(email, password, compName, role, packageLPA) {
    const result = await apiCall('/auth/register/company', 'POST', {
        email,
        password,
        compName,
        role,
        packageLPA
    });

    if (result.success) {
        return result.data;
    }

    throw new Error(result.message);
}

function logout() {
    removeToken();
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
}

// Theme & Language Management
const translations = {
    en: {
        title: "College Placement Management System",
        hero: "Unified Recruitment Platform for Students, Companies, and Administration",
        dept: "DEPARTMENT OF ISE",
        college: "SIT TUMKURU",
        studentPortal: "Student Portal",
        companyPortal: "Company Portal",
        adminPortal: "Administration",
        // Sidebar Common
        logout: "SIGN OUT",
        // Student Sidebar
        s_profile: "MY PROFILE",
        s_drives: "RECRUITMENT DRIVES",
        s_apps: "APPLICATIONS",
        s_interviews: "INTERVIEWS",
        s_offers: "JOB OFFERS",
        // Company Sidebar
        c_profile: "COMPANY PROFILE",
        c_talent: "TALENT ACQUISITION",
        c_pool: "EVALUATION POOL",
        c_interviews: "INTERVIEW SCHEDULE",
        c_offers: "OFFER ISSUANCE",
        c_hired: "ONBOARDED TALENT",
        // Coordinator Sidebar
        co_overview: "OVERVIEW",
        co_students: "STUDENT DIRECTORY",
        co_placed: "PLACED RECORDS",
        co_pending: "PENDING PLACEMENTS",
        co_partners: "CORPORATE PARTNERS",
        // Dashboard Titles
        s_ws_title: "Candidate Workspace",
        s_ws_desc: "Manage your academic profile and professional recruitment cycle",
        c_ws_title: "Recruitment Workspace",
        c_ws_desc: "Enterprise interface for campus talent acquisition management",
        co_ws_title: "Executive Analytics",
        co_ws_desc: "Intelligence dashboard for institutional placement monitoring",
        // Tab Titles
        st_profile: "Academic & Personal Profile",
        st_companies: "Recruitment Opportunities",
        st_applications: "Application Tracking",
        st_interviews: "Interview Schedule",
        st_offers: "Job Appointments",
        ct_profile: "Organization Profile",
        ct_applications: "Talent Acquisition",
        ct_shortlisted: "Evaluation Pool",
        ct_interviews: "Interview Schedule",
        ct_offers: "Offer Issuance",
        ct_hired: "Onboarded Talent",
        cot_statistics: "Executive Analytics",
        cot_students: "Student Information System",
        cot_placed: "Success Records",
        cot_unplaced: "Eligible Candidates Pending",
        cot_companies: "Recruitment Partners",
        // Landing Page Elements
        st_portal_desc: "Access your personalized career dashboard, manage academic history, and track real-time application status.",
        c_portal_desc: "Engage with top-tier talent, manage recruitment workflows, and streamline the shortlisting process.",
        ad_portal_desc: "Centralized oversight for HODs and TPO coordinators to monitor placement velocity and analytics.",
        login_btn: "LOGIN",
        register_btn: "REGISTER",
        partner_btn: "PARTNER",
        staff_login_btn: "STAFF LOGIN",
        uni_email: "UNIVERSITY EMAIL",
        corp_email: "CORPORATE EMAIL",
        password: "PASSWORD",
        authenticate: "AUTHENTICATE",
        create_account: "CREATE ACCOUNT",
        // Register Form Labels
        usn_label: "USN (UNIVERSITY SERIAL NO.)",
        full_name: "FULL NAME",
        dept_label: "DEPARTMENT",
        select_dept: "Select Department",
        comp_name_label: "COMPANY NAME",
        job_role_label: "JOB ROLE",
        package_label: "PACKAGE (LPA)",
        // Student Profile Labels
        st_acad_verif: "Academic Verification Profile",
        update_records: "UPDATE RECORDS",
        curr_cgpa: "CURRENT CGPA",
        acad_hist: "Academic History",
        marks_10th: "10TH SCORE (%)",
        marks_12th: "12TH SCORE (%)",
        diploma_marks: "DIPLOMA (%)",
        backlogs: "ACTIVE BACKLOGS",
        prof_port: "Professional Portfolio",
        linkedin: "LINKEDIN",
        github: "GITHUB",
        resume: "RESUME DOCUMENT",
        st_offers_title: "Job Offers & Appointments",
        // Company Profile Labels
        ct_org_profile: "Corporate Organization Profile",
        update_profile: "UPDATE PROFILE",
        organization: "ORGANIZATION",
        industry: "INDUSTRY",
        offered_ctc: "OFFERED CTC",
        min_cgpa: "MIN. CGPA",
        job_desc: "Job Description",
        ct_apps_title: "Candidate Applications",
        cand_name: "CANDIDATE NAME",
        applied_on: "APPLIED ON",
        decision: "DECISION",
        status: "STATUS",
        ct_shortlisted_title: "Shortlisted Candidates",
        // Coordinator Stats
        co_total_enroll: "TOTAL ENROLLMENT",
        co_placed_students: "PLACED STUDENTS",
        co_avg_ctc: "AVG CTC (LPA)",
        co_dept_perf: "Department Performance Index",
        co_success_rate: "SUCCESS RATE",
        co_avg_salary: "AVG SALARY",
        co_sis: "Student Information System",
        co_success_records: "Success Records",
        co_eligible_pending: "Eligible Candidates Pending",
        co_rec_partners: "Recruitment Partners"
    },
    kn: {
        title: "ಕಾಲೇಜು ಉದ್ಯೋಗ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ",
        hero: "ವಿದ್ಯಾರ್ಥಿಗಳು, ಕಂಪನಿಗಳು ಮತ್ತು ಆಡಳಿತಕ್ಕಾಗಿ ಏಕೀಕೃತ ನೇಮಕಾತಿ ವೇದಿಕೆ",
        dept: "ಐಎಸ್ಇ ವಿಭಾಗ",
        college: "ಎಸ್ಐಟಿ ತುಮಕೂರು",
        studentPortal: "ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್",
        companyPortal: "ಕಂಪನಿ ಪೋರ್ಟಲ್",
        adminPortal: "ಆಡಳಿತ",
        // Sidebar Common
        logout: "ನಿರ್ಗಮಿಸಿ",
        // Student Sidebar
        s_profile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
        s_drives: "ನೇಮಕಾತಿ ಡ್ರೈವ್‌ಗಳು",
        s_apps: "ಅರ್ಜಿಗಳು",
        s_interviews: "ಸಂದರ್ಶನಗಳು",
        s_offers: "ಉದ್ಯೋಗ ಕೊಡುಗೆಗಳು",
        // Company Sidebar
        c_profile: "ಕಂಪನಿ ಪ್ರೊಫೈಲ್",
        c_talent: "ಪ್ರತಿಭೆ ಸ್ವಾಧೀನ",
        c_pool: "ಮೌಲ್ಯಮಾಪನ ಪೂಲ್",
        c_interviews: "ಸಂದರ್ಶನ ವೇಳಾಪಟ್ಟಿ",
        c_offers: "ಕೊಡುಗೆ ವಿತರಣೆ",
        c_hired: "ನೇಮಕಗೊಂಡ ಪ್ರತಿಭೆ",
        // Coordinator Sidebar
        co_overview: "ಅವಲೋಕನ",
        co_students: "ವಿದ್ಯಾರ್ಥಿ ಡೈರೆಕ್ಟರಿ",
        co_placed: "ಉದ್ಯೋಗ ದಾಖಲೆಗಳು",
        co_pending: "ಬಾಕಿ ಇರುವ ಉದ್ಯೋಗಗಳು",
        co_partners: "ಕಾರ್ಪೊರೇಟ್ ಪಾಲುದಾರರು",
        // Dashboard Titles
        s_ws_title: "ವಿದ್ಯಾರ್ಥಿ ಕಾರ್ಯಕ್ಷೇತ್ರ",
        s_ws_desc: "ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಪ್ರೊಫೈಲ್ ಮತ್ತು ವೃತ್ತಿಪರ ನೇಮಕಾತಿ ಚಕ್ರವನ್ನು ನಿರ್ವಹಿಸಿ",
        c_ws_title: "ನೇಮಕಾತಿ ಕಾರ್ಯಕ್ಷೇತ್ರ",
        c_ws_desc: "ಕ್ಯಾಂಪಸ್ ಪ್ರತಿಭೆ ಸ್ವಾಧೀನ ನಿರ್ವಹಣೆಗಾಗಿ ಎಂಟರ್ಪ್ರೈಸ್ ಇಂಟರ್ಫೇಸ್",
        co_ws_title: "ಕಾರ್ಯನಿರ್ವಾಹಕ ಅನಾಲಿಟಿಕ್ಸ್",
        co_ws_desc: "ಸಾಂಸ್ಥಿಕ ನಿಯೋಜನೆ ಮೇಲ್ವಿಚಾರಣೆಗಾಗಿ ಇಂಟೆಲಿಜೆನ್ಸ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        // Tab Titles
        st_profile: "ಶೈಕ್ಷಣಿಕ ಮತ್ತು ವೈಯಕ್ತಿಕ ಪ್ರೊಫೈಲ್",
        st_companies: "ನೇಮಕಾತಿ ಅವಕಾಶಗಳು",
        st_applications: "ಅರ್ಜಿ ಟ್ರ್ಯಾಕಿಂಗ್",
        st_interviews: "ಸಂದರ್ಶನ ವೇಳಾಪಟ್ಟಿ",
        st_offers: "ಉದ್ಯೋಗ ನೇಮಕಾತಿಗಳು",
        ct_profile: "ಸಂಸ್ಥೆಯ ಪ್ರೊಫೈಲ್",
        ct_applications: "ಪ್ರತಿಭೆ ಸ್ವಾಧೀನ",
        ct_shortlisted: "ಮೌಲ್ಯಮಾಪನ ಪೂಲ್",
        ct_interviews: "ಸಂದರ್ಶನ ವೇಳಾಪಟ್ಟಿ",
        ct_offers: "ಕೊಡುಗೆ ವಿತರಣೆ",
        ct_hired: "ನೇಮಕಗೊಂಡ ಪ್ರತಿಭೆ",
        cot_statistics: "ಕಾರ್ಯನಿರ್ವಾಹಕ ಅನಾಲಿಟಿಕ್ಸ್",
        cot_students: "ವಿದ್ಯಾರ್ಥಿ ಮಾಹಿತಿ ವ್ಯವಸ್ಥೆ",
        cot_placed: "ಯಶಸ್ಸಿನ ದಾಖಲೆಗಳು",
        cot_unplaced: "ಬಾಕಿ ಇರುವ ಅಭ್ಯರ್ಥಿಗಳು",
        cot_companies: "ನೇಮಕಾತಿ ಪಾಲುದಾರರು",
        // Landing Page Elements
        st_portal_desc: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ವೃತ್ತಿಜೀವನದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಿ, ಶೈಕ್ಷಣಿಕ ಇತಿಹಾಸವನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ನೈಜ-ಸಮಯದ ಅರ್ಜಿ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
        c_portal_desc: "ಉನ್ನತ ಮಟ್ಟದ ಪ್ರತಿಭೆಗಳೊಂದಿಗೆ ತೊಡಗಿಸಿಕೊಳ್ಳಿ, ನೇಮಕಾತಿ ಕೆಲಸದ ಹರಿವನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಶಾರ್ಟ್‌ಲಿಸ್ಟ್ ಮಾಡುವ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಸುಗಮಗೊಳಿಸಿ.",
        ad_portal_desc: "ನೇಮಕಾತಿ ವೇಗ ಮತ್ತು ಅನಾಲಿಟಿಕ್ಸ್ ಅನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲು HODಗಳು ಮತ್ತು TPO ಸಂಯೋಜಕರಿಗೆ ಕೇಂದ್ರೀಕೃತ ಮೇಲ್ವಿಚಾರಣೆ.",
        login_btn: "ಲಾಗಿನ್",
        register_btn: "ನೋಂದಾಯಿಸಿ",
        partner_btn: "ಪಾಲುದಾರ",
        staff_login_btn: "ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್",
        uni_email: "ವಿಶ್ವವಿದ್ಯಾಲಯ ಇಮೇಲ್",
        corp_email: "ಕಾರ್ಪೊರೇಟ್ ಇಮೇಲ್",
        password: "ಪಾಸ್‌ವರ್ಡ್",
        authenticate: "ದೃಢೀಕರಿಸಿ",
        create_account: "ಖಾತೆ ರಚಿಸಿ",
        // Register Form Labels
        usn_label: "ಯುಎಸ್‌ಎನ್ (ವಿಶ್ವವಿದ್ಯಾಲಯ ಸರಣಿ ಸಂಖ್ಯೆ)",
        full_name: "ಪೂರ್ಣ ಹೆಸರು",
        dept_label: "ವಿಭಾಗ",
        select_dept: "ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        comp_name_label: "ಕಂಪನಿ ಹೆಸರು",
        job_role_label: "ಉದ್ಯೋಗ ಪಾತ್ರ",
        package_label: "ಪ್ಯಾಕೇಜ್ (LPA)",
        // Student Profile Labels
        st_acad_verif: "ಶೈಕ್ಷಣಿಕ ಪರಿಶೀಲನೆ ಪ್ರೊಫೈಲ್",
        update_records: "ದಾಖಲೆಗಳನ್ನು ನವೀಕರಿಸಿ",
        curr_cgpa: "ಪ್ರಸ್ತುತ ಸಿಜಿಪಿಎ",
        acad_hist: "ಶೈಕ್ಷಣಿಕ ಇತಿಹಾಸ",
        marks_10th: "10ನೇ ತರಗತಿ ಅಂಕ (%)",
        marks_12th: "12ನೇ ತರಗತಿ ಅಂಕ (%)",
        diploma_marks: "ಡಿಪ್ಲೊಮಾ (%)",
        backlogs: "ಸಕ್ರಿಯ ಬ್ಯಾಕ್‌ಲಾಗ್‌ಗಳು",
        prof_port: "ವೃತ್ತಿಪರ ಪೋರ್ಟ್ಫೋಲಿಯೋ",
        linkedin: "ಲಿಂಕ್ಡ್ಇನ್",
        github: "ಗಿಟ್‌ಹಬ್",
        resume: "ರೆಸ್ಯೂಮೆ ದಾಖಲೆ",
        st_offers_title: "ಉದ್ಯೋಗ ಕೊಡುಗೆಗಳು ಮತ್ತು ನೇಮಕಾತಿಗಳು",
        // Company Profile Labels
        ct_org_profile: "ಕಾರ್ಪೊರೇಟ್ ಸಂಸ್ಥೆಯ ಪ್ರೊಫೈಲ್",
        update_profile: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
        organization: "ಸಂಸ್ಥೆ",
        industry: "ಉದ್ಯಮ",
        offered_ctc: "ನೀಡಲಾಗುವ ಸಿಟಿಸಿ",
        min_cgpa: "ಕನಿಷ್ಠ ಸಿಜಿಪಿಎ",
        job_desc: "ಉದ್ಯೋಗ ವಿವರಣೆ",
        ct_apps_title: "ಅಭ್ಯರ್ಥಿಗಳ ಅರ್ಜಿಗಳು",
        cand_name: "ಅಭ್ಯರ್ಥಿಯ ಹೆಸರು",
        applied_on: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ",
        decision: "ನಿರ್ಧಾರ",
        status: "ಸ್ಥಿತಿ",
        ct_shortlisted_title: "ಶಾರ್ಟ್‌ಲಿಸ್ಟ್ ಮಾಡಿದ ಅಭ್ಯರ್ಥಿಗಳು",
        // Coordinator Stats
        co_total_enroll: "ಒಟ್ಟು ದಾಖಲಾತಿ",
        co_placed_students: "ಉದ್ಯೋಗ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳು",
        co_avg_ctc: "ಸರಾಸರಿ ಸಿಟಿಸಿ (LPA)",
        co_dept_perf: "ವಿಭಾಗದ ಸಾಧನೆ ಸೂಚ್ಯಂಕ",
        co_success_rate: "ಯಶಸ್ಸಿನ ಪ್ರಮಾಣ",
        co_avg_salary: "ಸರಾಸರಿ ಸಂಬಳ",
        co_sis: "ವಿದ್ಯಾರ್ಥಿ ಮಾಹಿತಿ ವ್ಯವಸ್ಥೆ",
        co_success_records: "ಯಶಸ್ಸಿನ ದಾಖಲೆಗಳು",
        co_eligible_pending: "ಬಾಕಿ ಇರುವ ಅರ್ಹ ಅಭ್ಯರ್ಥಿಗಳು",
        co_rec_partners: "ನೇಮಕಾತಿ ಪಾಲುದಾರರು"
    },
    hi: {
        title: "कॉलेज प्लेसमेंट प्रबंधन प्रणाली",
        hero: "छात्रों, कंपनियों और प्रशासन के लिए एकीकृत भर्ती मंच",
        dept: "आईएसई विभाग",
        college: "एसआईटी तुमकुरु",
        studentPortal: "छात्र पोर्टल",
        companyPortal: "कंपनी पोर्टल",
        adminPortal: "प्रशासन",
        // Sidebar Common
        logout: "साइन आउट",
        // Student Sidebar
        s_profile: "मेरी प्रोफाइल",
        s_drives: "भर्ती अभियान",
        s_apps: "आवेदन",
        s_interviews: "साक्षात्कार",
        s_offers: "नौकरी के प्रस्ताव",
        // Company Sidebar
        c_profile: "कंपनी प्रोफाइल",
        c_talent: "प्रतिभा अधिग्रहण",
        c_pool: "मूल्यांकन पूल",
        c_interviews: "साक्षात्कार अनुसूची",
        c_offers: "प्रस्ताव जारी करना",
        c_hired: "ऑनबोर्ड प्रतिभा",
        // Coordinator Sidebar
        co_overview: "अवलोकन",
        co_students: "छात्र निर्देशिका",
        co_placed: "प्लेस्ड रिकॉर्ड",
        co_pending: "लंबित प्लेसमेंट",
        co_partners: "कॉर्पोरेट भागीदार",
        // Dashboard Titles
        s_ws_title: "छात्र कार्यक्षेत्र",
        s_ws_desc: "अपनी शैक्षणिक प्रोफ़ाइल और पेशेवर भर्ती चक्र का प्रबंधन करें",
        c_ws_title: "भर्ती कार्यक्षेत्र",
        c_ws_desc: "परिसर प्रतिभा अधिग्रहण प्रबंधन के लिए एंटरप्राइज इंटरफ़ेस",
        co_ws_title: "कार्यकारी विश्लेषण",
        co_ws_desc: "संस्थागत प्लेसमेंट निगरानी के लिए इंटेलिजेंस डैशबोर्ड",
        // Tab Titles
        st_profile: "अकादमिक और व्यक्तिगत प्रोफाइल",
        st_companies: "भर्ती के अवसर",
        st_applications: "आवेदन ट्रैकिंग",
        st_interviews: "साक्षात्कार अनुसूची",
        st_offers: "नौकरी नियुक्तियां",
        ct_profile: "संगठन प्रोफाइल",
        ct_applications: "प्रतिभा अधिग्रहण",
        ct_shortlisted: "मूल्यांकन पूल",
        ct_interviews: "साक्षात्कार अनुसूची",
        ct_offers: "प्रस्ताव जारी करना",
        ct_hired: "ऑनबोर्ड प्रतिभा",
        cot_statistics: "कार्यकारी विश्लेषण",
        cot_students: "छात्र सूचना प्रणाली",
        cot_placed: "सफलता रिकॉर्ड",
        cot_unplaced: "लंबित उम्मीदवार",
        cot_companies: "भर्ती भागीदार",
        // Landing Page Elements
        st_portal_desc: "अपने व्यक्तिगत करियर डैशबोर्ड तक पहुंचें, शैक्षणिक इतिहास प्रबंधित करें और रीयल-टाइम एप्लिकेशन स्थिति ट्रैक करें।",
        c_portal_desc: "शीर्ष स्तरीय प्रतिभा के साथ जुड़ें, भर्ती वर्कफ़्लो प्रबंधित करें और शॉर्टलिस्टिंग प्रक्रिया को सुव्यवस्थित करें।",
        ad_portal_desc: "प्लेसमेंट वेग और विश्लेषण की निगरानी के लिए एचओडी और टीपीओ समन्वयकों के लिए केंद्रीकृत निरीक्षण।",
        login_btn: "लॉगिन",
        register_btn: "पंजीकरण",
        partner_btn: "भागीदार",
        staff_login_btn: "स्टाफ लॉगिन",
        uni_email: "विश्वविद्यालय ईमेल",
        corp_email: "कॉर्पोरेट ईमेल",
        password: "पासवर्ड",
        authenticate: "प्रमाणित करें",
        create_account: "खाता बनाएं",
        // Register Form Labels
        usn_label: "यूएसएन (विश्वविद्यालय क्रमांक)",
        full_name: "पूरा नाम",
        dept_label: "विभाग",
        select_dept: "विभाग चुनें",
        comp_name_label: "कंपनी का नाम",
        job_role_label: "कार्य भूमिका",
        package_label: "पैकेज (LPA)",
        // Student Profile Labels
        st_acad_verif: "शैक्षणिक सत्यापन प्रोफ़ाइल",
        update_records: "रिकॉर्ड अपडेट करें",
        curr_cgpa: "वर्तमान सीजीपीए",
        acad_hist: "शैक्षणिक इतिहास",
        marks_10th: "10वीं के अंक (%)",
        marks_12th: "12वीं के अंक (%)",
        diploma_marks: "डिप्लोमा (%)",
        backlogs: "सक्रिय बैकलॉग",
        prof_port: "पेशेवर पोर्टफोलियो",
        linkedin: "लिंक्डइन",
        github: "गिटहब",
        resume: "बायोडाटा दस्तावेज़",
        st_offers_title: "नौकरी के प्रस्ताव और नियुक्तियां",
        // Company Profile Labels
        ct_org_profile: "कॉर्पोरेट संगठन प्रोफ़ाइल",
        update_profile: "प्रोफ़ाइल अपडेट करें",
        organization: "संगठन",
        industry: "उद्योग",
        offered_ctc: "प्रस्तावित सीटीसी",
        min_cgpa: "न्यूनतम सीजीपीए",
        job_desc: "कार्य विवरण",
        ct_apps_title: "उम्मीदवार आवेदन",
        cand_name: "उम्मीदवार का नाम",
        applied_on: "आवेदन तिथि",
        decision: "निर्णय",
        status: "स्थिति",
        ct_shortlisted_title: "शॉर्टलिस्ट किए गए उम्मीदवार",
        // Coordinator Stats
        co_total_enroll: "कुल नामांकन",
        co_placed_students: "नियुक्त छात्र",
        co_avg_ctc: "औसत सीटीसी (LPA)",
        co_dept_perf: "विभाग प्रदर्शन सूचकांक",
        co_success_rate: "सफलता दर",
        co_avg_salary: "औसत वेतन",
        co_sis: "छात्र सूचना प्रणाली",
        co_success_records: "सफलता रिकॉर्ड",
        co_eligible_pending: "पात्र लंबित उम्मीदवार",
        co_rec_partners: "भर्ती भागीदार"
    }
};

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'en';
    updateUILanguage(savedLang);

    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            const newLang = e.target.value;
            localStorage.setItem('lang', newLang);
            updateUILanguage(newLang);
        });
    }
}

function updateUILanguage(lang) {
    const trans = translations[lang];
    if (!trans) return;

    const setSafeText = (selector, val) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = val;
    };

    // Header Branding
    setSafeText('.dept-info h4', trans.dept);
    setSafeText('.dept-info p', trans.college);

    // Hero Section (Index Only)
    setSafeText('.hero-section h1', trans.title);
    setSafeText('.hero-section p', trans.hero);

    // Portal titles on index page
    const portals = document.querySelectorAll('.portal-card h3');
    if (portals.length === 3) {
        portals[0].textContent = trans.studentPortal;
        portals[1].textContent = trans.companyPortal;
        portals[2].textContent = trans.adminPortal;
    }

    // Dynamic Sidebar/Dashboard translation using data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (trans[key]) {
            el.textContent = trans[key];
        }
    });
}

function getTranslatedText(key) {
    const lang = localStorage.getItem('lang') || 'en';
    const trans = translations[lang];
    return trans ? (trans[key] || key) : key;
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
});

// UI Helper Functions
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    if (alert) {
        alert.textContent = message;
        alert.className = `alert ${type}`;
        alert.style.display = 'block';

        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }
}

function isAuthenticated() {
    return !!getToken();
}

function checkAuth(requiredRole = null) {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }

    if (requiredRole && getUserRole() !== requiredRole) {
        alert('Unauthorized access');
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

function redirectIfNotAuthenticated() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        const role = getUserRole();
        if (role === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (role === 'company') {
            window.location.href = 'company-dashboard.html';
        } else if (['Admin', 'Coordinator', 'HOD', 'TPO', 'coordinator'].includes(role)) {
            window.location.href = 'coordinator-dashboard.html';
        }
    }
}

function updateNavbar() {
    const userNameEl = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userNameEl) {
        userNameEl.textContent = getUserName() || 'User';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            window.location.href = 'index.html';
        });
    }
}

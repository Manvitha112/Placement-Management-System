const pool = require('../config/database');
const { logAction } = require('../utils/logger');

// GET /api/student/profile
const getProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const connection = await pool.getConnection();

        const [students] = await connection.execute(
            'SELECT * FROM Student WHERE Stud_ID = ?',
            [studentId]
        );

        connection.release();

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, data: students[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

// GET /api/student/notifications/summary
// Returns lightweight counts to power in-app badges
const getNotificationSummary = async (req, res) => {
    try {
        const studentId = req.user.id;
        const connection = await pool.getConnection();

        const [[applicationsRow]] = await connection.execute(
            'SELECT COUNT(*) AS cnt FROM Application WHERE Stud_ID = ?',
            [studentId]
        );

        const [[interviewsRow]] = await connection.execute(
            `SELECT COUNT(*) AS cnt
             FROM Interview i
             JOIN Application a ON i.App_ID = a.App_ID
             WHERE a.Stud_ID = ?`,
            [studentId]
        );

        const [[offersRow]] = await connection.execute(
            'SELECT COUNT(*) AS cnt FROM Offer WHERE Stud_ID = ?',
            [studentId]
        );

        connection.release();

        res.json({
            success: true,
            data: {
                applications: applicationsRow.cnt || 0,
                interviews: interviewsRow.cnt || 0,
                offers: offersRow.cnt || 0
            }
        });
    } catch (error) {
        console.error('Get student notification summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notification summary' });
    }
};

// POST /api/student/profile/certificate
// Upload a single certificate file (PDF/JPG/PNG) and append its path to Student.Certificates
const uploadCertificate = async (req, res) => {
    try {
        const studentId = req.user.id;
        const email = req.user.email;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const certPath = `/uploads/certificates/${req.file.filename}`;

        const connection = await pool.getConnection();

        // Get any existing certificates
        const [rows] = await connection.execute(
            'SELECT Certificates FROM Student WHERE Stud_ID = ?',
            [studentId]
        );

        let updatedCertificates = certPath;
        if (rows.length > 0 && rows[0].Certificates) {
            updatedCertificates = rows[0].Certificates + ';' + certPath;
        }

        await connection.execute(
            'UPDATE Student SET Certificates = ?, ProfileComplete = TRUE WHERE Stud_ID = ?',
            [updatedCertificates, studentId]
        );

        await logAction(email, 'Uploaded achievement certificate', 'Student');

        connection.release();

        res.status(200).json({ success: true, message: 'Certificate uploaded successfully', data: { path: certPath } });
    } catch (error) {
        console.error('Upload certificate error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload certificate' });
    }
};

// POST /api/student/profile/resume
const uploadResume = async (req, res) => {
    try {
        const studentId = req.user.id;
        const email = req.user.email;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const resumePath = `/uploads/resumes/${req.file.filename}`;

        const connection = await pool.getConnection();

        await connection.execute(
            'UPDATE Student SET Resume_Link = ?, ProfileComplete = TRUE WHERE Stud_ID = ?',
            [resumePath, studentId]
        );

        await logAction(email, 'Uploaded resume PDF', 'Student');

        connection.release();

        res.status(200).json({ success: true, message: 'Resume uploaded successfully', data: { resumeLink: resumePath } });
    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload resume' });
    }
};

// PUT /api/student/profile
const updateProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const email = req.user.email;
        const { CGPA, Semester, Marks_10th, Marks_12th, Diploma_Marks, Backlogs, History_of_Backlogs, Phone, Address, Skills, LinkedIn, GitHub, Projects, Achievements } = req.body;

        const connection = await pool.getConnection();

        await connection.execute(
            `UPDATE Student SET 
       CGPA = ?, Semester = ?, Marks_10th = ?, Marks_12th = ?, Diploma_Marks = ?,
       Backlogs = ?, History_of_Backlogs = ?, Phone = ?, Address = ?, Skills = ?, 
       LinkedIn = ?, GitHub = ?, Projects = ?, Achievements = ?, ProfileComplete = TRUE 
       WHERE Stud_ID = ?`,
            [CGPA, Semester, Marks_10th, Marks_12th, Diploma_Marks, Backlogs, History_of_Backlogs, Phone, Address, Skills, LinkedIn, GitHub, Projects, Achievements, studentId]
        );

        await logAction(email, 'Updated professional academic profile', 'Student');

        connection.release();

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// GET /api/student/companies
const getCompanies = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [companies] = await connection.execute(
            'SELECT * FROM Company ORDER BY Package DESC'
        );

        connection.release();

        res.json({ success: true, data: companies });
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch companies' });
    }
};

// POST /api/student/apply
const applyForJob = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { companyId } = req.body;

        const connection = await pool.getConnection();

        // Check ProfileComplete
        const [student] = await connection.execute(
            'SELECT CGPA, ProfileComplete FROM Student WHERE Stud_ID = ?',
            [studentId]
        );

        if (!student[0].ProfileComplete) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Please complete your profile first' });
        }

        // Check CGPA requirement
        const [company] = await connection.execute(
            'SELECT Required_CGPA FROM Company WHERE Comp_ID = ?',
            [companyId]
        );

        if (student[0].CGPA < (company[0]?.Required_CGPA || 0)) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Your CGPA does not meet company requirements' });
        }

        // Check if already applied
        const [existing] = await connection.execute(
            'SELECT App_ID FROM Application WHERE Stud_ID = ? AND Comp_ID = ?',
            [studentId, companyId]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'You have already applied to this company' });
        }

        // Insert application
        const [result] = await connection.execute(
            "INSERT INTO Application (Stud_ID, Comp_ID, Status) VALUES (?, ?, 'Applied')",
            [studentId, companyId]
        );

        await logAction(req.user.email, `Applied for job at Comp_ID: ${companyId}`, 'Application');

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: { applicationId: result.insertId }
        });
    } catch (error) {
        console.error('Apply for job error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit application' });
    }
};

// GET /api/student/applications
const getApplications = async (req, res) => {
    try {
        const studentId = req.user.id;
        const connection = await pool.getConnection();

        const [applications] = await connection.execute(
            `SELECT a.App_ID, a.Status, a.Applied_At, c.Comp_Name, c.Role, c.Package, c.Job_Location
       FROM Application a
       JOIN Company c ON a.Comp_ID = c.Comp_ID
       WHERE a.Stud_ID = ?
       ORDER BY a.Applied_At DESC`,
            [studentId]
        );

        connection.release();

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
};

// GET /api/student/eligible-companies
// Returns companies for which the logged-in student currently satisfies basic eligibility:
// - Student profile is complete
// - Backlogs = 0
// - Student CGPA >= Company.Required_CGPA
// - Student Dept appears in Company.Preferred_Dept (if specified)
const getEligibleCompanies = async (req, res) => {
    try {
        const studentId = req.user.id;
        const connection = await pool.getConnection();

        // Load student academic summary
        const [students] = await connection.execute(
            'SELECT Dept, CGPA, Backlogs, ProfileComplete FROM Student WHERE Stud_ID = ?',
            [studentId]
        );

        if (students.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        if (!student.ProfileComplete) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Please complete your profile to view eligibility' });
        }

        // For now, enforce zero active backlogs for eligibility
        if ((student.Backlogs || 0) > 0) {
            connection.release();
            return res.json({ success: true, data: [] });
        }

        const dept = student.Dept;
        const cgpa = student.CGPA || 0;

        // Fetch companies where:
        // - Required_CGPA <= student's CGPA
        // - Preferred_Dept is empty or contains student's Dept code
        const [companies] = await connection.execute(
            `SELECT * FROM Company
             WHERE Required_CGPA <= ?
             AND (
                 Preferred_Dept IS NULL
                 OR Preferred_Dept = ''
                 OR Preferred_Dept LIKE CONCAT('%', ?, '%')
             )
             ORDER BY Package DESC`,
            [cgpa, dept]
        );

        connection.release();

        res.json({ success: true, data: companies });
    } catch (error) {
        console.error('Get eligible companies error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch eligible companies' });
    }
};

// GET /api/student/interviews
const getInterviews = async (req, res) => {
    try {
        const studentId = req.user.id;
        const connection = await pool.getConnection();

        const [interviews] = await connection.execute(
            `SELECT i.Int_ID, i.Int_Date, i.Int_Time, i.Round_No, i.Int_Mode, i.Int_Type, 
              i.Venue, i.Meeting_Link, i.Result, i.Remarks, c.Comp_Name
       FROM Interview i
       JOIN Application a ON i.App_ID = a.App_ID
       JOIN Company c ON a.Comp_ID = c.Comp_ID
       WHERE a.Stud_ID = ?
       ORDER BY i.Int_Date DESC`,
            [studentId]
        );

        connection.release();

        res.json({ success: true, data: interviews });
    } catch (error) {
        console.error('Get interviews error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
    }
};

// GET /api/student/offers
const getOffers = async (req, res) => {
    try {
        const studentId = req.user.id;
        const connection = await pool.getConnection();

        const [offers] = await connection.execute(
            `SELECT o.Offer_ID, o.Salary, o.Join_Date, o.Bond_Duration, o.Acceptance_Status, 
              o.Offered_At, c.Comp_Name, c.Role
       FROM Offer o
       JOIN Company c ON o.Comp_ID = c.Comp_ID
       WHERE o.Stud_ID = ?
       ORDER BY o.Offered_At DESC`,
            [studentId]
        );

        connection.release();

        res.json({ success: true, data: offers });
    } catch (error) {
        console.error('Get offers error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch offers' });
    }
};

// PUT /api/student/offer/:id/respond
const respondToOffer = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const connection = await pool.getConnection();

        // Verify offer belongs to this student
        const [offer] = await connection.execute(
            'SELECT Offer_ID FROM Offer WHERE Offer_ID = ? AND Stud_ID = ?',
            [id, studentId]
        );

        if (offer.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        await connection.execute(
            'UPDATE Offer SET Acceptance_Status = ? WHERE Offer_ID = ?',
            [status, id]
        );

        await logAction(req.user.email, `${status} job offer ID: ${id}`, 'Offer');

        connection.release();

        res.json({ success: true, message: `Offer ${status.toLowerCase()}!` });
    } catch (error) {
        console.error('Respond to offer error:', error);
        res.status(500).json({ success: false, message: 'Failed to update offer status' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getCompanies,
    applyForJob,
    getApplications,
    getInterviews,
    getOffers,
    respondToOffer,
    getEligibleCompanies,
    uploadResume,
    uploadCertificate,
    getNotificationSummary
};

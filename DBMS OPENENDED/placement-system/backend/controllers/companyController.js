const pool = require('../config/database');
const { logAction } = require('../utils/logger');

// GET /api/company/profile
const getProfile = async (req, res) => {
    try {
        const companyId = req.user.id;
        const connection = await pool.getConnection();

        const [companies] = await connection.execute(
            'SELECT * FROM Company WHERE Comp_ID = ?',
            [companyId]
        );

        connection.release();

        if (companies.length === 0) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        res.json({ success: true, data: companies[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

// PUT /api/company/profile
const updateProfile = async (req, res) => {
    try {
        const companyId = req.user.id;
        const {
            Comp_Name,
            Industry,
            Role,
            Package,
            Required_CGPA,
            Job_Description,
            Job_Location,
            Required_Skills,
            Positions
        } = req.body;

        const connection = await pool.getConnection();

        // Normalize undefined values to null for MySQL binding
        const params = [
            Comp_Name,
            Industry,
            Role,
            Package,
            Required_CGPA,
            Job_Description,
            Job_Location,
            Required_Skills,
            Positions,
            companyId
        ].map(v => (v === undefined ? null : v));

        await connection.execute(
            `UPDATE Company SET 
       Comp_Name = ?, Industry = ?, Role = ?, Package = ?, 
       Required_CGPA = ?, Job_Description = ?, Job_Location = ?, 
       Required_Skills = ?, Positions = ?
       WHERE Comp_ID = ?`,
            params
        );

        await logAction(req.user.email, 'Updated corporate profile and job details', 'Company');

        connection.release();

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// GET /api/company/applications
const getApplications = async (req, res) => {
    try {
        const companyId = req.user.id;
        const connection = await pool.getConnection();

        const { minCGPA, maxCGPA, dept, noBacklogs, skills } = req.query;

        let whereClause = 'WHERE a.Comp_ID = ?';
        const params = [companyId];

        if (minCGPA) {
            whereClause += ' AND s.CGPA >= ?';
            params.push(parseFloat(minCGPA));
        }

        if (maxCGPA) {
            whereClause += ' AND s.CGPA <= ?';
            params.push(parseFloat(maxCGPA));
        }

        if (dept) {
            whereClause += ' AND s.Dept = ?';
            params.push(dept);
        }

        if (noBacklogs === 'true') {
            whereClause += ' AND (s.Backlogs IS NULL OR s.Backlogs = 0)';
        }

        if (skills) {
            const skillList = skills
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            if (skillList.length > 0) {
                const skillConditions = skillList.map(() => 's.Skills LIKE CONCAT("%", ?, "%")').join(' AND ');
                whereClause += ` AND (${skillConditions})`;
                params.push(...skillList);
            }
        }

        const [applications] = await connection.execute(
            `SELECT 
                a.App_ID,
                a.Status,
                a.Applied_At,
                s.Stud_ID,
                s.Stud_Name,
                s.Dept,
                s.CGPA,
                s.Semester,
                s.Phone,
                s.Email,
                s.Skills,
                s.LinkedIn,
                s.GitHub,
                s.Projects,
                s.Achievements,
                s.Resume_Link,
                s.Certificates
             FROM Application a
             JOIN Student s ON a.Stud_ID = s.Stud_ID
             ${whereClause}
             ORDER BY a.Applied_At DESC`,
            params
        );

        connection.release();

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
};

// PUT /api/company/application/:id/status
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const companyId = req.user.id;

        if (!['Shortlisted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const connection = await pool.getConnection();

        // Verify application belongs to this company
        const [app] = await connection.execute(
            'SELECT App_ID FROM Application WHERE App_ID = ? AND Comp_ID = ?',
            [id, companyId]
        );

        if (app.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        await connection.execute(
            'UPDATE Application SET Status = ? WHERE App_ID = ?',
            [status, id]
        );

        await logAction(req.user.email, `Updated application ID: ${id} status to ${status}`, 'Application');

        connection.release();

        res.json({ success: true, message: 'Application status updated' });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};

// POST /api/company/interview
const createInterview = async (req, res) => {
    try {
        const companyId = req.user.id;
        const { appId, intDate, intTime, roundNo, intMode, intType, venue, meetingLink, remarks } = req.body;

        const connection = await pool.getConnection();

        // Verify application belongs to this company
        const [app] = await connection.execute(
            'SELECT App_ID FROM Application WHERE App_ID = ? AND Comp_ID = ?',
            [appId, companyId]
        );

        if (app.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const [result] = await connection.execute(
            `INSERT INTO Interview (App_ID, Int_Date, Int_Time, Round_No, Int_Mode, Int_Type, Venue, Meeting_Link, Result, Remarks, Created_At, Updated_At)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, NOW(), NOW())`,
            [appId, intDate, intTime, roundNo, intMode, intType, venue, meetingLink, remarks]
        );

        await logAction(req.user.email, `Scheduled interview for application ID: ${appId}`, 'Interview');

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Interview scheduled successfully',
            data: { interviewId: result.insertId }
        });
    } catch (error) {
        console.error('Create interview error:', error);
        res.status(500).json({ success: false, message: 'Failed to schedule interview' });
    }
};

// GET /api/company/interviews
const getInterviews = async (req, res) => {
    try {
        const companyId = req.user.id;
        const connection = await pool.getConnection();

        const [interviews] = await connection.execute(
            `SELECT i.Int_ID, i.Int_Date, i.Int_Time, i.Round_No, i.Int_Mode, i.Int_Type, 
              i.Venue, i.Meeting_Link, i.Result, i.Remarks, s.Stud_Name, s.Email, 
              s.Phone, s.Dept, a.App_ID
       FROM Interview i
       JOIN Application a ON i.App_ID = a.App_ID
       JOIN Student s ON a.Stud_ID = s.Stud_ID
       WHERE a.Comp_ID = ?
       ORDER BY i.Int_Date DESC`,
            [companyId]
        );

        connection.release();

        res.json({ success: true, data: interviews });
    } catch (error) {
        console.error('Get interviews error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
    }
};

// PUT /api/company/interview/:id/result
const updateInterviewResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { result, remarks } = req.body;
        const companyId = req.user.id;

        if (!['Pass', 'Fail'].includes(result)) {
            return res.status(400).json({ success: false, message: 'Invalid result' });
        }

        const connection = await pool.getConnection();

        // Verify interview belongs to this company
        const [interview] = await connection.execute(
            `SELECT i.Int_ID FROM Interview i
       JOIN Application a ON i.App_ID = a.App_ID
       WHERE i.Int_ID = ? AND a.Comp_ID = ?`,
            [id, companyId]
        );

        if (interview.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        await connection.execute(
            'UPDATE Interview SET Result = ?, Remarks = ? WHERE Int_ID = ?',
            [result, remarks, id]
        );

        await logAction(req.user.email, `Updated interview result for ID: ${id} to ${result}`, 'Interview');

        connection.release();

        res.json({ success: true, message: 'Interview result updated' });
    } catch (error) {
        console.error('Update interview result error:', error);
        res.status(500).json({ success: false, message: 'Failed to update result' });
    }
};

// POST /api/company/offer
const createOffer = async (req, res) => {
    try {
        const companyId = req.user.id;
        const { studId, salary, joinDate, bondDuration } = req.body;

        const connection = await pool.getConnection();

        // Check if offer already exists
        const [existing] = await connection.execute(
            'SELECT Offer_ID FROM Offer WHERE Stud_ID = ? AND Comp_ID = ?',
            [studId, companyId]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Offer already sent to this student' });
        }

        // Insert offer
        const [result] = await connection.execute(
            `INSERT INTO Offer (Stud_ID, Comp_ID, Salary, Join_Date, Bond_Duration, Acceptance_Status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
            [studId, companyId, salary, joinDate, bondDuration]
        );

        await logAction(req.user.email, `Issued job offer to student ID: ${studId}`, 'Offer');

        // Update application status to Selected
        await connection.execute(
            "UPDATE Application SET Status = 'Selected' WHERE Stud_ID = ? AND Comp_ID = ?",
            [studId, companyId]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Offer sent successfully',
            data: { offerId: result.insertId }
        });
    } catch (error) {
        console.error('Create offer error:', error);
        res.status(500).json({ success: false, message: 'Failed to send offer' });
    }
};

// GET /api/company/offers
const getOffers = async (req, res) => {
    try {
        const companyId = req.user.id;
        const connection = await pool.getConnection();

        const [offers] = await connection.execute(
            `SELECT o.Offer_ID, o.Salary, o.Join_Date, o.Bond_Duration, o.Acceptance_Status, 
              o.Offered_At, s.Stud_Name, s.Email, s.Phone, s.Dept, s.CGPA
       FROM Offer o
       JOIN Student s ON o.Stud_ID = s.Stud_ID
       WHERE o.Comp_ID = ?
       ORDER BY o.Offered_At DESC`,
            [companyId]
        );

        connection.release();

        res.json({ success: true, data: offers });
    } catch (error) {
        console.error('Get offers error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch offers' });
    }
};

// GET /api/company/notifications/summary
// Returns lightweight counts to power in-app badges
const getNotificationSummary = async (req, res) => {
    try {
        const companyId = req.user.id;
        const connection = await pool.getConnection();

        const [[applicationsRow]] = await connection.execute(
            'SELECT COUNT(*) AS cnt FROM Application WHERE Comp_ID = ?',
            [companyId]
        );

        const [[interviewsRow]] = await connection.execute(
            `SELECT COUNT(*) AS cnt
             FROM Interview i
             JOIN Application a ON i.App_ID = a.App_ID
             WHERE a.Comp_ID = ?`,
            [companyId]
        );

        const [[offersRow]] = await connection.execute(
            'SELECT COUNT(*) AS cnt FROM Offer WHERE Comp_ID = ?',
            [companyId]
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
        console.error('Get company notification summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notification summary' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getApplications,
    updateApplicationStatus,
    createInterview,
    getInterviews,
    updateInterviewResult,
    createOffer,
    getOffers,
    getNotificationSummary
};

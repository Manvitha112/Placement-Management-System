const pool = require('../config/database');

// GET /api/coordinator/statistics
const getStatistics = async (req, res) => {
    try {
        const { role, dept } = req.user;
        const connection = await pool.getConnection();

        let studentCountQuery = 'SELECT COUNT(*) as count FROM Student';
        let companyCountQuery = 'SELECT COUNT(*) as count FROM Company';
        let appCountQuery = 'SELECT COUNT(*) as count FROM Application';
        let placedCountQuery = "SELECT COUNT(DISTINCT Stud_ID) as count FROM Offer WHERE Acceptance_Status = 'Accepted'";
        let avgQuery = 'SELECT AVG(Salary) as avg FROM Offer';
        let params = [];

        if (role === 'HOD' || (role === 'Coordinator' && dept !== 'ALL')) {
            studentCountQuery += ' WHERE Dept = ?';
            appCountQuery = `SELECT COUNT(*) as count FROM Application a JOIN Student s ON a.Stud_ID = s.Stud_ID WHERE s.Dept = ?`;
            placedCountQuery = `SELECT COUNT(DISTINCT o.Stud_ID) as count FROM Offer o JOIN Student s ON o.Stud_ID = s.Stud_ID WHERE o.Acceptance_Status = 'Accepted' AND s.Dept = ?`;
            avgQuery = `SELECT AVG(o.Salary) as avg FROM Offer o JOIN Student s ON o.Stud_ID = s.Stud_ID WHERE s.Dept = ?`;
            params = [dept];
        }

        const [totalStudents] = await connection.execute(studentCountQuery, params);
        const [totalCompanies] = await connection.execute(companyCountQuery);
        const [totalApplications] = await connection.execute(appCountQuery, params);
        const [placedStudents] = await connection.execute(placedCountQuery, params);
        const [avgPackage] = await connection.execute(avgQuery, params);
        const [highestPackage] = await connection.execute('SELECT MAX(Salary) as max FROM Offer');

        connection.release();

        const unplacedStudents = totalStudents[0].count - placedStudents[0].count;

        res.json({
            success: true,
            data: {
                totalStudents: totalStudents[0].count,
                totalCompanies: totalCompanies[0].count,
                totalApplications: totalApplications[0].count,
                placedStudents: placedStudents[0].count,
                unplacedStudents: unplacedStudents,
                avgPackage: avgPackage[0].avg || 0,
                highestPackage: highestPackage[0].max || 0
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
};

// GET /api/coordinator/students
const getStudents = async (req, res) => {
    try {
        const { role, dept } = req.user;
        const connection = await pool.getConnection();

        let query = `SELECT s.Stud_ID, s.USN, s.Stud_Name, s.Dept, s.CGPA, s.Email, s.Phone, s.ProfileComplete,
              CASE WHEN o.Offer_ID IS NOT NULL THEN 'Placed' ELSE 'Unplaced' END as PlacementStatus,
              c.Comp_Name, o.Salary as Package
       FROM Student s
       LEFT JOIN Offer o ON s.Stud_ID = o.Stud_ID AND o.Acceptance_Status = 'Accepted'
       LEFT JOIN Company c ON o.Comp_ID = c.Comp_ID`;
        let params = [];

        if (role === 'HOD' || (role === 'Coordinator' && dept !== 'ALL')) {
            query += ' WHERE s.Dept = ?';
            params = [dept];
        }

        query += ' ORDER BY s.Stud_ID';

        const [students] = await connection.execute(query, params);
        connection.release();

        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
};

// GET /api/coordinator/companies
const getCompanies = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [companies] = await connection.execute(
            `SELECT c.Comp_ID, c.Comp_Name, c.Role, c.Package,
              COUNT(a.App_ID) as Total_Applications,
              SUM(CASE WHEN a.Status = 'Shortlisted' THEN 1 ELSE 0 END) as Shortlisted,
              SUM(CASE WHEN a.Status = 'Selected' THEN 1 ELSE 0 END) as Selected
       FROM Company c
       LEFT JOIN Application a ON c.Comp_ID = a.Comp_ID
       GROUP BY c.Comp_ID, c.Comp_Name, c.Role, c.Package
       ORDER BY c.Comp_ID`
        );

        connection.release();

        res.json({ success: true, data: companies });
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch companies' });
    }
};

// GET /api/coordinator/applications
const getApplications = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [applications] = await connection.execute(
            `SELECT a.App_ID, s.Stud_Name, s.Dept, s.CGPA, c.Comp_Name, c.Role, c.Package, a.Status, a.Applied_At
       FROM Application a
       JOIN Student s ON a.Stud_ID = s.Stud_ID
       JOIN Company c ON a.Comp_ID = c.Comp_ID
       ORDER BY a.Applied_At DESC`
        );

        connection.release();

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
};

// GET /api/coordinator/placed-students
const getPlacedStudents = async (req, res) => {
    try {
        const { role, dept } = req.user;
        const connection = await pool.getConnection();

        let query = `SELECT s.Stud_Name, s.Dept, s.CGPA, c.Comp_Name, c.Role, o.Salary, o.Join_Date
       FROM Student s
       JOIN Offer o ON s.Stud_ID = o.Stud_ID
       JOIN Company c ON o.Comp_ID = c.Comp_ID
       WHERE o.Acceptance_Status = 'Accepted'`;
        let params = [];

        if (role === 'HOD' || (role === 'Coordinator' && dept !== 'ALL')) {
            query += ' AND s.Dept = ?';
            params = [dept];
        }

        query += ' ORDER BY o.Offered_At DESC';

        const [students] = await connection.execute(query, params);
        connection.release();

        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Get placed students error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch placed students' });
    }
};

// GET /api/coordinator/unplaced-students
const getUnplacedStudents = async (req, res) => {
    try {
        const { role, dept } = req.user;
        const connection = await pool.getConnection();

        let query = `SELECT s.Stud_Name, s.Dept, s.CGPA, s.Email, s.Phone,
              COUNT(a.App_ID) as ApplicationCount
       FROM Student s
       LEFT JOIN Application a ON s.Stud_ID = a.Stud_ID
       WHERE s.Stud_ID NOT IN (SELECT DISTINCT Stud_ID FROM Offer WHERE Acceptance_Status = 'Accepted')`;
        let params = [];

        if (role === 'HOD' || (role === 'Coordinator' && dept !== 'ALL')) {
            query += ' AND s.Dept = ?';
            params = [dept];
        }

        query += ` GROUP BY s.Stud_ID, s.Stud_Name, s.Dept, s.CGPA, s.Email, s.Phone
       ORDER BY s.Stud_Name`;

        const [students] = await connection.execute(query, params);
        connection.release();

        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Get unplaced students error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch unplaced students' });
    }
};

// GET /api/coordinator/department-stats
const getDepartmentStats = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [stats] = await connection.execute(
            `SELECT s.Dept,
              COUNT(DISTINCT s.Stud_ID) as Total_Students,
              COUNT(DISTINCT o.Stud_ID) as Placed_Students,
              ROUND((COUNT(DISTINCT o.Stud_ID) / COUNT(DISTINCT s.Stud_ID)) * 100, 2) as Placement_Percentage,
              ROUND(AVG(o.Salary), 2) as Avg_Package
       FROM Student s
       LEFT JOIN Offer o ON s.Stud_ID = o.Stud_ID AND o.Acceptance_Status = 'Accepted'
       GROUP BY s.Dept
       ORDER BY s.Dept`
        );

        connection.release();

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get department stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch department statistics' });
    }
};

module.exports = {
    getStatistics,
    getStudents,
    getCompanies,
    getApplications,
    getPlacedStudents,
    getUnplacedStudents,
    getDepartmentStats
};

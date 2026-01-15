const express = require('express');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
    getStatistics,
    getStudents,
    getCompanies,
    getApplications,
    getPlacedStudents,
    getUnplacedStudents,
    getDepartmentStats
} = require('../controllers/coordinatorController');

const router = express.Router();

// All coordinator/staff routes require authentication and appropriate roles
router.use(verifyToken, authorizeRole(['coordinator', 'Admin', 'Coordinator', 'HOD', 'TPO']));

router.get('/statistics', getStatistics);
router.get('/students', getStudents);
router.get('/companies', getCompanies);
router.get('/applications', getApplications);
router.get('/placed-students', getPlacedStudents);
router.get('/unplaced-students', getUnplacedStudents);
router.get('/department-stats', getDepartmentStats);

module.exports = router;

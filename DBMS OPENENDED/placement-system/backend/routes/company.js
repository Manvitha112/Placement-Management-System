const express = require('express');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
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
} = require('../controllers/companyController');

const router = express.Router();

// All company routes require authentication and company role
router.use(verifyToken, authorizeRole('company'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/applications', getApplications);
router.put('/application/:id/status', updateApplicationStatus);
router.post('/interview', createInterview);
router.get('/interviews', getInterviews);
router.put('/interview/:id/result', updateInterviewResult);
router.post('/offer', createOffer);
router.get('/offers', getOffers);
router.get('/notifications/summary', getNotificationSummary);

module.exports = router;

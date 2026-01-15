const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
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
} = require('../controllers/studentController');

const router = express.Router();

// Multer setup for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads', 'resumes'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '.pdf';
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    }
});

// Multer setup for certificate uploads (PDF/JPG/PNG)
const certStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads', 'certificates'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '';
        cb(null, uniqueSuffix + ext);
    }
});

const uploadCert = multer({
    storage: certStorage,
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Only PDF/JPG/PNG certificate files are allowed'));
        }
        cb(null, true);
    }
});

// All student routes require authentication and student role
router.use(verifyToken, authorizeRole('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/resume', upload.single('resume'), uploadResume);
router.post('/profile/certificate', uploadCert.single('certificate'), uploadCertificate);
router.get('/companies', getCompanies);
router.get('/eligible-companies', getEligibleCompanies);
router.post('/apply', applyForJob);
router.get('/applications', getApplications);
router.get('/interviews', getInterviews);
router.get('/offers', getOffers);
router.put('/offer/:id/respond', respondToOffer);
router.get('/notifications/summary', getNotificationSummary);

module.exports = router;

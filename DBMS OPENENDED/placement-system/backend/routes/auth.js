const express = require('express');
const { login, registerStudent, registerCompany } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/register/company', registerCompany);

module.exports = router;

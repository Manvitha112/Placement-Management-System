const pool = require('../config/database');
const jwt = require('jwt-simple');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const connection = await pool.getConnection();

        // Check Student table
        const [students] = await connection.execute(
            'SELECT Stud_ID, Email, Stud_Name, Password FROM Student WHERE Email = ?',
            [email]
        );

        if (students.length > 0) {
            const student = students[0];
            if (student.Password === password) {
                const token = jwt.encode(
                    { id: student.Stud_ID, email: student.Email, role: 'student' },
                    SECRET
                );
                connection.release();
                return res.json({
                    success: true,
                    data: {
                        token,
                        role: 'student',
                        id: student.Stud_ID,
                        name: student.Stud_Name,
                        email: student.Email
                    }
                });
            }
        }

        // Check Company table
        const [companies] = await connection.execute(
            'SELECT Comp_ID, Email, Comp_Name, Password FROM Company WHERE Email = ?',
            [email]
        );

        if (companies.length > 0) {
            const company = companies[0];
            if (company.Password === password) {
                const token = jwt.encode(
                    { id: company.Comp_ID, email: company.Email, role: 'company' },
                    SECRET
                );
                connection.release();
                return res.json({
                    success: true,
                    data: {
                        token,
                        role: 'company',
                        id: company.Comp_ID,
                        name: company.Comp_Name,
                        email: company.Email
                    }
                });
            }
        }

        // Check Staff table (Admin, Coordinator, HOD, TPO)
        const [staffMembers] = await connection.execute(
            'SELECT Staff_ID, Email, Name, Password, Role, Dept FROM Staff WHERE Email = ?',
            [email]
        );

        if (staffMembers.length > 0) {
            const staff = staffMembers[0];
            if (staff.Password === password) {
                const token = jwt.encode(
                    { id: staff.Staff_ID, email: staff.Email, role: staff.Role, dept: staff.Dept },
                    SECRET
                );
                connection.release();
                return res.json({
                    success: true,
                    data: {
                        token,
                        role: staff.Role,
                        id: staff.Staff_ID,
                        name: staff.Name,
                        email: staff.Email,
                        dept: staff.Dept
                    }
                });
            }
        }

        // Check Coordinator table (Legacy Support)
        const [coordinators] = await connection.execute(
            'SELECT Coord_ID, Email, Name, Password FROM Coordinator WHERE Email = ?',
            [email]
        );

        if (coordinators.length > 0) {
            const coordinator = coordinators[0];
            if (coordinator.Password === password) {
                const token = jwt.encode(
                    { id: coordinator.Coord_ID, email: coordinator.Email, role: 'coordinator' },
                    SECRET
                );
                connection.release();
                return res.json({
                    success: true,
                    data: {
                        token,
                        role: 'coordinator',
                        id: coordinator.Coord_ID,
                        name: coordinator.Name,
                        email: coordinator.Email
                    }
                });
            }
        }

        connection.release();
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// POST /api/auth/register/student
const registerStudent = async (req, res) => {
    try {
        const { email, password, name, dept, usn } = req.body;

        if (!email || !password || !name || !dept || !usn) {
            return res.status(400).json({ success: false, message: 'All fields including USN are required' });
        }

        // Validate that USN's embedded department code matches selected department.
        // Example expected format: 1SI23IS112
        // Assumption: the 2-letter department code is at positions 5-6 (0-based) in the USN string.
        const usnTrimmed = usn.trim().toUpperCase();

        const deptCodeMap = {
            'CSE': 'CS',
            'ISE': 'IS',
            'AIML': 'AI',
            'DS': 'DS',
            'ECE': 'EC',
            'EEE': 'EE',
            'EIE': 'EI',
            'ME': 'ME',
            'CE': 'CE',
            'BT': 'BT'
        };

        const expectedDeptCode = deptCodeMap[dept];

        if (!expectedDeptCode || usnTrimmed.length < 7) {
            return res.status(400).json({ success: false, message: 'Invalid USN format for selected department' });
        }

        // Extract the 2-letter dept code from the USN (characters at index 5 and 6)
        const usnDeptCode = usnTrimmed.substring(5, 7);

        if (usnDeptCode !== expectedDeptCode) {
            return res.status(400).json({ success: false, message: 'USN department code does not match selected department' });
        }

        const connection = await pool.getConnection();

        // Check if email or USN already exists
        const [existing] = await connection.execute(
            'SELECT Stud_ID FROM Student WHERE Email = ? OR USN = ?',
            [email, usn]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Email or USN already registered' });
        }

        // Insert new student
        const [result] = await connection.execute(
            'INSERT INTO Student (Email, Password, Stud_Name, Dept, USN, ProfileComplete) VALUES (?, ?, ?, ?, ?, FALSE)',
            [email, password, name, dept, usn]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Register student error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

// POST /api/auth/register/company
const registerCompany = async (req, res) => {
    try {
        const { email, password, compName, role, packageLPA } = req.body;

        if (!email || !password || !compName || !role || !packageLPA) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        const connection = await pool.getConnection();

        // Check if email already exists
        const [existing] = await connection.execute(
            'SELECT Comp_ID FROM Company WHERE Email = ?',
            [email]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Insert new company
        const [result] = await connection.execute(
            'INSERT INTO Company (Email, Password, Comp_Name, Role, Package) VALUES (?, ?, ?, ?, ?)',
            [email, password, compName, role, packageLPA]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Company registered successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Register company error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

module.exports = { login, registerStudent, registerCompany };

-- ============================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM
-- COMPLETE DATABASE SETUP SCRIPT
-- ============================================

-- ============================================
-- STEP 1: CREATE DATABASE
-- ============================================

CREATE DATABASE IF NOT EXISTS placement_system;
USE placement_system;

-- Verify database is created
SHOW DATABASES;

-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

-- ========== USER_ROLES TABLE ==========
-- Professional role management for Staff, HODs, and Admin
CREATE TABLE IF NOT EXISTS Staff (
    Staff_ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Role ENUM('Admin', 'Coordinator', 'HOD', 'TPO') DEFAULT 'Coordinator',
    Dept ENUM('CSE', 'ISE', 'ECE', 'ME', 'EEE', 'CV', 'ALL') NOT NULL,
    Phone VARCHAR(15),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (Role),
    INDEX idx_staff_dept (Dept)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== AUDIT_LOGS TABLE ==========
-- Tracking all professional actions for accountability
CREATE TABLE IF NOT EXISTS Audit_Logs (
    Log_ID INT PRIMARY KEY AUTO_INCREMENT,
    User_Email VARCHAR(150),
    Action TEXT NOT NULL,
    Table_Name VARCHAR(50),
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== STUDENT TABLE ENHANCEMENT ==========
-- Added Academic breakdown for professional reporting
DROP TABLE IF EXISTS Student;
CREATE TABLE Student (
    Stud_ID INT PRIMARY KEY AUTO_INCREMENT,
    USN VARCHAR(20) UNIQUE NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Stud_Name VARCHAR(100) NOT NULL,
    Dept ENUM('CSE', 'ISE', 'ECE', 'ME', 'EEE', 'CV') NOT NULL,
    CGPA DECIMAL(4,2) CHECK (CGPA BETWEEN 0.00 AND 10.00),
    Semester INT CHECK (Semester BETWEEN 1 AND 8),
    Marks_10th DECIMAL(5,2),
    Marks_12th DECIMAL(5,2),
    Diploma_Marks DECIMAL(5,2),
    Backlogs INT DEFAULT 0,
    History_of_Backlogs INT DEFAULT 0,
    Phone VARCHAR(15),
    Address TEXT,
    Skills TEXT,
    LinkedIn VARCHAR(255),
    GitHub VARCHAR(255),
    Resume_Link VARCHAR(255),
    ProfileComplete BOOLEAN DEFAULT FALSE,
    Eligibility_Status BOOLEAN DEFAULT TRUE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dept (Dept),
    INDEX idx_usn (USN),
    INDEX idx_eligibility (Eligibility_Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========== COMPANY TABLE ==========
-- Stores company/recruiter registration and job details
CREATE TABLE IF NOT EXISTS Company (
    Comp_ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Comp_Name VARCHAR(150) NOT NULL,
    Industry VARCHAR(100),
    Role VARCHAR(100) NOT NULL,
    Package DECIMAL(10,2) CHECK (Package > 0),
    Required_CGPA DECIMAL(4,2) DEFAULT 6.00,
    Job_Description TEXT,
    Job_Location VARCHAR(100),
    Job_Type ENUM('Full-time', 'Internship', 'Part-time') DEFAULT 'Full-time',
    Required_Skills TEXT,
    Preferred_Dept VARCHAR(100),
    Positions INT DEFAULT 1,
    Last_Date DATE,
    Contact_Person VARCHAR(100),
    Contact_Phone VARCHAR(15),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_comp_name (Comp_Name),
    INDEX idx_package (Package),
    INDEX idx_required_cgpa (Required_CGPA)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========== COORDINATOR TABLE ==========
-- Stores placement coordinator/admin accounts (read-only access)
CREATE TABLE IF NOT EXISTS Coordinator (
    Coord_ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Department VARCHAR(50),
    Phone VARCHAR(15),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========== APPLICATION TABLE ==========
-- Links students to companies (student applies to company)
CREATE TABLE IF NOT EXISTS Application (
    App_ID INT PRIMARY KEY AUTO_INCREMENT,
    Stud_ID INT NOT NULL,
    Comp_ID INT NOT NULL,
    Status ENUM('Applied', 'Shortlisted', 'Rejected', 'Selected') DEFAULT 'Applied',
    Applied_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Stud_ID) REFERENCES Student(Stud_ID) ON DELETE CASCADE,
    FOREIGN KEY (Comp_ID) REFERENCES Company(Comp_ID) ON DELETE CASCADE,
    UNIQUE KEY unique_application (Stud_ID, Comp_ID),
    INDEX idx_stud_id (Stud_ID),
    INDEX idx_comp_id (Comp_ID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========== INTERVIEW TABLE ==========
-- Stores interview scheduling and results
CREATE TABLE IF NOT EXISTS Interview (
    Int_ID INT PRIMARY KEY AUTO_INCREMENT,
    App_ID INT NOT NULL,
    Int_Date DATE NOT NULL,
    Int_Time TIME,
    Round_No INT DEFAULT 1,
    Int_Mode ENUM('Online', 'Offline', 'Telephonic') DEFAULT 'Online',
    Int_Type ENUM('Technical', 'HR', 'Group Discussion', 'Aptitude') DEFAULT 'Technical',
    Venue VARCHAR(255),
    Meeting_Link VARCHAR(255),
    Result ENUM('Pass', 'Fail', 'Pending') DEFAULT 'Pending',
    Remarks TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (App_ID) REFERENCES Application(App_ID) ON DELETE CASCADE,
    INDEX idx_app_id (App_ID),
    INDEX idx_int_date (Int_Date),
    INDEX idx_result (Result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========== OFFER TABLE ==========
-- Stores final placement offers made to students
CREATE TABLE IF NOT EXISTS Offer (
    Offer_ID INT PRIMARY KEY AUTO_INCREMENT,
    Stud_ID INT NOT NULL,
    Comp_ID INT NOT NULL,
    Salary DECIMAL(10,2) NOT NULL,
    Join_Date DATE,
    Bond_Duration INT DEFAULT 0 COMMENT 'Bond period in months',
    Offer_Letter_Path VARCHAR(255),
    Acceptance_Status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    Offered_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Stud_ID) REFERENCES Student(Stud_ID) ON DELETE CASCADE,
    FOREIGN KEY (Comp_ID) REFERENCES Company(Comp_ID) ON DELETE CASCADE,
    UNIQUE KEY unique_offer (Stud_ID, Comp_ID),
    INDEX idx_stud_id (Stud_ID),
    INDEX idx_comp_id (Comp_ID),
    INDEX idx_salary (Salary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========== VERIFY TABLES CREATED ==========
SHOW TABLES;

-- ============================================
-- STEP 3: INSERT SAMPLE DATA
-- ============================================

-- ========== INSERT STUDENTS ==========
INSERT INTO Student (Email, Password, Stud_Name, Dept, USN, CGPA, Semester, Marks_10th, Marks_12th, Backlogs, Phone, Address, Skills, LinkedIn, GitHub, ProfileComplete) VALUES
('rahul.kumar@sit.ac.in', 'password123', 'Rahul Kumar', 'CSE', '1RV21CS001', 8.50, 8, 85.00, 82.00, 0, '9876543210', 'MG Road, Bangalore, Karnataka', 'Java, Python, React, Node.js, MySQL', 'linkedin.com/in/rahulkumar', 'github.com/rahulkumar', TRUE),
('priya.sharma@sit.ac.in', 'password123', 'Priya Sharma', 'ISE', '1RV21IS001', 9.20, 8, 92.00, 90.00, 0, '9876543211', 'Koramangala, Bangalore, Karnataka', 'JavaScript, React, Angular, MongoDB, Express', 'linkedin.com/in/priyasharma', 'github.com/priyasharma', TRUE),
('arjun.patel@sit.ac.in', 'password123', 'Arjun Patel', 'ECE', '1RV21EC001', 7.80, 7, 78.00, 75.00, 1, '9876543212', 'Jayanagar, Mysore, Karnataka', 'C++, Embedded Systems, VLSI, Arduino', 'linkedin.com/in/arjunpatel', 'github.com/arjunpatel', TRUE),
('sneha.reddy@sit.ac.in', 'password123', 'Sneha Reddy', 'CSE', '1RV21CS002', 8.90, 8, 88.00, 86.00, 0, '9876543213', 'Indiranagar, Bangalore, Karnataka', 'Python, Django, Machine Learning, Data Science, Flask', 'linkedin.com/in/snehareddy', 'github.com/snehareddy', TRUE),
('vikram.singh@sit.ac.in', 'password123', 'Vikram Singh', 'ME', '1RV21ME001', 7.50, 6, 72.00, 70.00, 2, '9876543214', 'Vidyanagar, Hubli, Karnataka', 'AutoCAD, SolidWorks, CATIA, Manufacturing', 'linkedin.com/in/vikramsingh', 'github.com/vikramsingh', FALSE),
('ananya.iyer@sit.ac.in', 'password123', 'Ananya Iyer', 'ISE', '1RV21IS002', 8.70, 8, 87.00, 85.00, 0, '9876543215', 'JP Nagar, Bangalore, Karnataka', 'Java, Spring Boot, Microservices, Docker, Kubernetes', 'linkedin.com/in/ananyaiyer', 'github.com/ananyaiyer', TRUE),
('karthik.rao@sit.ac.in', 'password123', 'Karthik Rao', 'CSE', '1RV21CS003', 9.00, 8, 90.00, 88.00, 0, '9876543216', 'Whitefield, Bangalore, Karnataka', 'C++, Data Structures, Algorithms, Competitive Programming', 'linkedin.com/in/karthikrao', 'github.com/karthikrao', TRUE),
('divya.nair@sit.ac.in', 'password123', 'Divya Nair', 'EEE', '1RV21EE001', 8.10, 7, 80.00, 78.00, 0, '9876543217', 'Rajajinagar, Bangalore, Karnataka', 'MATLAB, Power Systems, Circuit Design, PLC', 'linkedin.com/in/divyanair', 'github.com/divyanair', TRUE),
('aditya.kumar@sit.ac.in', 'password123', 'Aditya Kumar', 'ISE', '1RV21IS003', 7.90, 6, 76.00, 74.00, 1, '9876543218', 'BTM Layout, Bangalore, Karnataka', 'HTML, CSS, JavaScript, PHP, Laravel', 'linkedin.com/in/adityakumar', 'github.com/adityakumar', FALSE),
('meera.krishnan@sit.ac.in', 'password123', 'Meera Krishnan', 'CSE', '1RV21CS004', 9.50, 8, 95.00, 93.00, 0, '9876543219', 'Electronic City, Bangalore, Karnataka', 'Python, AI/ML, Deep Learning, TensorFlow, Computer Vision', 'linkedin.com/in/meerakrishnan', 'github.com/meerakrishnan', TRUE);


-- ========== INSERT COMPANIES ==========
INSERT INTO Company (Email, Password, Comp_Name, Industry, Role, Package, Required_CGPA, Job_Description, Job_Location, Job_Type, Required_Skills, Preferred_Dept, Positions, Last_Date, Contact_Person, Contact_Phone) VALUES
('hr@infosys.com', 'company123', 'Infosys', 'IT Services', 'Software Engineer', 5.50, 7.00, 'Develop and maintain enterprise software applications. Work on latest technologies and frameworks.', 'Bangalore', 'Full-time', 'Java, SQL, OOP, Spring Framework', 'CSE, ISE', 50, '2025-12-31', 'Ramesh Kumar', '080-12345601'),
('recruit@tcs.com', 'company123', 'TCS', 'IT Consulting', 'System Analyst', 4.80, 6.50, 'Analyze business requirements and design IT solutions. Work with global clients.', 'Mumbai', 'Full-time', 'C++, Python, System Design, SQL', 'CSE, ISE, ECE', 40, '2025-12-28', 'Priya Menon', '022-12345602'),
('jobs@google.com', 'company123', 'Google', 'Technology', 'SDE', 25.00, 8.50, 'Build scalable distributed systems. Work on products used by billions of users worldwide.', 'Bangalore', 'Full-time', 'Data Structures, Algorithms, Java/Python/C++, System Design', 'CSE, ISE', 5, '2025-12-15', 'John Smith', '080-12345603'),
('hr@adobe.com', 'company123', 'Adobe', 'Software', 'Frontend Developer', 14.00, 8.00, 'Develop creative software solutions and user interfaces for Adobe products.', 'Noida', 'Full-time', 'JavaScript, React, Node.js, HTML/CSS, UI/UX', 'CSE, ISE', 15, '2025-12-25', 'Sarah Johnson', '0120-12345604'),
('careers@wipro.com', 'company123', 'Wipro', 'IT Services', 'Software Associate', 4.50, 6.00, 'Support software development projects and maintenance activities.', 'Pune', 'Full-time', 'Java, Python, Testing, Basic Programming', 'CSE, ISE, ECE, EEE', 60, '2026-01-10', 'Anil Sharma', '020-12345605'),
('hiring@microsoft.com', 'company123', 'Microsoft', 'Technology', 'Software Engineer', 18.00, 8.00, 'Work on Azure, Microsoft 365, and other cloud-based solutions.', 'Hyderabad', 'Full-time', 'C#, .NET, Azure, Cloud Computing, Microservices', 'CSE, ISE', 20, '2025-12-20', 'Michael Brown', '040-12345606'),
('talent@amazon.com', 'company123', 'Amazon', 'E-commerce', 'SDE - 1', 20.00, 8.50, 'Build and scale AWS services and e-commerce platforms.', 'Bangalore', 'Full-time', 'Java, Python, AWS, Distributed Systems, Algorithms', 'CSE, ISE', 30, '2025-12-18', 'Jennifer Lee', '080-12345607'),
('recruit@accenture.com', 'company123', 'Accenture', 'Consulting', 'Application Developer', 5.00, 6.50, 'Develop applications for clients across various industries.', 'Chennai', 'Full-time', 'Java, JavaScript, SQL, Agile', 'CSE, ISE', 45, '2026-01-05', 'Rakesh Verma', '044-12345608'),
('hr@cognizant.com', 'company123', 'Cognizant', 'IT Services', 'Programmer Analyst', 4.20, 6.00, 'Code, test, and deploy applications for global clients.', 'Bangalore', 'Full-time', 'Java, C++, Testing, SQL', 'CSE, ISE, ECE', 55, '2026-01-08', 'Deepa Singh', '080-12345609'),
('jobs@flipkart.com', 'company123', 'Flipkart', 'E-commerce', 'Software Engineer', 12.00, 7.50, 'Build features for India\'s leading e-commerce platform.', 'Bangalore', 'Full-time', 'Java, Python, Microservices, Kafka, Redis', 'CSE, ISE', 25, '2025-12-22', 'Amit Agarwal', '080-12345610');


-- ========== INSERT STAFF (ADMIN, HOD, TPO) ==========
INSERT INTO Staff (Email, Password, Name, Role, Dept, Phone) VALUES
('admin@sit.ac.in', 'admin123', 'Head Administrator', 'Admin', 'ALL', '080-11112222'),
('hod.cse@sit.ac.in', 'hod123', 'Dr. Shanthi Prasad', 'HOD', 'CSE', '080-33334444'),
('tpo.officer@sit.ac.in', 'tpo123', 'Mr. Vishwanath', 'TPO', 'ALL', '080-55556666');

-- ========== INSERT PLACEMENT COORDINATORS (Legacy) ==========
INSERT INTO Coordinator (Email, Password, Name, Department, Phone) VALUES
('coordinator@sit.ac.in', 'admin123', 'Dr. Rajesh Kumar', 'Training and Placement', '080-28440000'),
('placement.head@sit.ac.in', 'admin123', 'Prof. Sunita Devi', 'Training and Placement', '080-28440001');


-- ========== INSERT APPLICATIONS ==========
INSERT INTO Application (Stud_ID, Comp_ID, Status) VALUES
(1, 1, 'Applied'),      -- Rahul → Infosys
(1, 3, 'Shortlisted'),  -- Rahul → Google
(1, 6, 'Applied'),      -- Rahul → Microsoft
(2, 3, 'Selected'),     -- Priya → Google (placed)
(2, 4, 'Shortlisted'),  -- Priya → Adobe
(3, 2, 'Rejected'),     -- Arjun → TCS
(3, 5, 'Applied'),      -- Arjun → Wipro
(4, 3, 'Applied'),      -- Sneha → Google
(4, 1, 'Shortlisted'),  -- Sneha → Infosys
(4, 7, 'Shortlisted'),  -- Sneha → Amazon
(6, 1, 'Applied'),      -- Ananya → Infosys
(6, 6, 'Shortlisted'),  -- Ananya → Microsoft
(7, 3, 'Shortlisted'),  -- Karthik → Google
(7, 7, 'Selected'),     -- Karthik → Amazon (placed)
(8, 9, 'Applied'),      -- Divya → Cognizant
(10, 3, 'Shortlisted'), -- Meera → Google
(10, 4, 'Applied'),     -- Meera → Adobe
(10, 7, 'Shortlisted'); -- Meera → Amazon


-- ========== INSERT INTERVIEWS ==========
INSERT INTO Interview (App_ID, Int_Date, Int_Time, Round_No, Int_Mode, Int_Type, Venue, Meeting_Link, Result, Remarks) VALUES
-- Rahul's interviews
(2, '2025-12-10', '10:00:00', 1, 'Online', 'Technical', NULL, 'meet.google.com/abc-defg-hij', 'Pass', 'Strong DSA skills'),
(2, '2025-12-12', '14:00:00', 2, 'Online', 'Technical', NULL, 'meet.google.com/abc-defg-hij', 'Pending', 'System design round'),
-- Priya's interviews (Selected)
(4, '2025-11-15', '10:00:00', 1, 'Online', 'Technical', NULL, 'meet.google.com/xyz-1234-abc', 'Pass', 'Excellent coding skills'),
(4, '2025-11-18', '11:00:00', 2, 'Online', 'Technical', NULL, 'meet.google.com/xyz-1234-abc', 'Pass', 'Good system design'),
(4, '2025-11-20', '15:00:00', 3, 'Online', 'HR', NULL, 'meet.google.com/xyz-1234-abc', 'Pass', 'Great communication'),
-- Sneha's interviews
(9, '2025-12-08', '09:00:00', 1, 'Offline', 'Aptitude', 'Infosys Campus, Electronics City', NULL, 'Pass', 'Cleared written test'),
(10, '2025-12-14', '10:00:00', 1, 'Online', 'Technical', NULL, 'chime.aws/amazon-interview', 'Pending', 'Scheduled'),
-- Karthik's interviews (Selected)
(13, '2025-11-22', '10:00:00', 1, 'Online', 'Technical', NULL, 'chime.aws/karthik-r1', 'Pass', 'Excellent problem solving'),
(13, '2025-11-25', '14:00:00', 2, 'Online', 'Technical', NULL, 'chime.aws/karthik-r2', 'Pass', 'Strong system design'),
(13, '2025-11-27', '16:00:00', 3, 'Online', 'HR', NULL, 'chime.aws/karthik-r3', 'Pass', 'Good fit for team'),
-- Meera's interviews
(16, '2025-12-16', '11:00:00', 1, 'Online', 'Technical', NULL, 'meet.google.com/meera-tech', 'Pending', 'AI/ML round');


-- ========== INSERT OFFERS ==========
INSERT INTO Offer (Stud_ID, Comp_ID, Salary, Join_Date, Bond_Duration, Offer_Letter_Path, Acceptance_Status) VALUES
-- Priya got offer from Google
(2, 3, 25.00, '2026-07-01', 24, '/offers/priya_google_offer.pdf', 'Accepted'),
-- Karthik got offer from Amazon
(7, 7, 20.00, '2026-07-15', 18, '/offers/karthik_amazon_offer.pdf', 'Accepted');

-- Update Application status to 'Selected' for placed students
UPDATE Application SET Status = 'Selected' WHERE App_ID = 4;  -- Priya → Google
UPDATE Application SET Status = 'Selected' WHERE App_ID = 14; -- Karthik → Amazon


-- ============================================
-- STEP 4: VERIFY DATABASE SETUP
-- ============================================

-- 1. Check all tables exist
SHOW TABLES;

-- 2. Count records in each table
SELECT 'Students' AS Table_Name, COUNT(*) AS Record_Count FROM Student
UNION ALL
SELECT 'Companies', COUNT(*) FROM Company
UNION ALL
SELECT 'Coordinators', COUNT(*) FROM Coordinator
UNION ALL
SELECT 'Applications', COUNT(*) FROM Application
UNION ALL
SELECT 'Interviews', COUNT(*) FROM Interview
UNION ALL
SELECT 'Offers', COUNT(*) FROM Offer;

-- 3. View sample data from each table
SELECT * FROM Student LIMIT 5;
SELECT * FROM Company LIMIT 5;
SELECT * FROM Coordinator;
SELECT * FROM Application LIMIT 10;
SELECT * FROM Interview LIMIT 5;
SELECT * FROM Offer;

-- 4. Test JOINs (Applications with Student and Company names)
SELECT 
    a.App_ID,
    s.Stud_Name,
    s.Dept,
    s.CGPA,
    c.Comp_Name,
    c.Role,
    c.Package,
    a.Status,
    a.Applied_At
FROM Application a
JOIN Student s ON a.Stud_ID = s.Stud_ID
JOIN Company c ON a.Comp_ID = c.Comp_ID
ORDER BY a.Applied_At DESC;

-- 5. Placement Statistics
SELECT 
    (SELECT COUNT(*) FROM Student) AS Total_Students,
    (SELECT COUNT(*) FROM Company) AS Total_Companies,
    (SELECT COUNT(*) FROM Application) AS Total_Applications,
    (SELECT COUNT(DISTINCT Stud_ID) FROM Offer WHERE Acceptance_Status = 'Accepted') AS Students_Placed,
    (SELECT COUNT(*) FROM Student) - 
    (SELECT COUNT(DISTINCT Stud_ID) FROM Offer WHERE Acceptance_Status = 'Accepted') AS Students_Unplaced;

-- 6. Department-wise placement
SELECT 
    s.Dept,
    COUNT(DISTINCT s.Stud_ID) AS Total_Students,
    COUNT(DISTINCT o.Stud_ID) AS Placed_Students,
    ROUND(
        COUNT(DISTINCT o.Stud_ID) * 100.0 / COUNT(DISTINCT s.Stud_ID), 
        2
    ) AS Placement_Percentage
FROM Student s
LEFT JOIN Offer o ON s.Stud_ID = o.Stud_ID AND o.Acceptance_Status = 'Accepted'
GROUP BY s.Dept;

-- 7. Company-wise applications
SELECT 
    c.Comp_Name,
    COUNT(a.App_ID) AS Total_Applications,
    SUM(CASE WHEN a.Status = 'Shortlisted' THEN 1 ELSE 0 END) AS Shortlisted,
    SUM(CASE WHEN a.Status = 'Selected' THEN 1 ELSE 0 END) AS Selected
FROM Company c
LEFT JOIN Application a ON c.Comp_ID = a.Comp_ID
GROUP BY c.Comp_Name
ORDER BY Total_Applications DESC;


-- ============================================
-- STEP 5: CREATE USEFUL VIEWS
-- ============================================

-- View 1: Placed Students with details
CREATE OR REPLACE VIEW v_placed_students AS
SELECT 
    s.Stud_ID,
    s.Stud_Name,
    s.Email,
    s.Dept,
    s.CGPA,
    c.Comp_Name,
    c.Role,
    o.Salary,
    o.Join_Date,
    o.Acceptance_Status
FROM Student s
JOIN Offer o ON s.Stud_ID = o.Stud_ID
JOIN Company c ON o.Comp_ID = c.Comp_ID
WHERE o.Acceptance_Status = 'Accepted';

-- View 2: Unplaced Students
CREATE OR REPLACE VIEW v_unplaced_students AS
SELECT 
    s.Stud_ID,
    s.Stud_Name,
    s.Email,
    s.Dept,
    s.CGPA,
    s.Phone,
    COUNT(a.App_ID) AS Applications_Count
FROM Student s
LEFT JOIN Offer o ON s.Stud_ID = o.Stud_ID AND o.Acceptance_Status = 'Accepted'
LEFT JOIN Application a ON s.Stud_ID = a.Stud_ID
WHERE o.Offer_ID IS NULL
GROUP BY s.Stud_ID, s.Stud_Name, s.Email, s.Dept, s.CGPA, s.Phone;

-- View 3: Application Details (with names)
CREATE OR REPLACE VIEW v_application_details AS
SELECT 
    a.App_ID,
    a.Stud_ID,
    s.Stud_Name,
    s.Dept,
    s.CGPA,
    s.Email AS Student_Email,
    a.Comp_ID,
    c.Comp_Name,
    c.Role,
    c.Package,
    a.Status,
    a.Applied_At
FROM Application a
JOIN Student s ON a.Stud_ID = s.Stud_ID
JOIN Company c ON a.Comp_ID = c.Comp_ID;


-- ============================================
-- STEP 6: TEST VIEWS
-- ============================================

-- Test View 1: Placed Students
SELECT * FROM v_placed_students;

-- Test View 2: Unplaced Students
SELECT * FROM v_unplaced_students;

-- Test View 3: Application Details
SELECT * FROM v_application_details LIMIT 10;

-- Count placed students
SELECT COUNT(*) AS Total_Placed_Students FROM v_placed_students;

-- Count unplaced students
SELECT COUNT(*) AS Total_Unplaced_Students FROM v_unplaced_students;

-- Department-wise placed students using view
SELECT 
    Dept, 
    COUNT(*) AS Placed_Count,
    ROUND(AVG(Salary), 2) AS Avg_Package
FROM v_placed_students
GROUP BY Dept;

-- Applications by status using view
SELECT 
    Status, 
    COUNT(*) AS Count
FROM v_application_details
GROUP BY Status;


-- ============================================
-- STEP 7: FINAL VERIFICATION
-- ============================================

-- Check table structure
DESCRIBE Student;
DESCRIBE Company;
DESCRIBE Coordinator;
DESCRIBE Application;
DESCRIBE Interview;
DESCRIBE Offer;

-- View all foreign key relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'placement_system'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verify indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'placement_system'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;


-- ============================================
-- DATABASE SETUP COMPLETE!
-- ============================================

/*
✅ DATABASE CREATED: placement_system
✅ TABLES CREATED: 6 (Student, Company, Coordinator, Application, Interview, Offer)
✅ SAMPLE DATA INSERTED: 
   - 10 Students
   - 10 Companies
   - 2 Coordinators
   - 18 Applications
   - 11 Interviews
   - 2 Offers (2 students placed)
✅ VIEWS CREATED: 3 (v_placed_students, v_unplaced_students, v_application_details)
✅ FOREIGN KEYS: Working
✅ INDEXES: Created
✅ CONSTRAINTS: Active

TEST CREDENTIALS:
- Student: rahul.kumar@sit.ac.in / password123
- Company: hr@infosys.com / company123
- Coordinator: coordinator@sit.ac.in / admin123

READY FOR BACKEND INTEGRATION!
*/
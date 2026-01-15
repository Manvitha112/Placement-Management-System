# Placement Management System – SIT ISE

A full-stack placement management portal for campus recruitment, supporting **students**, **recruiters**, and **coordinators/admin** with end-to-end workflows for applications, interviews, and offers.

---

## Table of Contents

- [Features](#features)
  - [Student Portal](#student-portal)
  - [Company Portal](#company-portal)
  - [Coordinator / Admin Portal](#coordinator--admin-portal)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Overview](#database-overview)
- [Getting Started](#getting-started)
  - [1. Clone & Install](#1-clone--install)
  - [2. Database Setup](#2-database-setup)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Run Backend](#4-run-backend)
  - [5. Run Frontend](#5-run-frontend)
- [Usage](#usage)
  - [Student Flow](#student-flow)
  - [Company Flow](#company-flow)
  - [Coordinator / Admin Flow](#coordinator--admin-flow)
- [Future Enhancements](#future-enhancements)
- [Credits](#credits)

---

## Features

### Student Portal

- **Authentication & profile**
  - Login using USN and department (JWT-based auth).
  - Academic profile:
    - CGPA, current semester.
    - 10th / 12th / Diploma marks.
    - Active backlogs & history of backlogs.
    - Phone, address, technical skills.
  - Profile completeness indicator based on key fields (CGPA, marks, skills, resume, links, portfolio).

- **Resume & certificates**
  - Upload resume as **PDF**.
  - Upload certificates as **PDF / JPG / PNG**.
  - Certificates are stored and shown as links.

- **Professional portfolio**
  - Fields for `Projects` and `Achievements` stored in the DB.
  - Dedicated **Portfolio** tab:
    - LinkedIn and GitHub URLs.
    - Resume status.
    - Project highlights.
    - Achievements & certification summary.
    - Certificate links.

- **Company browsing & eligibility**
  - View all active recruitment drives.
  - “Show Eligible Only” based on:
    - Department.
    - CGPA vs company `Required_CGPA`.
    - Active backlogs (0 or allowed).
  - Match score and “Recommended” label using:
    - CGPA vs required CGPA.
    - Skills overlap between student skills and company required skills.
    - Backlog penalty.

- **Applications, interviews, and offers**
  - Submit job applications to companies.
  - View all applications with status and applied date.
  - View interview schedule with:
    - Date, time, round, mode (Online/Offline/Telephonic).
    - Join link or venue.
    - Result (Pass/Fail/Pending).
  - View offers:
    - Offered salary, joining date, bond duration.
    - Accept / decline actions.

- **In-app notification badges**
  - Sidebar badges showing counts for:
    - Applications.
    - Interviews.
    - Job offers.
  - Backed by `/student/notifications/summary`.

---

### Company Portal

- **Company profile & job details**
  - Organization name, industry, role/designation.
  - Annual package (LPA), minimum CGPA.
  - Job location.
  - Job description.
  - Required technical skills (text).
  - Open positions.

- **Talent acquisition**
  - View all applicants for the company with:
    - Name, dept, CGPA, semester.
    - Phone, email.
    - Skills, LinkedIn, GitHub.
    - Resume link.
    - Project & achievement snippets.
  - Update application status:
    - Shortlist.
    - Reject.
  - Advanced filters:
    - Min / Max CGPA.
    - Department.
    - Only students with 0 active backlogs.
    - Skills contains (comma separated, AND logic).

- **Evaluation pool & interviews**
  - Shortlisted candidates tab.
  - Schedule interviews:
    - Application ID, date, time, round number.
    - Mode (Online/Offline/Telephonic).
    - Type (Technical/HR/GD/Aptitude).
    - Venue or meeting link.
  - Manage interview results:
    - Mark rounds as Pass / Fail.

- **Offer issuance & hired list**
  - Issue offers to students:
    - Student ID (internal `Stud_ID`).
    - Salary (LPA), expected joining date.
    - Bond duration (months).
  - Automatically updates application status to **Selected**.
  - Hired tab shows accepted offers.

- **Notification badges**
  - Sidebar badges showing counts for:
    - Applications.
    - Interview rounds.
    - Offers issued.
  - Backed by `/company/notifications/summary`.

---

### Coordinator / Admin Portal

- **Executive overview**
  - Total students registered.
  - Total companies.
  - Total placed students.
  - Average CTC (LPA), safely formatted.

- **Department Performance Index**
  - Per-department statistics:
    - Total students.
    - Placed students.
    - Placement percentage.
    - Average salary (accepted offers only).
  - Backed by `/coordinator/department-stats`.

- **Student directory**
  - View all students with:
    - USN, name, department, CGPA.
    - Placement status (Placed / Unplaced).
    - Organization name and package if placed.
  - Search and filter by department.

- **Placed & unplaced reports**
  - Placed students:
    - Company, role, salary, joining date.
  - Unplaced students:
    - CGPA, contact info, number of applications.

- **Company analytics**
  - Company-wise metrics:
    - Role, base package.
    - Total applications.
    - Shortlisted count.
    - Selected count.

---

## Tech Stack

- **Frontend**
  - HTML5, CSS, vanilla JavaScript.
  - Served via [`npx serve`](https://www.npmjs.com/package/serve).

- **Backend**
  - Node.js
  - Express.js
  - JWT-based authentication with role-based access control (student/company/coordinator).

- **Database**
  - MySQL
  - `mysql2` Node driver
  - Schema defined in [COMBINED.sql](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/COMBINED.sql:0:0-0:0).

---

## Architecture Overview

- **Frontend (static)**
  - Located in [placement-system/frontend](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/frontend:0:0-0:0).
  - Pages:
    - [index.html](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/frontend/index.html:0:0-0:0) – login / landing page.
    - [student-dashboard.html](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/frontend/student-dashboard.html:0:0-0:0) – student UI.
    - [company-dashboard.html](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/frontend/company-dashboard.html:0:0-0:0) – company UI.
    - [coordinator-dashboard.html](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/frontend/coordinator-dashboard.html:0:0-0:0) – admin/coordinator UI.
  - Uses `auth.js` for:
    - API calls with JWT.
    - Login/logout.
    - Role-based redirection.

- **Backend (API)**
  - Located in `placement-system/backend`.
  - Entry point: `server.js`.
  - Route groups:
    - `/api/student/...`
    - `/api/company/...`
    - `/api/coordinator/...`
  - Controllers implement the domain logic:
    - [studentController.js](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/backend/controllers/studentController.js:0:0-0:0)
    - [companyController.js](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/backend/controllers/companyController.js:0:0-0:0)
    - [coordinatorController.js](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/backend/controllers/coordinatorController.js:0:0-0:0)

---

## Database Overview

Main tables (see [COMBINED.sql](cci:7://file:///c:/Users/91821/Downloads/DBMS%20OPENENDED/DBMS%20OPENENDED/placement-system/COMBINED.sql:0:0-0:0) for full schema):

- `Student` – student academic and professional data.
- `Company` – recruiter/company accounts and job details.
- `Coordinator` – admin/coordinator accounts.
- `Application` – applications linking students to companies.
- `Interview` – interview rounds and results.
- `Offer` – offers issued by companies to students.

Foreign keys maintain referential integrity (e.g., `Application.Stud_ID → Student.Stud_ID`).

---

## Getting Started
```bash
1. Clone & Install
git clone <your-repo-url>
cd placement-system/backend
npm install

2.Connect sql

3.Run backend
cd placement-system/backend
npm start

4.Run frontend
cd placement-system/frontend
npx serve -l 5500d

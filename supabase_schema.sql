-- ==============================================================================
-- UNIVERSITY COURSE FILE MANAGEMENT SYSTEM (CFMS)
-- SUPABASE POSTGRESQL DATABASE SCHEMA & INITIAL SEED DATA
-- Institution: University of Education, Attock Campus
-- ==============================================================================

-- 0. CAMPUSES TABLE (University of Education Campuses)
CREATE TABLE IF NOT EXISTS public."campuses" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT,
  "directorName" TEXT,
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Inactive')),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public."departments" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "campusId" TEXT DEFAULT 'camp-attock',
  "campusName" TEXT DEFAULT 'Attock Campus',
  "hodId" TEXT DEFAULT '',
  "hodName" TEXT DEFAULT 'Unassigned',
  "facultyCount" INTEGER DEFAULT 0,
  "courseCount" INTEGER DEFAULT 0,
  "submissionRate" NUMERIC DEFAULT 0,
  "building" TEXT DEFAULT 'Academic Block A',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public."users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "personalEmail" TEXT,
  "passwordHash" TEXT NOT NULL,
  "avatar" TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  "role" TEXT NOT NULL CHECK ("role" IN ('ADMIN', 'HOD', 'REGULAR_TEACHER', 'VISITING_TEACHER')),
  "departmentId" TEXT DEFAULT '',
  "departmentName" TEXT DEFAULT '',
  "designation" TEXT DEFAULT 'Faculty',
  "phone" TEXT DEFAULT '',
  "altPhone" TEXT,
  "officeExtension" TEXT,
  "emergencyContact" TEXT,
  "gender" TEXT,
  "dob" TEXT,
  "cnic" TEXT,
  "maritalStatus" TEXT,
  "bloodGroup" TEXT,
  "nationality" TEXT,
  "country" TEXT,
  "state" TEXT,
  "city" TEXT,
  "postalCode" TEXT,
  "officeAddress" TEXT,
  "residentialAddress" TEXT,
  "employeeId" TEXT,
  "joiningDate" TEXT,
  "employmentType" TEXT,
  "highestQualification" TEXT,
  "specialization" TEXT,
  "academicSession" TEXT,
  "username" TEXT,
  "campus" TEXT,
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Inactive', 'Locked', 'Suspended')),
  "loginAttempts" INTEGER DEFAULT 0,
  "loginCount" INTEGER DEFAULT 0,
  "deleted" BOOLEAN DEFAULT FALSE,
  "lockUntil" TIMESTAMPTZ,
  "contractStartDate" TEXT,
  "contractEndDate" TEXT,
  "contractStatus" TEXT,
  "supervisorName" TEXT,
  "campusId" TEXT DEFAULT 'camp-attock',
  "hodId" TEXT,
  "enrollmentStatus" TEXT DEFAULT 'ProfileIncomplete',
  "approvedAt" TEXT,
  "approvedBy" TEXT,
  "totalCredits" NUMERIC DEFAULT 0,
  "createdAt" TEXT DEFAULT CURRENT_DATE::TEXT,
  "lastLogin" TEXT DEFAULT 'Never',
  "refreshToken" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public."courses" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "credits" INTEGER DEFAULT 3,
  "type" TEXT DEFAULT 'Core' CHECK ("type" IN ('Core', 'Elective', 'Lab')),
  "assignedTeacherId" TEXT DEFAULT '',
  "assignedTeacherName" TEXT DEFAULT 'Unassigned',
  "assignedTeacherRole" TEXT DEFAULT 'REGULAR_TEACHER',
  "semester" TEXT DEFAULT 'Semester 1',
  "academicSession" TEXT DEFAULT 'Fall 2025',
  "totalStudents" INTEGER DEFAULT 40,
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Archived')),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public."programs" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "degreeLevel" TEXT DEFAULT 'BS' CHECK ("degreeLevel" IN ('BS', 'MS', 'MPhil', 'PhD')),
  "durationYears" INTEGER DEFAULT 4,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACADEMIC SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public."academic_sessions" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "term" TEXT DEFAULT 'Fall' CHECK ("term" IN ('Fall', 'Spring', 'Summer')),
  "year" INTEGER NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "isCurrent" BOOLEAN DEFAULT FALSE,
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Locked', 'Archived')),
  "fileCount" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SUBMISSION WINDOWS TABLE
CREATE TABLE IF NOT EXISTS public."submission_windows" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "sessionName" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Submission Window Active',
  "allowLateSubmission" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COURSE FILES TABLE
CREATE TABLE IF NOT EXISTS public."course_files" (
  "id" TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  "courseCode" TEXT NOT NULL,
  "courseTitle" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "teacherRole" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "currentVersion" TEXT DEFAULT 'v1.0',
  "fileType" TEXT DEFAULT 'PDF',
  "fileSize" TEXT DEFAULT '2.5 MB',
  "fileUrl" TEXT DEFAULT '#',
  "status" TEXT DEFAULT 'Submitted',
  "uploadDate" TEXT DEFAULT CURRENT_DATE::TEXT,
  "lastModified" TEXT DEFAULT CURRENT_DATE::TEXT,
  "archived" BOOLEAN DEFAULT FALSE,
  "deleted" BOOLEAN DEFAULT FALSE,
  "deletedAt" TEXT,
  "remarks" TEXT DEFAULT '',
  "versionHistory" JSONB DEFAULT '[]'::JSONB,
  "approvalStage" TEXT DEFAULT 'HOD Review',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DEADLINES TABLE
CREATE TABLE IF NOT EXISTS public."deadlines" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "courseCode" TEXT DEFAULT 'ALL',
  "category" TEXT DEFAULT 'General',
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "dueDate" TEXT NOT NULL,
  "gracePeriodDays" INTEGER DEFAULT 3,
  "status" TEXT DEFAULT 'Upcoming' CHECK ("status" IN ('Upcoming', 'Completed', 'Missed', 'Extended')),
  "description" TEXT DEFAULT '',
  "targetRole" TEXT DEFAULT 'ALL',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public."announcements" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorRole" TEXT NOT NULL,
  "targetDepartmentId" TEXT DEFAULT 'ALL',
  "targetRole" TEXT DEFAULT 'ALL',
  "createdDate" TEXT DEFAULT CURRENT_DATE::TEXT,
  "priority" TEXT DEFAULT 'Medium' CHECK ("priority" IN ('Low', 'Medium', 'High', 'Urgent')),
  "isPinned" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public."templates" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT DEFAULT '',
  "format" TEXT DEFAULT 'PDF',
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT DEFAULT '#',
  "uploadedBy" TEXT DEFAULT 'Administrator',
  "targetRole" TEXT DEFAULT 'ALL',
  "uploadedAt" TEXT DEFAULT CURRENT_DATE::TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUBMISSION INSTRUCTIONS TABLE
CREATE TABLE IF NOT EXISTS public."submission_instructions" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "fileName" TEXT,
  "fileUrl" TEXT,
  "category" TEXT DEFAULT 'General Instructions',
  "updatedAtStr" TEXT DEFAULT CURRENT_DATE::TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public."system_settings" (
  "id" TEXT PRIMARY KEY DEFAULT 'current-system-settings',
  "systemName" TEXT DEFAULT 'University Course File Management System (CFMS)',
  "universityName" TEXT DEFAULT 'University of Education, Attock Campus',
  "academicYear" TEXT DEFAULT '2025-2026',
  "currentSession" TEXT DEFAULT 'Fall 2025',
  "mfaRequired" BOOLEAN DEFAULT FALSE,
  "maxFileSizeMB" INTEGER DEFAULT 50,
  "allowedExtensions" JSONB DEFAULT '[".pdf", ".docx", ".zip", ".xlsx", ".ppt"]'::JSONB,
  "smtpHost" TEXT DEFAULT 'smtp.ue.edu.pk',
  "smtpStatus" TEXT DEFAULT 'Connected',
  "autoArchivingDays" INTEGER DEFAULT 180,
  "maintenanceMode" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public."audit_logs" (
  "id" TEXT PRIMARY KEY,
  "timestamp" TEXT DEFAULT NOW()::TEXT,
  "eventType" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "status" TEXT DEFAULT 'SUCCESS',
  "severity" TEXT DEFAULT 'INFO',
  "signature" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 14. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public."feedback" (
  "id" TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Open' CHECK ("status" IN ('Open', 'In Progress', 'Resolved')),
  "createdAt" TEXT DEFAULT CURRENT_DATE::TEXT,
  "response" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public."notifications" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT DEFAULT 'info',
  "timestamp" TEXT DEFAULT 'Just now',
  "isRead" BOOLEAN DEFAULT FALSE,
  "targetRole" TEXT DEFAULT 'ALL',
  "linkModule" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ARCHIVES TABLE
CREATE TABLE IF NOT EXISTS public."archives" (
  "id" TEXT PRIMARY KEY,
  "courseFileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "courseCode" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "academicSession" TEXT DEFAULT 'Fall 2025',
  "archivedAt" TEXT DEFAULT CURRENT_DATE::TEXT,
  "archivedBy" TEXT DEFAULT 'System (Auto-Archived on Approval)',
  "fileUrl" TEXT DEFAULT '#',
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 17. TEACHER ENROLLMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public."teacher_requests" (
  "id" TEXT PRIMARY KEY,
  "teacherId" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "teacherEmail" TEXT NOT NULL,
  "teacherType" TEXT NOT NULL CHECK ("teacherType" IN ('REGULAR_TEACHER', 'VISITING_TEACHER')),
  "campusId" TEXT DEFAULT 'camp-attock',
  "campusName" TEXT DEFAULT 'Attock Campus',
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "hodId" TEXT DEFAULT '',
  "hodName" TEXT DEFAULT '',
  "selectedCourses" JSONB DEFAULT '[]'::JSONB,
  "totalCredits" INTEGER NOT NULL DEFAULT 0,
  "creditLimit" INTEGER NOT NULL DEFAULT 22,
  "status" TEXT DEFAULT 'PendingHODApproval' CHECK ("status" IN ('PendingHODApproval', 'Approved', 'Rejected', 'NeedsUpdate')),
  "rejectionReason" TEXT DEFAULT '',
  "profileData" JSONB DEFAULT '{}'::JSONB,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  "reviewedAt" TIMESTAMPTZ,
  "reviewedBy" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 18. HOD ASSIGNMENTS TABLE (Admin source-of-truth for HOD authorization & scope)
CREATE TABLE IF NOT EXISTS public."hod_assignments" (
  "id" TEXT PRIMARY KEY,
  "hodId" TEXT NOT NULL,
  "hodName" TEXT NOT NULL,
  "hodEmail" TEXT NOT NULL,
  "campusId" TEXT NOT NULL,
  "campusName" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Inactive')),
  "assignedDate" TEXT DEFAULT CURRENT_DATE::TEXT,
  "assignedBy" TEXT DEFAULT 'Administrator',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY AND PERMISSIVE POLICIES
DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public access for all operations" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public access for all operations" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- ==============================================================================
-- INITIAL UNIVERSITY DATA SEED
-- ==============================================================================

-- 0. Insert Initial University Campuses
INSERT INTO public."campuses" ("id", "code", "name", "city", "address", "directorName", "status")
VALUES
  ('camp-attock', 'UE-ATK', 'Attock Campus', 'Attock', 'Attock City, Punjab', 'Prof. Dr. Muhammad Aslam', 'Active'),
  ('camp-township', 'UE-TNS', 'Township Campus, Lahore', 'Lahore', 'College Road, Township, Lahore', 'Prof. Dr. Shahid Iqbal', 'Active'),
  ('camp-lowermall', 'UE-LML', 'Lower Mall Campus, Lahore', 'Lahore', 'Lower Mall, Near Civil Secretariat, Lahore', 'Prof. Dr. Naeem Khan', 'Active'),
  ('camp-bankroad', 'UE-BRD', 'Bank Road Campus, Lahore', 'Lahore', 'Bank Road, Lahore', 'Prof. Dr. Farhat Saleem', 'Active'),
  ('camp-multan', 'UE-MLT', 'Multan Campus', 'Multan', 'Bosan Road, Multan', 'Prof. Dr. Rashid Mehmood', 'Active'),
  ('camp-vehari', 'UE-VHR', 'Vehari Campus', 'Vehari', 'Vehari City, Punjab', 'Prof. Dr. Amjad Ali', 'Active'),
  ('camp-dgkhan', 'UE-DGK', 'D.G. Khan Campus', 'D.G. Khan', 'Dera Ghazi Khan', 'Prof. Dr. Munir Ahmed', 'Active'),
  ('camp-faisalabad', 'UE-FSD', 'Faisalabad Campus', 'Faisalabad', 'Jaranwala Road, Faisalabad', 'Prof. Dr. Tanveer Akhtar', 'Active'),
  ('camp-jauharabad', 'UE-JBD', 'Jauharabad Campus', 'Jauharabad', 'Jauharabad, District Khushab', 'Prof. Dr. Sajjad Hussain', 'Active')
ON CONFLICT ("id") DO NOTHING;

-- 1. Insert Initial Departments
INSERT INTO public."departments" ("id", "code", "name", "campusId", "campusName", "hodId", "hodName", "facultyCount", "courseCount", "submissionRate", "building")
VALUES
  ('dept-cs', 'CS', 'Computer Science', 'camp-attock', 'Attock Campus', 'usr-hod-asif', 'Dr. Muhammad Asif', 18, 42, 92, 'Academic Block A (IT Wing)'),
  ('dept-math', 'MATH', 'Mathematics', 'camp-attock', 'Attock Campus', 'usr-hod-abuzarr', 'Dr. Abu Zarr', 12, 28, 88, 'Science Block B'),
  ('dept-eng', 'ENG', 'English Literature', 'camp-attock', 'Attock Campus', 'usr-hod-eng', 'Dr. Ayesha Malik', 10, 22, 95, 'Humanities Block C')
ON CONFLICT ("id") DO NOTHING;

-- 2. Insert Initial Users (Admin, HODs for CS and Math, Regular Teachers, Visiting Teachers)
INSERT INTO public."users" ("id", "name", "email", "passwordHash", "role", "departmentId", "departmentName", "campus", "designation", "phone", "status", "createdAt", "lastLogin", "employeeId")
VALUES
  ('usr-admin', 'Prof. Dr. Muhammad Aslam', 'admin@ue.edu.pk', '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K', 'ADMIN', 'dept-cs', 'Computer Science', 'Attock Campus', 'System Administrator & Dean', '+92 300 1234567', 'Active', '2024-01-15', CURRENT_DATE::TEXT, 'EMP-ADMIN-001'),
  ('usr-hod-asif', 'Dr. Muhammad Asif', 'asif.cs@ue.edu.pk', '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K', 'HOD', 'dept-cs', 'Computer Science', 'Attock Campus', 'Head of Department (Computer Science)', '+92 302 1122334', 'Active', '2024-02-01', CURRENT_DATE::TEXT, 'EMP-HOD-002'),
  ('usr-hod-abuzarr', 'Dr. Abu Zarr', 'abuzarr.math@ue.edu.pk', '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K', 'HOD', 'dept-math', 'Mathematics', 'Attock Campus', 'Head of Department (Mathematics)', '+92 305 5544332', 'Active', '2024-02-01', CURRENT_DATE::TEXT, 'EMP-HOD-003'),
  ('usr-teacher-1', 'Dr. Tariq Mahmood', 'tariq.mahmood@ue.edu.pk', '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K', 'REGULAR_TEACHER', 'dept-cs', 'Computer Science', 'Attock Campus', 'Assistant Professor', '+92 321 4567890', 'Active', '2024-03-10', CURRENT_DATE::TEXT, 'EMP-FAC-004'),
  ('usr-visiting-1', 'Engr. Bilal Khan', 'bilal.visiting@ue.edu.pk', '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K', 'VISITING_TEACHER', 'dept-cs', 'Computer Science', 'Attock Campus', 'Visiting Lecturer', '+92 333 7890123', 'Active', '2025-08-25', CURRENT_DATE::TEXT, 'EMP-VIS-005'),
  ('usr-teacher-math', 'Prof. Yasir Math', 'yasir.math@ue.edu.pk', '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K', 'REGULAR_TEACHER', 'dept-math', 'Mathematics', 'Attock Campus', 'Lecturer in Mathematics', '+92 301 2233445', 'Active', '2024-04-12', CURRENT_DATE::TEXT, 'EMP-FAC-006')
ON CONFLICT ("id") DO NOTHING;

-- 2.5 Insert Initial HOD Scope Assignments (Admin mapping: HOD -> Campus + Department)
INSERT INTO public."hod_assignments" ("id", "hodId", "hodName", "hodEmail", "campusId", "campusName", "departmentId", "departmentName", "status", "assignedDate")
VALUES
  ('asgn-hod-asif', 'usr-hod-asif', 'Dr. Muhammad Asif', 'asif.cs@ue.edu.pk', 'camp-attock', 'Attock Campus', 'dept-cs', 'Computer Science', 'Active', '2024-02-01'),
  ('asgn-hod-abuzarr', 'usr-hod-abuzarr', 'Dr. Abu Zarr', 'abuzarr.math@ue.edu.pk', 'camp-attock', 'Attock Campus', 'dept-math', 'Mathematics', 'Active', '2024-02-01')
ON CONFLICT ("id") DO NOTHING;

-- 3. Insert Initial Courses
INSERT INTO public."courses" ("id", "code", "title", "departmentId", "departmentName", "credits", "type", "assignedTeacherId", "assignedTeacherName", "semester", "academicSession", "totalStudents", "status")
VALUES
  ('course-1', 'CS-401', 'Advanced Software Engineering', 'dept-cs', 'Computer Science', 3, 'Core', 'usr-teacher-1', 'Dr. Tariq Mahmood', 'Semester 7', 'Fall 2025', 45, 'Active'),
  ('course-2', 'CS-302', 'Database Systems & Architecture', 'dept-cs', 'Computer Science', 4, 'Core', 'usr-teacher-1', 'Dr. Tariq Mahmood', 'Semester 5', 'Fall 2025', 52, 'Active'),
  ('course-3', 'CS-201', 'Data Structures & Algorithms', 'dept-cs', 'Computer Science', 4, 'Core', 'usr-visiting-1', 'Engr. Bilal Khan', 'Semester 3', 'Fall 2025', 58, 'Active'),
  ('course-4', 'CS-501', 'Artificial Intelligence & Machine Learning', 'dept-cs', 'Computer Science', 3, 'Elective', 'usr-hod-cs', 'Dr. Sarah Ahmad', 'Semester 8', 'Fall 2025', 38, 'Active')
ON CONFLICT ("id") DO NOTHING;

-- 4. Insert Initial Academic Session
INSERT INTO public."academic_sessions" ("id", "name", "term", "year", "startDate", "endDate", "isCurrent", "status", "fileCount")
VALUES
  ('sess-fall-2025', 'Fall 2025', 'Fall', 2025, '2025-09-01', '2026-01-31', TRUE, 'Active', 142),
  ('sess-spring-2025', 'Spring 2025', 'Spring', 2025, '2025-02-01', '2025-06-30', FALSE, 'Locked', 138)
ON CONFLICT ("id") DO NOTHING;

-- 5. Insert Submission Window
INSERT INTO public."submission_windows" ("id", "sessionId", "sessionName", "startDate", "endDate", "status", "allowLateSubmission")
VALUES
  ('sub-win-curr', 'sess-fall-2025', 'Fall 2025 Semester', '2025-09-05', '2026-02-15', 'Submission Window Active', TRUE)
ON CONFLICT ("id") DO NOTHING;

-- 6. Insert Initial Deadlines
INSERT INTO public."deadlines" ("id", "title", "courseCode", "category", "departmentId", "departmentName", "dueDate", "gracePeriodDays", "status", "description", "targetRole")
VALUES
  ('dead-1', 'Course Outline & Syllabus Submission', 'ALL', 'Course Outline', 'dept-cs', 'Computer Science', '2025-09-20', 3, 'Completed', 'Submit complete HEC-compliant course outlines with grading rubrics.', 'ALL'),
  ('dead-2', 'Midterm Question Papers & Rubrics', 'CS-401', 'Midterm Exams', 'dept-cs', 'Computer Science', '2025-11-10', 2, 'Completed', 'Upload signed copy of midterm questions with detailed answer keys.', 'ALL'),
  ('dead-3', 'Final Exam Question Papers Submission', 'ALL', 'Final Exams', 'dept-cs', 'Computer Science', '2026-01-20', 3, 'Upcoming', 'Final exams must be verified by Department Quality Assurance committee.', 'ALL'),
  ('dead-4', 'Complete Course File Final Submission', 'ALL', 'Complete File', 'dept-cs', 'Computer Science', '2026-02-15', 5, 'Upcoming', 'Final complete compiled digital course dossier including CLO-PLO mapping.', 'ALL')
ON CONFLICT ("id") DO NOTHING;

-- 7. Insert Initial System Settings
INSERT INTO public."system_settings" ("id", "systemName", "universityName", "academicYear", "currentSession", "mfaRequired", "maxFileSizeMB", "smtpHost", "smtpStatus", "autoArchivingDays", "maintenanceMode")
VALUES
  ('current-system-settings', 'University Course File Management System (CFMS)', 'University of Education, Attock Campus', '2025-2026', 'Fall 2025', FALSE, 50, 'smtp.ue.edu.pk', 'Connected', 180, FALSE)
ON CONFLICT ("id") DO UPDATE SET "updated_at" = NOW();

-- 8. Insert Initial Announcements
INSERT INTO public."announcements" ("id", "title", "content", "authorName", "authorRole", "targetDepartmentId", "targetRole", "createdDate", "priority", "isPinned")
VALUES
  ('ann-1', 'HEC Quality Assurance Deadline for Fall 2025 Course Dossiers', 'All faculty members are hereby instructed to submit complete course dossiers for Fall 2025 before the upcoming academic audit deadline.', 'Dr. Sarah Ahmad', 'Head of Department (CS)', 'dept-cs', 'ALL', CURRENT_DATE::TEXT, 'High', TRUE),
  ('ann-2', 'New HEC OBE Standard Template Released', 'The QEC has published updated OBE-compliant course outline templates. Please download from the Templates & Guidelines section.', 'Prof. Dr. Muhammad Aslam', 'System Administrator & Dean', 'ALL', 'ALL', CURRENT_DATE::TEXT, 'Medium', FALSE)
ON CONFLICT ("id") DO NOTHING;

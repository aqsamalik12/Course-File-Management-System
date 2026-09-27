-- ==============================================================================
-- UNIVERSITY COURSE FILE MANAGEMENT SYSTEM (CFMS)
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- RUN THIS ENTIRE FILE IN THE SUPABASE SQL EDITOR TO CREATE ALL TABLES.
-- This is idempotent (safe to run multiple times).
-- ==============================================================================

-- 0. CAMPUSES TABLE (University of Education campuses)
CREATE TABLE IF NOT EXISTS public."campuses" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT DEFAULT '',
  "address" TEXT DEFAULT '',
  "directorName" TEXT DEFAULT '',
  "phone" TEXT DEFAULT '',
  "email" TEXT DEFAULT '',
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Inactive')),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public."departments" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "campusId" TEXT DEFAULT '',
  "campusName" TEXT DEFAULT '',
  "hodId" TEXT DEFAULT '',
  "hodName" TEXT DEFAULT 'Unassigned',
  "facultyCount" INTEGER DEFAULT 0,
  "courseCount" INTEGER DEFAULT 0,
  "submissionRate" NUMERIC DEFAULT 0,
  "building" TEXT DEFAULT '',
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
  "avatar" TEXT DEFAULT '',
  "role" TEXT NOT NULL CHECK ("role" IN ('ADMIN', 'HOD', 'REGULAR_TEACHER', 'VISITING_TEACHER')),
  "departmentId" TEXT DEFAULT '',
  "departmentName" TEXT DEFAULT '',
  "campusId" TEXT DEFAULT '',
  "campus" TEXT DEFAULT '',
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
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Inactive', 'Locked', 'Suspended')),
  "loginAttempts" INTEGER DEFAULT 0,
  "loginCount" INTEGER DEFAULT 0,
  "deleted" BOOLEAN DEFAULT FALSE,
  "lockUntil" TIMESTAMPTZ,
  "contractStartDate" TEXT,
  "contractEndDate" TEXT,
  "contractStatus" TEXT,
  "supervisorName" TEXT,
  "enrollmentStatus" TEXT DEFAULT 'ProfileIncomplete',
  "profileFormSubmitted" BOOLEAN DEFAULT FALSE,
  "createdAt" TEXT DEFAULT CURRENT_DATE::TEXT,
  "lastLogin" TEXT DEFAULT 'Never',
  "refreshToken" TEXT,
  "registeredAt" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HOD ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public."hod_assignments" (
  "id" TEXT PRIMARY KEY,
  "hodId" TEXT NOT NULL,
  "hodName" TEXT NOT NULL,
  "hodEmail" TEXT DEFAULT '',
  "campusId" TEXT NOT NULL,
  "campusName" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Inactive', 'Replaced')),
  "assignedDate" TEXT DEFAULT CURRENT_DATE::TEXT,
  "assignedBy" TEXT DEFAULT '',
  "replacedDate" TEXT,
  "replacedBy" TEXT,
  "notes" TEXT DEFAULT '',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSES TABLE
CREATE TABLE IF NOT EXISTS public."courses" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "campusId" TEXT DEFAULT '',
  "campusName" TEXT DEFAULT '',
  "credits" INTEGER DEFAULT 3,
  "type" TEXT DEFAULT 'Core' CHECK ("type" IN ('Core', 'Elective', 'Lab')),
  "assignedTeacherId" TEXT DEFAULT '',
  "assignedTeacherName" TEXT DEFAULT 'Unassigned',
  "assignedTeacherRole" TEXT DEFAULT 'REGULAR_TEACHER',
  "semester" TEXT DEFAULT 'Semester 1',
  "academicSession" TEXT DEFAULT '',
  "totalStudents" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'Active' CHECK ("status" IN ('Active', 'Archived')),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROGRAMS TABLE
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

-- 6. ACADEMIC SESSIONS TABLE
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

-- 7. SUBMISSION WINDOWS TABLE
CREATE TABLE IF NOT EXISTS public."submission_windows" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "sessionName" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Closed',
  "allowLateSubmission" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COURSE FILES TABLE
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
  "fileSize" TEXT DEFAULT '0 KB',
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

-- 9. TEACHER ENROLLMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public."teacher_requests" (
  "id" TEXT PRIMARY KEY,
  "teacherId" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "teacherEmail" TEXT NOT NULL,
  "teacherType" TEXT NOT NULL CHECK ("teacherType" IN ('REGULAR_TEACHER', 'VISITING_TEACHER')),
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "campusId" TEXT DEFAULT '',
  "campusName" TEXT DEFAULT '',
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

-- 10. DEADLINES TABLE
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

-- 11. ANNOUNCEMENTS TABLE
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

-- 12. TEMPLATES TABLE
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

-- 13. SUBMISSION INSTRUCTIONS TABLE
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

-- 14. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public."system_settings" (
  "id" TEXT PRIMARY KEY DEFAULT 'current-system-settings',
  "systemName" TEXT DEFAULT 'University Course File Management System (CFMS)',
  "universityName" TEXT DEFAULT 'University of Education',
  "academicYear" TEXT DEFAULT '',
  "currentSession" TEXT DEFAULT '',
  "mfaRequired" BOOLEAN DEFAULT FALSE,
  "maxFileSizeMB" INTEGER DEFAULT 50,
  "allowedExtensions" JSONB DEFAULT '[".pdf", ".docx", ".zip", ".xlsx", ".ppt"]'::JSONB,
  "smtpHost" TEXT DEFAULT '',
  "smtpStatus" TEXT DEFAULT 'Not Configured',
  "autoArchivingDays" INTEGER DEFAULT 180,
  "maintenanceMode" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUDIT LOGS TABLE
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

-- 16. FEEDBACK TABLE
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

-- 17. NOTIFICATIONS TABLE
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

-- 18. ARCHIVES TABLE
CREATE TABLE IF NOT EXISTS public."archives" (
  "id" TEXT PRIMARY KEY,
  "courseFileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "courseCode" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "academicSession" TEXT DEFAULT '',
  "archivedAt" TEXT DEFAULT CURRENT_DATE::TEXT,
  "archivedBy" TEXT DEFAULT 'System',
  "fileUrl" TEXT DEFAULT '#',
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 19. TEACHER ENROLLMENT REQUESTS TABLE
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

-- 20. HOD ASSIGNMENTS TABLE (Admin source-of-truth for HOD authorization & scope)
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

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY AND PERMISSIVE POLICIES (for service_role access)
-- ==============================================================================
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
-- INITIAL ESSENTIAL SEED DATA
-- Only the admin account and system settings. No fake campuses, departments, or courses.
-- ==============================================================================

-- Admin User (password: Admin@123)
INSERT INTO public."users" ("id", "name", "email", "passwordHash", "role", "designation", "status", "createdAt", "lastLogin", "employeeId")
VALUES
  ('usr-admin', 'Administrator', 'admin@ue.edu.pk', '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K', 'ADMIN', 'System Administrator', 'Active', CURRENT_DATE::TEXT, 'Never', 'EMP-ADMIN-001')
ON CONFLICT ("id") DO NOTHING;

-- System Settings
INSERT INTO public."system_settings" ("id", "systemName", "universityName", "mfaRequired", "maxFileSizeMB", "autoArchivingDays", "maintenanceMode")
VALUES
  ('current-system-settings', 'University Course File Management System (CFMS)', 'University of Education', FALSE, 50, 180, FALSE)
ON CONFLICT ("id") DO UPDATE SET "updated_at" = NOW();

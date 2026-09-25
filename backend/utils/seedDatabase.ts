import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const seedInitialData = async () => {
  try {
    // Check if users table exists and if it already has records
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
        logger.info('[DB Seed] Supabase tables pending initialization. Run "supabase_schema.sql" in Supabase SQL editor.');
        return;
      }
      logger.warn(`[DB Seed] Check warning: ${error.message}`);
      return;
    }

    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    if (count && count > 0 && courseCount && courseCount >= 6) {
      logger.info('[DB Seed] Supabase database is already populated.');
      return;
    }

    logger.info('[DB Seed] Seeding initial university data into Supabase...');

    // 1. Initial Departments
    const departments = [
      {
        id: 'dept-cs',
        code: 'CS',
        name: 'Computer Science',
        hodId: 'usr-hod-cs',
        hodName: 'Dr. Sarah Ahmad',
        facultyCount: 18,
        courseCount: 42,
        submissionRate: 92,
        building: 'Academic Block A (IT Wing)'
      },
      {
        id: 'dept-math',
        code: 'MATH',
        name: 'Mathematics',
        hodId: 'usr-hod-math',
        hodName: 'Dr. Usman Ghani',
        facultyCount: 12,
        courseCount: 28,
        submissionRate: 88,
        building: 'Science Block B'
      },
      {
        id: 'dept-eng',
        code: 'ENG',
        name: 'English Literature',
        hodId: 'usr-hod-eng',
        hodName: 'Dr. Ayesha Malik',
        facultyCount: 10,
        courseCount: 22,
        submissionRate: 95,
        building: 'Humanities Block C'
      }
    ];
    await supabase.from('departments').upsert(departments);

    // 2. Initial Users
    const users = [
      {
        id: 'usr-admin',
        name: 'Prof. Dr. Muhammad Aslam',
        email: 'admin@ue.edu.pk',
        passwordHash: '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K',
        role: 'ADMIN',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        designation: 'System Administrator & Dean',
        phone: '+92 300 1234567',
        status: 'Active',
        createdAt: '2024-01-15',
        lastLogin: new Date().toISOString().split('T')[0],
        employeeId: 'EMP-ADMIN-001'
      },
      {
        id: 'usr-hod-cs',
        name: 'Dr. Sarah Ahmad',
        email: 'hod.cs@ue.edu.pk',
        passwordHash: '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K',
        role: 'HOD',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        designation: 'Head of Department (CS)',
        phone: '+92 301 9876543',
        status: 'Active',
        createdAt: '2024-02-01',
        lastLogin: new Date().toISOString().split('T')[0],
        employeeId: 'EMP-HOD-002'
      },
      {
        id: 'usr-teacher-1',
        name: 'Dr. Tariq Mahmood',
        email: 'tariq.mahmood@ue.edu.pk',
        passwordHash: '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K',
        role: 'REGULAR_TEACHER',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        designation: 'Assistant Professor',
        phone: '+92 321 4567890',
        status: 'Active',
        createdAt: '2024-03-10',
        lastLogin: new Date().toISOString().split('T')[0],
        employeeId: 'EMP-FAC-003'
      },
      {
        id: 'usr-visiting-1',
        name: 'Engr. Bilal Khan',
        email: 'bilal.visiting@ue.edu.pk',
        passwordHash: '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K',
        role: 'VISITING_TEACHER',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        designation: 'Visiting Lecturer',
        phone: '+92 333 7890123',
        status: 'Active',
        contractStartDate: '2025-09-01',
        contractEndDate: '2026-08-31',
        contractStatus: 'Active',
        supervisorName: 'Dr. Sarah Ahmad',
        createdAt: '2025-08-25',
        lastLogin: new Date().toISOString().split('T')[0],
        employeeId: 'EMP-VIS-004'
      }
    ];
    await supabase.from('users').upsert(users);

    // 3. Initial Courses
    const courses = [
      {
        id: 'course-1',
        code: 'CS-401',
        title: 'Advanced Software Engineering',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 3,
        type: 'Core',
        assignedTeacherId: 'usr-teacher-1',
        assignedTeacherName: 'Dr. Tariq Mahmood',
        assignedTeacherRole: 'REGULAR_TEACHER',
        semester: 'Semester 7',
        academicSession: 'Fall 2025',
        totalStudents: 45,
        status: 'Active'
      },
      {
        id: 'course-2',
        code: 'CS-302',
        title: 'Database Management Systems',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 4,
        type: 'Core',
        assignedTeacherId: 'usr-visiting-1',
        assignedTeacherName: 'Engr. Bilal Khan',
        assignedTeacherRole: 'VISITING_TEACHER',
        semester: 'Semester 5',
        academicSession: 'Fall 2025',
        totalStudents: 52,
        status: 'Active'
      },
      {
        id: 'course-3',
        code: 'CS-201',
        title: 'Data Structures & Algorithms',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 4,
        type: 'Core',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'REGULAR_TEACHER',
        semester: 'Semester 3',
        academicSession: 'Fall 2025',
        totalStudents: 55,
        status: 'Active'
      },
      {
        id: 'course-4',
        code: 'CS-101',
        title: 'Introduction to Computer Programming',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 3,
        type: 'Core',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'REGULAR_TEACHER',
        semester: 'Semester 1',
        academicSession: 'Fall 2025',
        totalStudents: 60,
        status: 'Active'
      },
      {
        id: 'course-101L',
        code: 'CS-101L',
        title: 'Computer Programming Lab',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 2,
        type: 'Lab',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'VISITING_TEACHER',
        semester: 'Semester 1',
        academicSession: 'Fall 2025',
        totalStudents: 60,
        status: 'Active'
      },
      {
        id: 'course-201L',
        code: 'CS-201L',
        title: 'Data Structures Lab',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 2,
        type: 'Lab',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'VISITING_TEACHER',
        semester: 'Semester 3',
        academicSession: 'Fall 2025',
        totalStudents: 55,
        status: 'Active'
      },
      {
        id: 'course-302L',
        code: 'CS-302L',
        title: 'Database Systems Lab',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 2,
        type: 'Lab',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'VISITING_TEACHER',
        semester: 'Semester 5',
        academicSession: 'Fall 2025',
        totalStudents: 50,
        status: 'Active'
      },
      {
        id: 'course-405',
        code: 'CS-405',
        title: 'Computer Networks & Security',
        departmentId: 'dept-cs',
        departmentName: 'Computer Science',
        credits: 4,
        type: 'Core',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'REGULAR_TEACHER',
        semester: 'Semester 6',
        academicSession: 'Fall 2025',
        totalStudents: 48,
        status: 'Active'
      },
      {
        id: 'course-math-1',
        code: 'MTH-101',
        title: 'Calculus & Analytical Geometry',
        departmentId: 'dept-math',
        departmentName: 'Mathematics',
        credits: 3,
        type: 'Core',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'REGULAR_TEACHER',
        semester: 'Semester 1',
        academicSession: 'Fall 2025',
        totalStudents: 40,
        status: 'Active'
      },
      {
        id: 'course-math-2',
        code: 'MTH-201',
        title: 'Linear Algebra & Differential Equations',
        departmentId: 'dept-math',
        departmentName: 'Mathematics',
        credits: 3,
        type: 'Core',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'REGULAR_TEACHER',
        semester: 'Semester 3',
        academicSession: 'Fall 2025',
        totalStudents: 38,
        status: 'Active'
      },
      {
        id: 'course-eng-1',
        code: 'ENG-101',
        title: 'Functional English & Communication',
        departmentId: 'dept-eng',
        departmentName: 'English Literature',
        credits: 3,
        type: 'Core',
        assignedTeacherId: '',
        assignedTeacherName: 'Unassigned',
        assignedTeacherRole: 'REGULAR_TEACHER',
        semester: 'Semester 1',
        academicSession: 'Fall 2025',
        totalStudents: 50,
        status: 'Active'
      }
    ];
    await supabase.from('courses').upsert(courses);

    // 4. Initial Academic Session & Submission Window
    await supabase.from('academic_sessions').upsert([
      {
        id: 'sess-fall2025',
        name: 'Fall 2025',
        term: 'Fall',
        year: 2025,
        startDate: '2025-09-01',
        endDate: '2026-02-15',
        isCurrent: true,
        status: 'Active',
        fileCount: 42
      }
    ]);

    await supabase.from('submission_windows').upsert([
      {
        id: 'sub-window-1',
        sessionId: 'sess-fall2025',
        sessionName: 'Fall 2025',
        startDate: '2025-09-01',
        endDate: '2026-02-15',
        status: 'Submission Window Active',
        allowLateSubmission: true
      }
    ]);

    logger.info('[DB Seed] Initial university data successfully seeded into Supabase!');
  } catch (error: any) {
    logger.error(`[DB Seed Error] ${error.message}`);
  }
};

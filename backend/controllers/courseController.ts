import { Request, Response } from 'express';
import { CourseService, HODAssignmentService, UserService, TeacherAssignmentService } from '../services/supabaseService';

export const getCourses = async (req: Request, res: Response) => {
  try {
    let courses = await CourseService.getAll();
    const { departmentId, search } = req.query;

    const headerUserId = req.headers['x-user-id'] as string;
    const headerRole = req.headers['x-user-role'] as string;
    const user = (req as any).user;
    const callerId = user?.id || headerUserId;
    const callerRole = user?.role || headerRole;

    if (callerRole === 'HOD' && callerId) {
      const assignment = await HODAssignmentService.getActiveByHodId(callerId);
      const hodUser = await UserService.getById(callerId);
      const deptId = assignment?.departmentId || hodUser?.departmentId;
      if (deptId) {
        courses = courses.filter((c: any) => c.departmentId === deptId);
      }
    } else if (departmentId) {
      courses = courses.filter((c: any) => c.departmentId === departmentId);
    }

    if (search) {
      const s = String(search).toLowerCase();
      courses = courses.filter(
        (c: any) =>
          (c.code && c.code.toLowerCase().includes(s)) ||
          (c.title && c.title.toLowerCase().includes(s)) ||
          (c.departmentName && c.departmentName.toLowerCase().includes(s))
      );
    }

    return res.json({ success: true, count: courses.length, data: courses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseData = req.body;
    const newId = courseData.id || `course-${Date.now()}`;
    const newCourse = { ...courseData, id: newId, status: courseData.status || 'Active' };
    const saved = await CourseService.create(newCourse);
    return res.status(201).json({ success: true, message: 'Course created successfully', data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await CourseService.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.json({ success: true, message: 'Course updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CourseService.delete(id);
    return res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/courses/my-courses
 * Returns the individual course assignments belonging to the authenticated teacher.
 * Each course includes its own Batch, Semester, Credit Hours, Session, and Academic Year.
 */
export const getMyCourses = async (req: Request, res: Response) => {
  try {
    const headerUserId = req.headers['x-user-id'] as string;
    const user = (req as any).user;
    const teacherId = (req.query.teacherId as string) || user?.id || headerUserId;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher ID is required to fetch course assignments.' });
    }

    const teacher = await UserService.getById(teacherId);
    const assignments = await TeacherAssignmentService.getByTeacherId(teacherId, true);

    // Format assignments ensuring Batch and Semester are present
    const formatted = assignments.map((a: any) => ({
      id: a.id,
      courseId: a.courseId || a.id,
      courseName: a.courseName || a.title || 'Course',
      courseCode: a.courseCode || a.code || 'CS-101',
      creditHours: Number(a.creditHours || a.credits || 3),
      credits: Number(a.creditHours || a.credits || 3),
      batch: a.batch || a.sectionName || a.section || (teacher?.profileFormData as any)?.batch || 'BSCS 2023–26',
      semester: a.semester || '1st Semester',
      session: a.session || a.academicSession?.split(' ')[0] || teacher?.sessionType || 'Spring',
      academicYear: a.academicYear || teacher?.academicYear || '2024–25',
      campusId: a.campusId || teacher?.campusId,
      campusName: a.campusName || teacher?.campus,
      departmentId: a.departmentId || teacher?.departmentId,
      departmentName: a.departmentName || teacher?.departmentName,
      hodId: a.hodId || teacher?.hodId,
      hodName: a.hodName || teacher?.hodName,
      created_at: a.created_at
    }));

    // If no assignments in TeacherAssignmentService, check user.courses array
    if (formatted.length === 0 && Array.isArray(teacher?.courses) && teacher.courses.length > 0) {
      const fallbackList = teacher.courses.map((c: any, idx: number) => ({
        id: c.id || `asgn-fb-${idx}`,
        courseId: c.courseId || c.id || `crs-${idx}`,
        courseName: c.courseName || c.title || c.name || 'Course',
        courseCode: c.courseCode || c.code || `CS-${101 + idx}`,
        creditHours: Number(c.creditHours || c.credits || 3),
        credits: Number(c.creditHours || c.credits || 3),
        batch: c.batch || (teacher.profileFormData as any)?.batch || 'BSCS 2023–26',
        semester: c.semester || `${idx + 1}th Semester`,
        session: c.session || teacher.sessionType || 'Spring',
        academicYear: c.academicYear || teacher.academicYear || '2024–25',
        campusId: teacher.campusId,
        campusName: teacher.campus,
        departmentId: teacher.departmentId,
        departmentName: teacher.departmentName,
        hodId: teacher.hodId,
        hodName: teacher.hodName
      }));
      return res.json({ success: true, count: fallbackList.length, data: fallbackList });
    }

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/courses/my-courses
 * Creates an individual course assignment for a teacher.
 * Mandatory fields: Course Name, Course Code, Batch, Semester, Credit Hours.
 * Prevents duplicates for the same teacher + course + batch + semester + academicYear.
 */
export const assignMyCourse = async (req: Request, res: Response) => {
  try {
    const headerUserId = req.headers['x-user-id'] as string;
    const user = (req as any).user;
    const teacherId = (req.body.teacherId as string) || user?.id || headerUserId;

    const {
      courseName,
      courseCode,
      creditHours,
      batch,
      semester,
      session: inputSession,
      academicYear: inputAcademicYear
    } = req.body;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher authentication required.' });
    }

    const teacher = await UserService.getById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher record not found.' });
    }

    // 1. Mandatory Fields Validation
    if (!courseName || !courseName.trim()) {
      return res.status(400).json({ success: false, message: 'Course Name is required.' });
    }
    if (!courseCode || !courseCode.trim()) {
      return res.status(400).json({ success: false, message: 'Course Code is required.' });
    }
    if (!batch || !batch.trim()) {
      return res.status(400).json({ success: false, message: 'Batch is mandatory for every course.' });
    }
    if (!semester || !semester.trim()) {
      return res.status(400).json({ success: false, message: 'Semester is mandatory for every course.' });
    }

    const finalCredits = Number(creditHours) || 3;
    if (finalCredits <= 0) {
      return res.status(400).json({ success: false, message: 'Credit Hours must be a positive number.' });
    }

    const cleanName = courseName.trim();
    const cleanCode = courseCode.trim().toUpperCase();
    const cleanBatch = batch.trim();
    const cleanSemester = semester.trim();
    const cleanSession = inputSession || teacher.sessionType || (teacher.profileFormData as any)?.sessionType || 'Spring';
    const cleanAcademicYear = inputAcademicYear || teacher.academicYear || (teacher.profileFormData as any)?.academicYear || '2024–25';

    // 2. Duplicate Prevention: A Teacher should not add the exact same Teacher + Course + Batch + Semester + Academic Year
    const existingAssignments = await TeacherAssignmentService.getByTeacherId(teacherId, true);
    const isDuplicate = existingAssignments.some((a: any) => {
      const codeMatch = (a.courseCode || a.code || '').trim().toUpperCase() === cleanCode;
      const batchMatch = (a.batch || a.sectionName || '').trim().toLowerCase() === cleanBatch.toLowerCase();
      const semMatch = (a.semester || '').trim().toLowerCase() === cleanSemester.toLowerCase();
      const yearMatch = (a.academicYear || '').trim().toLowerCase() === cleanAcademicYear.toLowerCase();
      return codeMatch && batchMatch && semMatch && yearMatch;
    });

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: `This course (${cleanCode}) is already assigned to Batch "${cleanBatch}" and "${cleanSemester}" for Academic Year ${cleanAcademicYear}. Duplicate course assignments are prevented.`
      });
    }

    const assignmentId = `asgn-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const courseId = `crs-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const assignmentRecord = {
      id: assignmentId,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      courseId,
      courseName: cleanName,
      courseCode: cleanCode,
      creditHours: finalCredits,
      credits: finalCredits,
      batch: cleanBatch,
      semester: cleanSemester,
      session: cleanSession,
      academicYear: cleanAcademicYear,
      academicSession: `${cleanSession} ${cleanAcademicYear}`,
      campusId: teacher.campusId || 'camp-attock',
      campusName: teacher.campus || teacher.campusName || 'Attock Campus',
      departmentId: teacher.departmentId || 'dept-cs',
      departmentName: teacher.departmentName || 'Department of Computer Science',
      hodId: teacher.hodId || '',
      hodName: teacher.hodName || 'Department HOD',
      active: true,
      created_at: nowIso,
      updated_at: nowIso
    };

    const saved = await TeacherAssignmentService.create(assignmentRecord);

    // Also register course into CourseService catalog if not present
    const allCourses = await CourseService.getAll();
    const existingCatalogCourse = allCourses.find((c: any) => c.code === cleanCode && c.departmentId === teacher.departmentId);
    if (!existingCatalogCourse) {
      await CourseService.create({
        id: courseId,
        code: cleanCode,
        title: cleanName,
        credits: finalCredits,
        departmentId: teacher.departmentId,
        departmentName: teacher.departmentName,
        assignedTeacherId: teacher.id,
        assignedTeacherName: teacher.name,
        assignedTeacherRole: teacher.role,
        batch: cleanBatch,
        semester: cleanSemester,
        status: 'Active'
      });
    }

    // Keep user record's courses array synchronized
    const currentCourses = Array.isArray(teacher.courses) ? [...teacher.courses] : [];
    currentCourses.push(assignmentRecord);
    await UserService.update(teacher.id, {
      courses: currentCourses
    });

    return res.status(201).json({
      success: true,
      message: `Course "${cleanName}" (${cleanCode}) successfully assigned to ${cleanBatch} - ${cleanSemester}.`,
      data: saved
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/courses/my-courses/:id
 * Removes a course assignment for the teacher.
 */
export const deleteMyCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TeacherAssignmentService.delete(id);
    return res.json({ success: true, message: 'Course assignment removed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export interface ITeacherAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  departmentId: string;
  departmentName: string;
  sectionId: string;
  sectionName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits?: number;
  hodId: string;
  hodName: string;
  campusId?: string;
  campusName?: string;
  academicSession?: string;
  active: boolean;
  assignedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export default ITeacherAssignment;

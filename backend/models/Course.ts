export interface ICourse {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  departmentName: string;
  credits?: number;
  type?: 'Core' | 'Elective' | 'Lab';
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  assignedTeacherRole?: 'ADMIN' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  semester?: string;
  academicSession?: string;
  totalStudents?: number;
  status?: 'Active' | 'Archived';
}

export default ICourse;

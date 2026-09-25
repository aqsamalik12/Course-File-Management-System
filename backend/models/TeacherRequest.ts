export type TeacherType = 'REGULAR_TEACHER' | 'VISITING_TEACHER';
export type TeacherRequestStatus = 'PendingHODApproval' | 'Approved' | 'Rejected' | 'NeedsUpdate';

export interface ISelectedCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  type?: 'Core' | 'Elective' | 'Lab';
}

export interface ITeacherRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherType: TeacherType;
  departmentId: string;
  departmentName: string;
  hodId?: string;
  hodName?: string;
  selectedCourses: ISelectedCourse[];
  totalCredits: number;
  creditLimit: number;
  status: TeacherRequestStatus;
  rejectionReason?: string;
  profileData?: Record<string, any>;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export default ITeacherRequest;

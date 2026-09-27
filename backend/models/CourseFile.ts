export interface IVersionItem {
  id: string;
  versionNumber: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedByRole: 'ADMIN' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  uploadedAt: string;
  changeLog?: string;
  fileUrl?: string;
}

export interface ICourseFileTemplateData {
  courseDescription?: string;
  courseObjectives?: string;
  clos?: Array<{ code: string; description: string; plo: string }> | string;
  weeklyPlan?: Array<{ week: number; topic: string; activity: string }> | string;
  assessmentBreakdown?: { quizzes?: number; assignments?: number; midterm?: number; finalExam?: number; lab?: number } | string;
  recommendedBooks?: string;
  teachingMethodology?: string;
  additionalNotes?: string;
}

export interface ICourseFile {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits?: number;
  campusId?: string;
  campusName?: string;
  departmentId: string;
  departmentName: string;
  hodId?: string;
  hodName?: string;
  batch?: string;
  session?: string;
  semester?: '1st Semester' | '2nd Semester' | '3rd Semester' | '4th Semester' | string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherRole: 'ADMIN' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER' | string;
  title: string;
  category?: string;
  currentVersion?: string;
  fileType?: 'PDF' | 'DOCX' | 'PPT' | 'ZIP' | 'XLSX' | string;
  fileSize?: string;
  fileUrl?: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Returned' | 'Rejected' | string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  remarks?: string;
  templateData?: ICourseFileTemplateData;
  uploadDate?: string;
  lastModified?: string;
  archived?: boolean;
  deleted?: boolean;
  deletedAt?: string;
  versionHistory?: IVersionItem[];
  approvalStage?: string;
}

export default ICourseFile;

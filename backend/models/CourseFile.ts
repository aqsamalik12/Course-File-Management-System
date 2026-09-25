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

export interface ICourseFile {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  departmentId: string;
  departmentName: string;
  teacherId: string;
  teacherName: string;
  teacherRole: 'ADMIN' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  title: string;
  category: string;
  currentVersion?: string;
  fileType?: 'PDF' | 'DOCX' | 'PPT' | 'ZIP' | 'XLSX';
  fileSize?: string;
  fileUrl?: string;
  status?: string;
  uploadDate?: string;
  lastModified?: string;
  archived?: boolean;
  deleted?: boolean;
  deletedAt?: string;
  remarks?: string;
  versionHistory?: IVersionItem[];
  approvalStage?: string;
}

export default ICourseFile;

export interface IArchive {
  id: string;
  courseFileId: string;
  title: string;
  courseCode: string;
  departmentId: string;
  departmentName: string;
  teacherName: string;
  academicSession?: string;
  archivedAt?: string;
  archivedBy?: string;
  fileUrl?: string;
}

export default IArchive;

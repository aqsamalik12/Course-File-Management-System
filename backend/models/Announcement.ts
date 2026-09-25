export interface IAnnouncement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  targetDepartmentId?: string;
  targetRole?: 'ALL' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  createdDate?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  isPinned?: boolean;
}

export default IAnnouncement;

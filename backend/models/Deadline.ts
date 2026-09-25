export interface IDeadline {
  id: string;
  title: string;
  courseCode?: string;
  category?: string;
  departmentId: string;
  departmentName: string;
  dueDate: string;
  gracePeriodDays?: number;
  status?: 'Upcoming' | 'Completed' | 'Missed' | 'Extended';
  description?: string;
  targetRole?: 'ALL' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
}

export default IDeadline;

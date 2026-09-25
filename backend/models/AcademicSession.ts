export interface IAcademicSession {
  id: string;
  name: string;
  term?: 'Fall' | 'Spring' | 'Summer';
  year: number;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  status?: 'Active' | 'Locked' | 'Archived';
  fileCount?: number;
}

export default IAcademicSession;

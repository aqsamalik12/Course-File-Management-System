export interface INotification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  timestamp?: string;
  isRead?: boolean;
  targetRole?: 'ALL' | 'ADMIN' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  linkModule?: string;
}

export default INotification;

export interface IFeedback {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  departmentName: string;
  subject: string;
  message: string;
  status?: 'Open' | 'In Progress' | 'Resolved';
  createdAt?: string;
  response?: string;
}

export default IFeedback;

export interface ISubmissionWindow {
  id: string;
  sessionId: string;
  sessionName: string;
  startDate: string;
  endDate: string;
  status?: string;
  allowLateSubmission?: boolean;
}

export default ISubmissionWindow;

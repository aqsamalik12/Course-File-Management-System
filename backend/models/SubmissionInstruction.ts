export interface ISubmissionInstruction {
  id: string;
  title: string;
  content: string;
  fileName?: string;
  fileUrl?: string;
  category?: string;
  updatedAtStr?: string;
}

export default ISubmissionInstruction;

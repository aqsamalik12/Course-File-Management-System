export interface ITemplate {
  id: string;
  title: string;
  description?: string;
  format?: string;
  fileName: string;
  fileUrl?: string;
  uploadedBy?: string;
  targetRole?: string;
  uploadedAt?: string;
}

export default ITemplate;

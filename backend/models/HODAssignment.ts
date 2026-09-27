export interface IHODAssignment {
  id: string;
  hodId: string;
  hodName: string;
  hodEmail: string;
  campusId: string;
  campusName: string;
  departmentId: string;
  departmentName: string;
  status: 'Active' | 'Inactive';
  assignedDate: string;
  assignedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export default IHODAssignment;

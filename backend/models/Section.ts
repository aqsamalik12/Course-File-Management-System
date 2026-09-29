export interface ISection {
  id: string;
  departmentId: string;
  departmentName?: string;
  name: string; // e.g. 'BSCS-5A', 'BSCS-7A', 'BSMath-3A', 'BBA-2B'
  campusId?: string;
  campusName?: string;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export default ISection;

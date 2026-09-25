export interface IDepartment {
  id: string;
  code: string;
  name: string;
  hodId?: string;
  hodName?: string;
  facultyCount?: number;
  courseCount?: number;
  submissionRate?: number;
  building?: string;
}

export default IDepartment;

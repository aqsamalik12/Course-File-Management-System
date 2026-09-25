export interface IProgram {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
  degreeLevel?: 'BS' | 'MS' | 'MPhil' | 'PhD';
  durationYears?: number;
}

export default IProgram;

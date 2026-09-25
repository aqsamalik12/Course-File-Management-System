export interface IAuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  role: string;
  resource: string;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
  severity?: 'INFO' | 'LOW' | 'MEDIUM' | 'WARNING' | 'HIGH' | 'CRITICAL';
  signature?: string;
}

export default IAuditLog;

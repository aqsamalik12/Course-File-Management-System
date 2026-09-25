export interface ISystemSetting {
  id?: string;
  systemName?: string;
  universityName?: string;
  academicYear?: string;
  currentSession?: string;
  mfaRequired?: boolean;
  maxFileSizeMB?: number;
  allowedExtensions?: string[];
  smtpHost?: string;
  smtpStatus?: 'Connected' | 'Error';
  autoArchivingDays?: number;
  maintenanceMode?: boolean;
}

export default ISystemSetting;

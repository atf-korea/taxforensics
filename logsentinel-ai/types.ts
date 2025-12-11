
export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  LOGS = 'LOGS',
  FORENSICS = 'FORENSICS'
}

export enum LogCategory {
  PRODUCTIVITY = 'Productivity',
  ENTERTAINMENT = 'Entertainment',
  SYSTEM = 'System',
  COMMUNICATION = 'Communication',
  DEVELOPMENT = 'Development',
  UNCATEGORIZED = 'Uncategorized'
}

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string
  application: string;
  windowTitle: string;
  durationSeconds: number;
  category: LogCategory;
}

export enum ArtifactType {
  USB_DEVICE = 'USB_DEVICE',
  RECENT_DOC = 'RECENT_DOC',
  SHELLBAG = 'SHELLBAG'
}

export interface ForensicArtifact {
  id: string;
  timestamp: string;
  type: ArtifactType;
  name: string; // File name, Device Name, or Folder Name
  path: string; // Full path or Serial Number
  action: string; // 'Connected', 'Accessed', 'Modified'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
}

export interface ScanResult {
  logs: LogEntry[];
  artifacts: ForensicArtifact[];
}

export interface AppStats {
  name: string;
  totalDuration: number; // seconds
  percentage: number;
  category: LogCategory;
}

export interface DayActivity {
  date: string;
  hours: number;
}
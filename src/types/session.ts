export interface ActiveSession {
  sessionId: string;
  deviceInfo: string;
  browser: string;
  platform: string;
  lastHeartbeat: number;
  ip?: string;
  createdAt: number;
}

export interface SessionDocument {
  sessionId: string;
  studentId: string;
  username: string;
  createdAt: string;
  lastHeartbeat: number;
  deviceInfo: string;
  browser: string;
  platform: string;
  active: boolean;
  revokedAt?: string | null;
  revocationReason?: string;
}

export interface DeviceInfo {
  browser: string;
  platform: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userAgent: string;
  summary: string;
}

export type UserRole = 'admin' | 'student';

export type AccountStatus = 'active' | 'expired' | 'locked';

export interface AuthUser {
  uid: string;
  username: string;
  email?: string;
  role: UserRole;
  fullName: string;
  status: AccountStatus;
  expiresAt?: string;
  sessionId?: string;
  isAdmin?: boolean;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: AuthUser;
  reason?: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_EXPIRED' | 'DEVICE_LOCKED' | 'NOT_FOUND' | 'ERROR';
  activeSession?: {
    browser: string;
    platform: string;
    deviceInfo: string;
    lastHeartbeat: number;
  };
}

export interface ActivationResult {
  success: boolean;
  message: string;
  studentId?: string;
  username?: string;
  durationDays?: number;
  newExpiresAt?: string;
}

export interface LoginTokenData {
  token: string;
  studentId: string;
  username: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
}

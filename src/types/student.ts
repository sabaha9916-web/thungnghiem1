import { AccountStatus } from './auth';
import { ActiveSession } from './session';

export interface StudentProgress {
  completedLessons: Record<number, boolean>;
  unitProgress: Record<string, number>;
  savedVocabIds: string[];
  quizBestScores: Record<string, number>;
  unlockedAchievements: string[];
  xp: number;
  streak: number;
  lastActiveDate: string;
}

export interface Student {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  expiresAt: string;
  durationDays: number;
  status: AccountStatus;
  activeSession: ActiveSession | null;
  progress: StudentProgress;
  notes: string;
}

export interface StudentFormData {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  durationDays: number;
  notes: string;
}

export interface AuditLog {
  id: string;
  action: string;
  targetUsername?: string;
  targetStudentId?: string;
  adminUsername?: string;
  details?: string;
  timestamp: string;
  ip?: string;
}

export interface ActivationCode {
  code: string;
  studentId?: string;
  username?: string;
  durationDays: number;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  usedBy?: string;
  notes?: string;
}

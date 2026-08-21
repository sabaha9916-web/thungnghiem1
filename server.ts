import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// ==================== IN-MEMORY DATA STORE ====================

interface StudentRecord {
  id: string;
  username: string;
  passwordHash: string; // Plain/hashed for simplicity
  fullName: string;
  phone?: string;
  email?: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'locked';
  notes?: string;
  currentSessionId?: string | null;
  lastActiveDevice?: string | null;
  lastSeen?: number | null;
  progressCount?: number;
}

interface ActiveSessionRecord {
  sessionId: string;
  username: string;
  deviceInfo: any;
  ip: string;
  loginTime: number;
  lastHeartbeat: number;
  revoked: boolean;
}

interface ActivationCodeRecord {
  id: string;
  code: string;
  days: number;
  createdAt: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
}

interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target?: string;
  details?: string;
}

interface StudentProgressRecord {
  completedPages: number[];
  xp: number;
  streak: number;
  lastActiveDate: string;
  savedVocabIds: string[];
  quizScores: Record<string, { score: number; total: number; timestamp: string }>;
}

// Initial Mock / Seed Data
const students: Map<string, StudentRecord> = new Map();
const activeSessions: Map<string, ActiveSessionRecord> = new Map(); // key = username
const activationCodes: Map<string, ActivationCodeRecord> = new Map();
const auditLogs: AuditLogRecord[] = [];
const progressStore: Map<string, StudentProgressRecord> = new Map();
const loginTokens: Map<string, { studentId: string; expiresAt: number }> = new Map();

// Seed initial student
const seedExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
students.set('hocvien01', {
  id: 'st_01',
  username: 'hocvien01',
  passwordHash: '123',
  fullName: 'Nguyễn Văn An',
  phone: '0912345678',
  email: 'an.nguyen@bachai.edu.vn',
  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: seedExpiry,
  status: 'active',
  notes: 'Học viên khóa cơ bản 100 trang',
  currentSessionId: null,
  lastActiveDevice: null,
  lastSeen: null,
  progressCount: 5
});

progressStore.set('hocvien01', {
  completedPages: [1, 2, 3, 4, 5],
  xp: 250,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  savedVocabIds: ['u1_01', 'u1_02', 'u1_05'],
  quizScores: {
    'unit_1': { score: 8, total: 10, timestamp: new Date().toISOString() }
  }
});

// Seed some activation codes
['ACT6-8899-1601', 'ACT6-2026-BH99', 'ACT6-K8F2-P9Q4'].forEach((code, idx) => {
  activationCodes.set(code, {
    id: `act_${idx + 1}`,
    code,
    days: 90,
    createdAt: new Date().toISOString(),
    isUsed: false
  });
});

function logAudit(actor: string, action: string, target?: string, details?: string) {
  auditLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    target,
    details
  });
  if (auditLogs.length > 200) auditLogs.pop();
}

// ==================== AUTH API ROUTES ====================

// 1. Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password, deviceInfo } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, reason: 'INVALID_INPUT', message: 'Vui lòng nhập đầy đủ thông tin.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();

  // Check Admin
  if (cleanUsername === 'admin' && password === '9916') {
    const adminUser = {
      username: 'admin',
      fullName: 'Quản Trị Viên (Admin)',
      role: 'admin',
      sessionId: `sess_admin_${Date.now()}`,
      status: 'active'
    };
    logAudit('admin', 'ADMIN_LOGIN', 'admin', 'Đăng nhập trang quản trị');
    return res.json({ success: true, user: adminUser });
  }

  // Check Student
  const student = students.get(cleanUsername);
  if (!student) {
    return res.status(401).json({ success: false, reason: 'NOT_FOUND', message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  if (student.passwordHash !== password) {
    return res.status(401).json({ success: false, reason: 'WRONG_PASSWORD', message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  if (student.status === 'locked') {
    return res.status(403).json({ success: false, reason: 'ACCOUNT_LOCKED', message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ trung tâm.' });
  }

  const now = Date.now();
  const expiryTime = new Date(student.expiresAt).getTime();
  if (expiryTime <= now) {
    student.status = 'expired';
    return res.status(403).json({ success: false, reason: 'ACCOUNT_EXPIRED', message: 'Tài khoản đã hết hạn sử dụng giáo trình.' });
  }

  // Check Single Device Lock
  const existingSession = activeSessions.get(cleanUsername);
  const newSessionId = `sess_${cleanUsername}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const currentIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (existingSession && !existingSession.revoked) {
    // If heartbeat received within 90 seconds and it's a different session
    const isLive = now - existingSession.lastHeartbeat < 90 * 1000;
    if (isLive) {
      // Return DEVICE_LOCKED
      return res.status(409).json({
        success: false,
        reason: 'DEVICE_LOCKED',
        message: 'Tài khoản đang đăng nhập trên một thiết bị khác.',
        activeSession: {
          browser: existingSession.deviceInfo?.browser || 'Trình duyệt khác',
          platform: existingSession.deviceInfo?.platform || 'Thiết bị khác',
          ip: existingSession.ip,
          loginTime: new Date(existingSession.loginTime).toLocaleTimeString('vi-VN')
        }
      });
    }
  }

  // Establish new active session
  activeSessions.set(cleanUsername, {
    sessionId: newSessionId,
    username: cleanUsername,
    deviceInfo: deviceInfo || {},
    ip: currentIp,
    loginTime: now,
    lastHeartbeat: now,
    revoked: false
  });

  student.currentSessionId = newSessionId;
  student.lastActiveDevice = deviceInfo?.summary || 'Thiết bị Web';
  student.lastSeen = now;

  logAudit(cleanUsername, 'STUDENT_LOGIN', cleanUsername, `Đăng nhập từ ${deviceInfo?.summary || 'Web'}`);

  return res.json({
    success: true,
    user: {
      username: student.username,
      fullName: student.fullName,
      role: 'student',
      expiresAt: student.expiresAt,
      sessionId: newSessionId,
      status: student.status
    }
  });
});

// 2. Validate session
app.get('/api/sessions/validate', (req: Request, res: Response) => {
  const { username, sessionId } = req.query;
  if (!username || !sessionId) {
    return res.json({ valid: false, reason: 'MISSING_PARAMS' });
  }

  const u = String(username).toLowerCase();
  if (u === 'admin') {
    return res.json({ valid: true, user: { username: 'admin', fullName: 'Quản Trị Viên (Admin)', role: 'admin', status: 'active' } });
  }

  const session = activeSessions.get(u);
  const student = students.get(u);

  if (!student || student.status === 'locked') {
    return res.json({ valid: false, reason: 'ACCOUNT_INVALID_OR_LOCKED' });
  }

  if (!session || session.sessionId !== sessionId || session.revoked) {
    return res.json({ valid: false, reason: 'SESSION_REVOKED' });
  }

  return res.json({
    valid: true,
    user: {
      username: student.username,
      fullName: student.fullName,
      role: 'student',
      expiresAt: student.expiresAt,
      sessionId: session.sessionId,
      status: student.status
    }
  });
});

// 3. Heartbeat
app.post('/api/sessions/heartbeat', (req: Request, res: Response) => {
  const { username, sessionId } = req.body;
  if (!username) return res.json({ ok: false, status: 'INVALID' });

  const u = String(username).toLowerCase();
  if (u === 'admin') return res.json({ ok: true, status: 'ACTIVE' });

  const session = activeSessions.get(u);
  if (!session || session.sessionId !== sessionId || session.revoked) {
    return res.json({ ok: false, status: 'SESSION_REVOKED' });
  }

  const now = Date.now();
  session.lastHeartbeat = now;
  const student = students.get(u);
  if (student) {
    student.lastSeen = now;
  }

  return res.json({ ok: true, status: 'ACTIVE' });
});

// 4. Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const { username, sessionId } = req.body;
  if (username) {
    const u = String(username).toLowerCase();
    const session = activeSessions.get(u);
    if (session && (!sessionId || session.sessionId === sessionId)) {
      activeSessions.delete(u);
    }
    const student = students.get(u);
    if (student && student.currentSessionId === sessionId) {
      student.currentSessionId = null;
    }
    logAudit(u, 'LOGOUT', u, 'Đăng xuất tài khoản');
  }
  return res.json({ success: true });
});

// 5. Redeem Activation Code
app.post('/api/auth/activate', (req: Request, res: Response) => {
  const { code, username } = req.body;
  if (!code || !username) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mã và tên tài khoản.' });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const cleanUsername = String(username).trim().toLowerCase();

  const codeRecord = activationCodes.get(cleanCode);
  if (!codeRecord) {
    return res.status(404).json({ success: false, message: 'Mã kích hoạt không tồn tại hoặc không chính xác.' });
  }

  if (codeRecord.isUsed) {
    return res.status(400).json({ success: false, message: `Mã này đã được kích hoạt cho tài khoản ${codeRecord.usedBy}.` });
  }

  let student = students.get(cleanUsername);
  const daysToAdd = codeRecord.days || 90;
  const now = Date.now();

  if (!student) {
    // Auto-create student account
    const newExpiry = new Date(now + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    student = {
      id: `st_${Date.now()}`,
      username: cleanUsername,
      passwordHash: '123456',
      fullName: cleanUsername,
      createdAt: new Date().toISOString(),
      expiresAt: newExpiry,
      status: 'active',
      notes: `Tự động kích hoạt qua mã ${cleanCode}`
    };
    students.set(cleanUsername, student);
  } else {
    // Extend existing account
    const currentExpiry = new Date(student.expiresAt).getTime();
    const baseTime = currentExpiry > now ? currentExpiry : now;
    student.expiresAt = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    student.status = 'active';
  }

  codeRecord.isUsed = true;
  codeRecord.usedBy = cleanUsername;
  codeRecord.usedAt = new Date().toISOString();

  logAudit(cleanUsername, 'ACTIVATE_CODE', cleanCode, `Kích hoạt thành công +${daysToAdd} ngày`);

  return res.json({
    success: true,
    message: `Kích hoạt thành công! Hạn dùng đến ${new Date(student.expiresAt).toLocaleDateString('vi-VN')}. Mật khẩu mặc định: 123456`
  });
});

// 6. Verify 1-Touch Login Token
app.post('/api/auth/verify-login-token', (req: Request, res: Response) => {
  const { token, deviceInfo } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, reason: 'INVALID', message: 'Token không hợp lệ.' });
  }

  const tokenData = loginTokens.get(String(token).trim());
  if (!tokenData || Date.now() > tokenData.expiresAt) {
    return res.status(401).json({ success: false, reason: 'EXPIRED', message: 'Link đăng nhập 1 chạm đã hết hạn hoặc không tồn tại.' });
  }

  // Find student by id
  let student: StudentRecord | undefined;
  for (const s of students.values()) {
    if (s.id === tokenData.studentId || s.username === tokenData.studentId) {
      student = s;
      break;
    }
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên tương ứng.' });
  }

  // Revoke token after use
  loginTokens.delete(String(token).trim());

  // Log student in
  const newSessionId = `sess_${student.username}_${Date.now()}`;
  activeSessions.set(student.username, {
    sessionId: newSessionId,
    username: student.username,
    deviceInfo: deviceInfo || {},
    ip: req.ip || '127.0.0.1',
    loginTime: Date.now(),
    lastHeartbeat: Date.now(),
    revoked: false
  });

  student.currentSessionId = newSessionId;
  student.lastSeen = Date.now();

  logAudit(student.username, 'TOKEN_LOGIN', student.username, 'Đăng nhập 1 chạm thành công');

  return res.json({
    success: true,
    user: {
      username: student.username,
      fullName: student.fullName,
      role: 'student',
      expiresAt: student.expiresAt,
      sessionId: newSessionId,
      status: student.status
    }
  });
});

// ==================== STUDENT PROGRESS APIS ====================

app.get('/api/student/progress', (req: Request, res: Response) => {
  const username = String(req.query.username || '').toLowerCase();
  const prog = progressStore.get(username) || {
    completedPages: [],
    xp: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    savedVocabIds: [],
    quizScores: {}
  };
  return res.json({ success: true, progress: prog });
});

app.post('/api/student/complete-lesson', (req: Request, res: Response) => {
  const { username, pageNumber } = req.body;
  const u = String(username || '').toLowerCase();
  let prog = progressStore.get(u);
  if (!prog) {
    prog = {
      completedPages: [],
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      savedVocabIds: [],
      quizScores: {}
    };
    progressStore.set(u, prog);
  }

  const pNum = Number(pageNumber);
  let xpGained = 0;
  if (pNum >= 1 && pNum <= 100 && !prog.completedPages.includes(pNum)) {
    prog.completedPages.push(pNum);
    xpGained = 50;
    prog.xp += xpGained;
    
    // Update student progress count
    const student = students.get(u);
    if (student) {
      student.progressCount = prog.completedPages.length;
    }
  }

  return res.json({ success: true, progress: prog, xpGained });
});

app.post('/api/student/toggle-vocab', (req: Request, res: Response) => {
  const { username, vocabId } = req.body;
  const u = String(username || '').toLowerCase();
  let prog = progressStore.get(u);
  if (!prog) {
    prog = {
      completedPages: [],
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      savedVocabIds: [],
      quizScores: {}
    };
    progressStore.set(u, prog);
  }

  if (prog.savedVocabIds.includes(vocabId)) {
    prog.savedVocabIds = prog.savedVocabIds.filter(id => id !== vocabId);
  } else {
    prog.savedVocabIds.push(vocabId);
  }

  return res.json({ success: true, savedVocabIds: prog.savedVocabIds });
});

app.post('/api/student/quiz-score', (req: Request, res: Response) => {
  const { username, quizId, score, total } = req.body;
  const u = String(username || '').toLowerCase();
  let prog = progressStore.get(u);
  if (!prog) {
    prog = {
      completedPages: [],
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      savedVocabIds: [],
      quizScores: {}
    };
    progressStore.set(u, prog);
  }

  const xpGained = Math.max(0, score * 20);
  prog.xp += xpGained;
  prog.quizScores[quizId] = {
    score,
    total,
    timestamp: new Date().toISOString()
  };

  return res.json({ success: true, xpGained });
});

// ==================== ADMIN MANAGEMENT APIS ====================

// Get all students
app.get('/api/admin/students', (req: Request, res: Response) => {
  const now = Date.now();
  const list = Array.from(students.values()).map(s => {
    const session = activeSessions.get(s.username);
    const isOnline = session && !session.revoked && (now - session.lastHeartbeat < 90 * 1000);
    return {
      ...s,
      isOnline: !!isOnline
    };
  });
  return res.json({ success: true, students: list });
});

// Create student
app.post('/api/admin/students', (req: Request, res: Response) => {
  const { username, fullName, password, phone, email, durationDays, notes } = req.body;
  if (!username || !fullName) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập và Họ tên là bắt buộc.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  if (students.has(cleanUsername)) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại trong hệ thống.' });
  }

  const days = Number(durationDays) || 90;
  const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const newStudent: StudentRecord = {
    id: `st_${Date.now()}`,
    username: cleanUsername,
    passwordHash: password || '123456',
    fullName: fullName.trim(),
    phone: phone?.trim(),
    email: email?.trim(),
    createdAt: new Date().toISOString(),
    expiresAt: expiry,
    status: 'active',
    notes: notes?.trim(),
    currentSessionId: null,
    lastActiveDevice: null,
    lastSeen: null,
    progressCount: 0
  };

  students.set(cleanUsername, newStudent);
  logAudit('admin', 'CREATE_STUDENT', cleanUsername, `Tạo tài khoản học viên (+${days} ngày)`);

  return res.json({ success: true, student: newStudent });
});

// Update student
app.put('/api/admin/students/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { fullName, phone, email, notes, password } = req.body;

  let student: StudentRecord | undefined;
  for (const s of students.values()) {
    if (s.id === id || s.username === id) {
      student = s;
      break;
    }
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên.' });
  }

  if (fullName) student.fullName = fullName.trim();
  if (phone !== undefined) student.phone = phone;
  if (email !== undefined) student.email = email;
  if (notes !== undefined) student.notes = notes;
  if (password) student.passwordHash = password;

  logAudit('admin', 'UPDATE_STUDENT', student.username, 'Cập nhật thông tin học viên');

  return res.json({ success: true, student });
});

// Extend student expiry
app.post('/api/admin/students/:id/extend', (req: Request, res: Response) => {
  const id = req.params.id;
  const { days, customDate } = req.body;

  let student: StudentRecord | undefined;
  for (const s of students.values()) {
    if (s.id === id || s.username === id) {
      student = s;
      break;
    }
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên.' });
  }

  const now = Date.now();
  if (customDate) {
    student.expiresAt = new Date(customDate).toISOString();
  } else {
    const daysToAdd = Number(days) || 30;
    const currentExpiry = new Date(student.expiresAt).getTime();
    const baseTime = currentExpiry > now ? currentExpiry : now;
    student.expiresAt = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
  }

  if (student.status === 'expired') {
    student.status = 'active';
  }

  logAudit('admin', 'EXTEND_STUDENT', student.username, `Gia hạn đến ${student.expiresAt}`);

  return res.json({ success: true, newExpiryDate: student.expiresAt });
});

// Remote unlock device (revoke active session)
app.post('/api/admin/students/:id/remote-unlock', (req: Request, res: Response) => {
  const id = req.params.id;
  let student: StudentRecord | undefined;
  for (const s of students.values()) {
    if (s.id === id || s.username === id) {
      student = s;
      break;
    }
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên.' });
  }

  const session = activeSessions.get(student.username);
  if (session) {
    session.revoked = true;
    activeSessions.delete(student.username);
  }
  student.currentSessionId = null;

  logAudit('admin', 'UNLOCK_DEVICE', student.username, 'Mở khóa phiên thiết bị từ xa');

  return res.json({ success: true, message: 'Đã mở khóa thiết bị thành công.' });
});

// Toggle lock account
app.post('/api/admin/students/:id/toggle-lock', (req: Request, res: Response) => {
  const id = req.params.id;
  let student: StudentRecord | undefined;
  for (const s of students.values()) {
    if (s.id === id || s.username === id) {
      student = s;
      break;
    }
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên.' });
  }

  if (student.status === 'locked') {
    student.status = 'active';
  } else {
    student.status = 'locked';
    // Revoke session if locked
    activeSessions.delete(student.username);
  }

  logAudit('admin', 'TOGGLE_LOCK', student.username, `Trạng thái mới: ${student.status}`);

  return res.json({ success: true, status: student.status });
});

// Delete student
app.delete('/api/admin/students/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  let studentUsername: string | null = null;
  for (const [uname, s] of students.entries()) {
    if (s.id === id || s.username === id) {
      studentUsername = uname;
      break;
    }
  }

  if (!studentUsername) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên.' });
  }

  students.delete(studentUsername);
  activeSessions.delete(studentUsername);
  progressStore.delete(studentUsername);

  logAudit('admin', 'DELETE_STUDENT', studentUsername, 'Xóa học viên khỏi hệ thống');

  return res.json({ success: true, message: 'Đã xóa học viên thành công.' });
});

// Reset password
app.post('/api/admin/students/:id/reset-password', (req: Request, res: Response) => {
  const id = req.params.id;
  const { newPassword } = req.body;

  let student: StudentRecord | undefined;
  for (const s of students.values()) {
    if (s.id === id || s.username === id) {
      student = s;
      break;
    }
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên.' });
  }

  student.passwordHash = newPassword || '123456';
  logAudit('admin', 'RESET_PASSWORD', student.username, 'Đặt lại mật khẩu');

  return res.json({ success: true, message: 'Đặt lại mật khẩu thành công.' });
});

// Generate 1-touch login token
app.post('/api/admin/students/:id/login-token', (req: Request, res: Response) => {
  const id = req.params.id;
  let student: StudentRecord | undefined;
  for (const s of students.values()) {
    if (s.id === id || s.username === id) {
      student = s;
      break;
    }
  }

  if (!student) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy học viên.' });
  }

  const token = `tk_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
  loginTokens.set(token, { studentId: student.username, expiresAt });

  return res.json({
    success: true,
    token,
    loginUrl: `/login?t=${token}`
  });
});

// Activation codes list & generate
app.get('/api/admin/activation-codes', (req: Request, res: Response) => {
  const list = Array.from(activationCodes.values());
  return res.json({ success: true, codes: list });
});

app.post('/api/admin/activation-codes', (req: Request, res: Response) => {
  const { count = 1, days = 90 } = req.body;
  const generated: ActivationCodeRecord[] = [];

  for (let i = 0; i < Math.min(20, count); i++) {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `ACT6-${part1}-${part2}`;

    const newCodeRecord: ActivationCodeRecord = {
      id: `act_${Date.now()}_${i}`,
      code,
      days: Number(days) || 90,
      createdAt: new Date().toISOString(),
      isUsed: false
    };

    activationCodes.set(code, newCodeRecord);
    generated.push(newCodeRecord);
  }

  logAudit('admin', 'GENERATE_CODES', 'ACT6', `Tạo ${generated.length} mã kích hoạt`);

  return res.json({ success: true, codes: generated });
});

// Audit logs
app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  return res.json({ success: true, logs: auditLogs });
});

// Batch import students
app.post('/api/admin/students/import', (req: Request, res: Response) => {
  const { students: importedList } = req.body;
  if (!Array.isArray(importedList)) {
    return res.status(400).json({ success: false, importedCount: 0, message: 'Dữ liệu không hợp lệ.' });
  }

  let count = 0;
  for (const item of importedList) {
    if (!item.username || !item.fullName) continue;
    const cleanUsername = String(item.username).trim().toLowerCase();
    if (students.has(cleanUsername)) continue;

    const days = Number(item.durationDays) || 90;
    const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const newStudent: StudentRecord = {
      id: `st_${Date.now()}_${count}`,
      username: cleanUsername,
      passwordHash: item.password || '123456',
      fullName: String(item.fullName).trim(),
      phone: item.phone?.trim(),
      email: item.email?.trim(),
      createdAt: new Date().toISOString(),
      expiresAt: expiry,
      status: 'active',
      notes: item.notes?.trim() || 'Import từ danh sách',
      currentSessionId: null,
      lastActiveDevice: null,
      lastSeen: null,
      progressCount: 0
    };

    students.set(cleanUsername, newStudent);
    count++;
  }

  logAudit('admin', 'IMPORT_STUDENTS', 'Batch', `Import thành công ${count} học viên`);
  return res.json({ success: true, importedCount: count });
});

// ==================== VITE MIDDLEWARE / STATIC SERVING ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tiếng Trung Bắc Hải Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

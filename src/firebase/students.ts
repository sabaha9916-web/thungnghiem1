import { Student, StudentFormData, ActivationCode, AuditLog } from '../types/student';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch all students for Admin Dashboard
 */
export async function getStudentsList(): Promise<Student[]> {
  try {
    const data = await safeFetchJson<{ success: boolean; students?: Student[] }>('/api/admin/students');
    return data?.students || [];
  } catch (err) {
    console.error("Failed to load students:", err);
    return [];
  }
}

/**
 * Create a new student account
 */
export async function createStudent(formData: StudentFormData): Promise<{ success: boolean; student?: Student; password?: string; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; student?: Student; password?: string; message?: string }>('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return data || { success: false, message: 'Lỗi máy chủ khi tạo học viên.' };
  } catch (err) {
    return { success: false, message: 'Lỗi máy chủ khi tạo học viên.' };
  }
}

/**
 * Update student info
 */
export async function updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; student?: Student; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; student?: Student; message?: string }>(`/api/admin/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return data || { success: false, message: 'Lỗi cập nhật thông tin học viên.' };
  } catch (err) {
    return { success: false, message: 'Lỗi cập nhật thông tin học viên.' };
  }
}

/**
 * Extend student account expiration (+7, +30, +90 days or custom)
 */
export async function extendStudentAccount(id: string, days: number): Promise<{ success: boolean; newExpiresAt?: string; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; newExpiresAt?: string; message?: string }>(`/api/admin/students/${id}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    });
    return data || { success: false, message: 'Lỗi gia hạn tài khoản.' };
  } catch (err) {
    return { success: false, message: 'Lỗi gia hạn tài khoản.' };
  }
}

/**
 * Toggle Account Lock / Unlock
 */
export async function toggleLockStudent(id: string, lock: boolean): Promise<{ success: boolean; status?: string; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; status?: string; message?: string }>(`/api/admin/students/${id}/toggle-lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked: lock })
    });
    return data || { success: false, message: 'Lỗi khóa/mở khóa tài khoản.' };
  } catch (err) {
    return { success: false, message: 'Lỗi khóa/mở khóa tài khoản.' };
  }
}

/**
 * Force Remote Unlock / Device Unlock alias
 */
export async function forceRemoteUnlock(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; message?: string }>(`/api/admin/students/${id}/remote-unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return data || { success: false, message: 'Lỗi mở khóa phiên thiết bị.' };
  } catch (err) {
    return { success: false, message: 'Lỗi mở khóa phiên thiết bị.' };
  }
}

export const unlockStudentDevice = forceRemoteUnlock;

/**
 * Toggle lock / unlock student alias
 */
export async function toggleStudentLock(id: string): Promise<{ success: boolean; status?: string; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; status?: string; message?: string }>(`/api/admin/students/${id}/toggle-lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return data || { success: false, message: 'Lỗi khóa/mở khóa tài khoản.' };
  } catch (err) {
    return { success: false, message: 'Lỗi khóa/mở khóa tài khoản.' };
  }
}

/**
 * Delete student account
 */
export async function deleteStudentAccount(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; message?: string }>(`/api/admin/students/${id}`, {
      method: 'DELETE'
    });
    return data || { success: false, message: 'Lỗi xóa học viên.' };
  } catch (err) {
    return { success: false, message: 'Lỗi xóa học viên.' };
  }
}

/**
 * Reset student password
 */
export async function resetStudentPassword(id: string, newPassword?: string): Promise<{ success: boolean; password?: string; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; password?: string; message?: string }>(`/api/admin/students/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    return data || { success: false, message: 'Lỗi đổi mật khẩu.' };
  } catch (err) {
    return { success: false, message: 'Lỗi đổi mật khẩu.' };
  }
}

/**
 * Generate Activation Code (ACT6-XXXX-XXXX)
 */
export async function createActivationCode(durationDays: number, notes?: string): Promise<{ success: boolean; code?: ActivationCode; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; code?: ActivationCode; codes?: ActivationCode[]; message?: string }>('/api/admin/activation-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 1, days: durationDays, notes })
    });
    const code = data?.code || (data?.codes && data.codes[0]);
    return { success: !!data?.success, code, message: data?.message };
  } catch (err) {
    return { success: false, message: 'Lỗi tạo mã kích hoạt.' };
  }
}

/**
 * List Activation Codes
 */
export async function getActivationCodes(): Promise<ActivationCode[]> {
  try {
    const data = await safeFetchJson<{ success: boolean; codes?: ActivationCode[] }>('/api/admin/activation-codes');
    return data?.codes || [];
  } catch (err) {
    return [];
  }
}

/**
 * Generate One-Touch Login Link Token
 */
export async function createLoginLinkToken(studentId: string): Promise<{ success: boolean; token?: string; loginUrl?: string; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; token?: string; loginUrl?: string; message?: string }>(`/api/admin/students/${studentId}/login-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return data || { success: false, message: 'Lỗi tạo link đăng nhập.' };
  } catch (err) {
    return { success: false, message: 'Lỗi tạo link đăng nhập.' };
  }
}

/**
 * Fetch Audit Logs
 */
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const data = await safeFetchJson<{ success: boolean; logs?: AuditLog[] }>('/api/admin/audit-logs');
    return data?.logs || [];
  } catch (err) {
    return [];
  }
}

/**
 * Import students batch with validation
 */
export async function importStudentsBatch(studentsList: any[]): Promise<{ success: boolean; importedCount: number; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; importedCount: number; message?: string }>('/api/admin/students/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: studentsList })
    });
    return data || { success: false, importedCount: 0, message: 'Lỗi import danh sách học viên.' };
  } catch (err) {
    return { success: false, importedCount: 0, message: 'Lỗi import danh sách học viên.' };
  }
}

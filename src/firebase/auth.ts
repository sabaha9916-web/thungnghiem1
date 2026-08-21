import { LoginResult, ActivationResult } from '../types/auth';
import { getDeviceInfo } from './sessions';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn(`Request failed for ${url}:`, e);
    return null;
  }
}

/**
 * Perform login through secure backend API / Cloud Function
 * Enforces Single Device Lock, Status check, and Expiration check.
 */
export async function loginWithCredentials(username: string, password: string): Promise<LoginResult> {
  const deviceInfo = getDeviceInfo();
  try {
    const data = await safeFetchJson<LoginResult>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, deviceInfo })
    });
    
    if (data) {
      return data;
    }
    return {
      success: false,
      reason: 'ERROR',
      message: 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại!'
    };
  } catch (err: unknown) {
    console.error("Login request error:", err);
    return {
      success: false,
      reason: 'ERROR',
      message: 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại!'
    };
  }
}

/**
 * Redeem Activation Code (e.g. ACT6-K8F2-P9Q4)
 */
export async function redeemActivationCode(code: string, username: string): Promise<ActivationResult> {
  try {
    const data = await safeFetchJson<ActivationResult>('/api/auth/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase(), username: username.trim() })
    });
    return data || {
      success: false,
      message: 'Lỗi kích hoạt mã. Vui lòng kiểm tra lại đường truyền.'
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: 'Lỗi kích hoạt mã. Vui lòng kiểm tra lại đường truyền.'
    };
  }
}

/**
 * One-time Login Link Token verification
 */
export async function verifyLoginToken(token: string): Promise<LoginResult> {
  const deviceInfo = getDeviceInfo();
  try {
    const data = await safeFetchJson<LoginResult>('/api/auth/verify-login-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, deviceInfo })
    });
    return data || {
      success: false,
      reason: 'ERROR',
      message: 'Link đăng nhập không hợp lệ hoặc đã hết hạn.'
    };
  } catch (err: unknown) {
    return {
      success: false,
      reason: 'ERROR',
      message: 'Link đăng nhập không hợp lệ hoặc đã hết hạn.'
    };
  }
}

/**
 * Logout and clear active server session
 */
export async function logoutUser(username: string, sessionId?: string): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, sessionId })
    });
  } catch (err) {
    console.warn("Logout error:", err);
  }
}

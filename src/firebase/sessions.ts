import { DeviceInfo } from '../types/session';

export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  let browser = "Trình duyệt khác";
  let platform = "Thiết bị khác";
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

  // Detect Browser
  if (/edg/i.test(ua)) {
    browser = "Edge";
  } else if (/chrome|crios/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/opera|opr/i.test(ua)) {
    browser = "Opera";
  }

  // Detect Platform & Device Type
  if (/android/i.test(ua)) {
    platform = "Android";
    deviceType = /tablet/i.test(ua) ? 'tablet' : 'mobile';
  } else if (/iphone/i.test(ua)) {
    platform = "iPhone";
    deviceType = 'mobile';
  } else if (/ipad/i.test(ua)) {
    platform = "iPad";
    deviceType = 'tablet';
  } else if (/macintosh|mac os x/i.test(ua)) {
    platform = "macOS";
    deviceType = 'desktop';
  } else if (/windows|win32/i.test(ua)) {
    platform = "Windows";
    deviceType = 'desktop';
  } else if (/linux/i.test(ua)) {
    platform = "Linux";
    deviceType = 'desktop';
  }

  const summary = `${browser} on ${platform}`;

  return {
    browser,
    platform,
    deviceType,
    userAgent: ua,
    summary
  };
}

/**
 * Send heartbeat every 25s to keep active session alive
 * Returns { ok: boolean, status: string }
 * If status === 'SESSION_REVOKED', client must immediately sign out.
 */
export async function sendHeartbeat(username: string, sessionId: string): Promise<{ ok: boolean; status: string }> {
  try {
    const res = await fetch('/api/sessions/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, sessionId, timestamp: Date.now() })
    });
    if (res.ok) {
      const text = await res.text();
      if (text) {
        return JSON.parse(text);
      }
    }
    return { ok: true, status: 'ACTIVE' };
  } catch (err) {
    return { ok: false, status: 'NETWORK_ERROR' };
  }
}

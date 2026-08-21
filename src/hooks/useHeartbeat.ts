import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { sendHeartbeat } from '../firebase/sessions';

export function useHeartbeat(onRevoked?: () => void) {
  const { user, logout } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only student accounts with active sessionId send heartbeats
    if (!user || user.role === 'admin' || !user.sessionId || !user.username) {
      return;
    }

    const runHeartbeat = async () => {
      try {
        const result = await sendHeartbeat(user.username, user.sessionId!);
        if (result.status === 'SESSION_REVOKED' || result.status === 'ACCOUNT_LOCKED' || result.status === 'ACCOUNT_EXPIRED') {
          console.warn("Session revoked by server:", result.status);
          if (onRevoked) {
            onRevoked();
          }
          await logout();
        }
      } catch (e) {
        console.warn("Heartbeat error:", e);
      }
    };

    // Run initial heartbeat immediately
    runHeartbeat();

    // Schedule regular heartbeat every 25 seconds (25000ms)
    timerRef.current = setInterval(runHeartbeat, 25000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user?.username, user?.sessionId, user?.role, logout, onRevoked]);
}

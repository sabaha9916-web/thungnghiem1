import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { AuthUser, LoginResult, ActivationResult } from '../types/auth';
import { loginWithCredentials, redeemActivationCode, verifyLoginToken, logoutUser } from '../firebase/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  activate: (code: string, username: string) => Promise<ActivationResult>;
  loginWithLinkToken: (token: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateUserSession: (updater: Partial<AuthUser>) => void;
  isExpired: boolean;
  daysRemaining: number | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('bh_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Calculate days remaining & expiration status
  const calculateExpiration = useCallback(() => {
    if (!user || user.role === 'admin' || !user.expiresAt) {
      return { isExpired: false, daysRemaining: null };
    }
    const expiry = new Date(user.expiresAt).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return {
      isExpired: diffDays <= 0 || user.status === 'expired',
      daysRemaining: Math.max(0, diffDays)
    };
  }, [user]);

  const { isExpired, daysRemaining } = calculateExpiration();

  // Validate session with backend on initial load / reload
  useEffect(() => {
    async function verifyInitialSession() {
      if (user && user.username && user.sessionId) {
        try {
          const res = await fetch(`/api/sessions/validate?username=${encodeURIComponent(user.username)}&sessionId=${encodeURIComponent(user.sessionId)}`);
          if (res.ok) {
            const text = await res.text();
            if (text) {
              const data = JSON.parse(text);
              if (data && !data.valid) {
                console.warn("Session invalidated on startup:", data.reason);
                setUser(null);
                sessionStorage.removeItem('bh_auth_user');
              } else if (data && data.user) {
                setUser(data.user);
                sessionStorage.setItem('bh_auth_user', JSON.stringify(data.user));
              }
            }
          }
        } catch (err) {
          console.warn("Session verification warning:", err);
        }
      }
      setLoading(false);
    }
    verifyInitialSession();
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const res = await loginWithCredentials(username, password);
    if (res.success && res.user) {
      setUser(res.user);
      sessionStorage.setItem('bh_auth_user', JSON.stringify(res.user));
    }
    return res;
  };

  const activate = async (code: string, username: string): Promise<ActivationResult> => {
    const res = await redeemActivationCode(code, username);
    return res;
  };

  const loginWithLinkToken = async (token: string): Promise<LoginResult> => {
    const res = await verifyLoginToken(token);
    if (res.success && res.user) {
      setUser(res.user);
      sessionStorage.setItem('bh_auth_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    if (user) {
      await logoutUser(user.username, user.sessionId);
    }
    setUser(null);
    sessionStorage.removeItem('bh_auth_user');
  };

  const updateUserSession = (updater: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updater };
      sessionStorage.setItem('bh_auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      activate,
      loginWithLinkToken,
      logout,
      updateUserSession,
      isExpired,
      daysRemaining
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

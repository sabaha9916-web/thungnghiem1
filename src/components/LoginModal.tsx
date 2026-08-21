import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Key, Link as LinkIcon, AlertCircle, CheckCircle, X, Shield, ArrowRight, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DeviceWarning } from './DeviceWarning';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
  defaultTab?: 'LOGIN' | 'ACTIVATION' | 'LINK';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  redirectTo,
  defaultTab = 'LOGIN'
}) => {
  const { login, activate, loginWithLinkToken } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'ACTIVATION' | 'LINK'>(defaultTab);
  
  // Tab 1: Login credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Tab 2: Activation Code
  const [actCode, setActCode] = useState('');
  const [actUsername, setActUsername] = useState('');

  // Tab 3: Login Token Link
  const [tokenInput, setTokenInput] = useState('');

  // State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Single Device Warning modal state
  const [deviceWarningOpen, setDeviceWarningOpen] = useState(false);
  const [activeDeviceInfo, setActiveDeviceInfo] = useState<any>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await login(username.trim(), password);
    setLoading(false);

    if (res.success && res.user) {
      onClose();
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTo || '/student');
      }
    } else {
      if (res.reason === 'DEVICE_LOCKED') {
        setActiveDeviceInfo(res.activeSession);
        setDeviceWarningOpen(true);
        setErrorMsg('Tài khoản đang đăng nhập trên một thiết bị khác. Để bảo mật, mỗi tài khoản chỉ được học trên 1 thiết bị tại 1 thời điểm.');
      } else if (res.reason === 'ACCOUNT_LOCKED') {
        setErrorMsg('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ giáo viên.');
      } else if (res.reason === 'ACCOUNT_EXPIRED') {
        setErrorMsg('Tài khoản của bạn đã hết hạn. Vui lòng liên hệ Admin để gia hạn.');
      } else {
        setErrorMsg(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    }
  };

  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actCode.trim() || !actUsername.trim()) {
      setErrorMsg('Vui lòng nhập Mã kích hoạt và Tên tài khoản nhận.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await activate(actCode.trim().toUpperCase(), actUsername.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setActiveTab('LOGIN');
        setUsername(actUsername.trim());
        setSuccessMsg(null);
      }, 2000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let rawToken = tokenInput.trim();
    if (rawToken.includes('?t=')) {
      rawToken = rawToken.split('?t=')[1].split('&')[0];
    }
    if (!rawToken) {
      setErrorMsg('Vui lòng dán Link hoặc Token đăng nhập hợp lệ.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await loginWithLinkToken(rawToken);
    setLoading(false);

    if (res.success && res.user) {
      onClose();
      navigate(redirectTo || '/student');
    } else {
      setErrorMsg(res.message || 'Link đăng nhập 1 chạm không hợp lệ hoặc đã qua sử dụng.');
    }
  };

  const setDemoUser = (userType: 'STUDENT' | 'ADMIN') => {
    if (userType === 'STUDENT') {
      setUsername('hocvien01');
      setPassword('123');
    } else {
      setUsername('admin');
      setPassword('9916');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-6 text-white text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mx-auto mb-3 text-xl font-bold font-chinese shadow-inner">
              北海
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">TIẾNG TRUNG BẮC HẢI</h3>
            <p className="text-xs text-orange-100 mt-1">Đăng nhập tài khoản để mở khóa toàn bộ 100 trang giáo trình</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 p-1">
            <button
              onClick={() => { setActiveTab('LOGIN'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => { setActiveTab('ACTIVATION'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'ACTIVATION'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mã Kích Hoạt
            </button>
            <button
              onClick={() => { setActiveTab('LINK'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'LINK'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Link 1 Chạm
            </button>
          </div>

          {/* Alerts */}
          <div className="p-6 pt-4">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* TAB 1: USERNAME / PASSWORD LOGIN */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên đăng nhập (Username)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ví dụ: hocvien01 hoặc admin"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu (Password)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Đăng Nhập Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Credentials for Reviewer / Examiner */}
                <div className="pt-3 border-t border-slate-100 text-center">
                  <span className="text-[11px] text-slate-400">Tài khoản thử nghiệm nhanh:</span>
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setDemoUser('STUDENT')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 border border-orange-200 transition"
                    >
                      Học Viên: hocvien01
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoUser('ADMIN')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1"
                    >
                      <Shield className="w-3 h-3" />
                      Admin: 9916
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: ACTIVATION CODE */}
            {activeTab === 'ACTIVATION' && (
              <form onSubmit={handleActivationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã Kích Hoạt (Format: ACT6-XXXX-XXXX)</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={actCode}
                      onChange={(e) => setActCode(e.target.value.toUpperCase())}
                      placeholder="ví dụ: ACT6-K8F2-P9Q4"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên tài khoản học viên (Username)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={actUsername}
                      onChange={(e) => setActUsername(e.target.value)}
                      placeholder="Nhập username của bạn"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Kích Hoạt Tài Khoản</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: LOGIN TOKEN LINK */}
            {activeTab === 'LINK' && (
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dán Link Đăng Nhập 1 Chạm hoặc Mã Token</label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Dán đường link do giáo viên gửi..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Link 1 chạm do Admin tạo cho phép đăng nhập tức thì không cần mật khẩu (chỉ dùng 1 lần).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Vào Học Ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Hệ thống Bản quyền Tiếng Trung Bắc Hải &copy; 2026. Mọi quyền được bảo lưu.
          </div>

        </div>
      </div>

      {/* Device Lock Warning */}
      <DeviceWarning
        isOpen={deviceWarningOpen}
        onClose={() => setDeviceWarningOpen(false)}
        deviceDetails={activeDeviceInfo}
        onRetry={() => {
          setDeviceWarningOpen(false);
          handleLoginSubmit({ preventDefault: () => {} } as any);
        }}
      />
    </>
  );
};

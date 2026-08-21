import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Lock, Key, Link as LinkIcon, AlertCircle, CheckCircle, ArrowRight, Shield, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DeviceWarning } from '../components/DeviceWarning';

export const LoginPage: React.FC = () => {
  const { user, login, activate, loginWithLinkToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/student';
  const urlToken = searchParams.get('t');

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'ACTIVATION' | 'LINK'>('LOGIN');

  // Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [actCode, setActCode] = useState('');
  const [actUsername, setActUsername] = useState('');
  const [tokenInput, setTokenInput] = useState(urlToken || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Device warning
  const [deviceWarningOpen, setDeviceWarningOpen] = useState(false);
  const [activeDeviceInfo, setActiveDeviceInfo] = useState<any>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectUrl, { replace: true });
      }
    }
  }, [user, navigate, redirectUrl]);

  // Auto handle token if present in query param
  useEffect(() => {
    if (urlToken && !user) {
      setActiveTab('LINK');
      const processToken = async () => {
        setLoading(true);
        const res = await loginWithLinkToken(urlToken);
        setLoading(false);
        if (res.success && res.user) {
          navigate(redirectUrl, { replace: true });
        } else {
          setErrorMsg(res.message || 'Link đăng nhập 1 chạm không hợp lệ hoặc đã hết hạn.');
        }
      };
      processToken();
    }
  }, [urlToken]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await login(username.trim(), password);
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
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
      setErrorMsg('Vui lòng nhập đầy đủ Mã kích hoạt và Tên tài khoản nhận.');
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
      setErrorMsg('Vui lòng dán Link hoặc Token hợp lệ.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await loginWithLinkToken(rawToken);
    setLoading(false);

    if (res.success && res.user) {
      navigate(redirectUrl);
    } else {
      setErrorMsg(res.message || 'Link 1 chạm không hợp lệ hoặc đã qua sử dụng.');
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative animate-fade-in">
        
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-8 text-white text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mx-auto mb-3 text-2xl font-bold font-chinese shadow-inner">
            北海
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">TIẾNG TRUNG BẮC HẢI</h2>
          <p className="text-xs text-orange-100 mt-1">Cổng đăng nhập học viên & Kích hoạt giáo trình 100 trang</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
          <button
            onClick={() => { setActiveTab('LOGIN'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'LOGIN' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setActiveTab('ACTIVATION'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'ACTIVATION' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mã Kích Hoạt
          </button>
          <button
            onClick={() => { setActiveTab('LINK'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'LINK' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Link 1 Chạm
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên đăng nhập (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ví dụ: hocvien01 hoặc admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu (Password)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
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
                    <span>Đăng Nhập Vào Học</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Fast Testing Demo Helper */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400">Tài khoản demo sẵn:</span>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDemoUser('STUDENT')}
                    className="px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 border border-orange-200 transition"
                  >
                    Học Viên: hocvien01
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoUser('ADMIN')}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    Admin: 9916
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: ACTIVATION */}
          {activeTab === 'ACTIVATION' && (
            <form onSubmit={handleActivationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã Kích Hoạt (ACT6-XXXX-XXXX)</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={actCode}
                    onChange={(e) => setActCode(e.target.value.toUpperCase())}
                    placeholder="ví dụ: ACT6-K8F2-P9Q4"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên tài khoản nhận (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={actUsername}
                    onChange={(e) => setActUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập của bạn"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
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
                    <span>Kích Hoạt Ngay</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: 1-TOUCH LINK */}
          {activeTab === 'LINK' && (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Dán Đường Link Hoặc Token Đăng Nhập</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Dán link nhận từ giáo viên..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
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
                    <span>Xác Thực & Vào Học</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          Chưa có tài khoản? <Link to="/ebook" className="font-bold text-orange-600 hover:underline">Xem thử 9 trang miễn phí</Link>
        </div>

      </div>

      {/* Device Lock Warning Modal */}
      <DeviceWarning
        isOpen={deviceWarningOpen}
        onClose={() => setDeviceWarningOpen(false)}
        deviceDetails={activeDeviceInfo}
        onRetry={() => {
          setDeviceWarningOpen(false);
          handleLoginSubmit({ preventDefault: () => {} } as any);
        }}
      />
    </div>
  );
};

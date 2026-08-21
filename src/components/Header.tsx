import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Shield, Menu, X, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const { user, logout, daysRemaining, isExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Sách 100 Trang', path: '/ebook' },
    { label: 'Từ Vựng HSK', path: '/vocabulary' },
    { label: 'Luyện Quiz', path: '/quiz' },
    { label: 'Tiến Độ Học', path: '/progress', authRequired: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <span className="font-chinese text-xl font-bold">北</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">TIẾNG TRUNG BẮC HẢI</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">Ebook 100</span>
              </div>
              <p className="text-[11px] text-slate-500 font-chinese">北海国际汉语教学系统</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'text-orange-600 bg-orange-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900 text-white text-xs font-semibold shadow-xs hover:bg-indigo-800 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-300" />
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/student"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-800 line-clamp-1">{user.fullName || user.username}</div>
                      <div className="flex items-center gap-1 text-[10px]">
                        {isExpired ? (
                          <span className="text-red-600 font-bold">Hết hạn</span>
                        ) : daysRemaining !== null ? (
                          <span className="text-slate-500">Còn {daysRemaining} ngày</span>
                        ) : (
                          <span className="text-emerald-600">Đang học</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title="Thoát tài khoản"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold transition shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Thoát tài khoản</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-sm hover:shadow transition"
                >
                  <User className="w-4 h-4" />
                  Đăng Nhập Học Viên
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to={user.role === 'admin' ? '/admin' : '/student'}
                className="p-2 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold"
              >
                {user.role === 'admin' ? 'Admin' : 'Học Viên'}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            if (link.authRequired && !user) return null;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-xs">
                  <div className="font-semibold text-slate-800">{user.fullName || user.username}</div>
                  <div className="text-slate-500">
                    {user.role === 'admin' ? 'Quản Trị Viên' : `Hạn dùng: ${daysRemaining !== null ? `Còn ${daysRemaining} ngày` : 'Vĩnh viễn'}`}
                  </div>
                </div>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/student'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 px-4 bg-orange-600 text-white rounded-lg text-sm font-semibold"
                >
                  Vào Trang Cá Nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Thoát tài khoản</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenLogin) onOpenLogin();
                }}
                className="w-full py-2.5 bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-sm"
              >
                Đăng Nhập / Kích Hoạt
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

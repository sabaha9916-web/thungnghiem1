import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Key, 
  Link as LinkIcon, 
  FileText, 
  Settings, 
  LogOut, 
  Shield, 
  Activity, 
  Home, 
  BookMarked, 
  Award, 
  X 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  mode: 'ADMIN' | 'STUDENT';
  isOpen?: boolean;
  onClose?: () => void;
  onOpenActivationModal?: () => void;
  onOpenLoginLinkModal?: () => void;
  onOpenAuditModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  isOpen = false,
  onClose,
  onOpenActivationModal,
  onOpenLoginLinkModal,
  onOpenAuditModal
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { label: 'Tổng Quan & Học Viên', path: '/admin', icon: Users },
    { label: 'Đọc Sách 100 Trang', path: '/ebook', icon: BookOpen },
    { label: 'Mã Kích Hoạt (ACT6)', onClick: onOpenActivationModal, icon: Key },
    { label: 'Link Đăng Nhập 1 Chạm', onClick: onOpenLoginLinkModal, icon: LinkIcon },
    { label: 'Nhật Ký Hệ Thống (Audit)', onClick: onOpenAuditModal, icon: FileText },
  ];

  const studentLinks = [
    { label: 'Trang Chủ Học Tập', path: '/student', icon: Home },
    { label: 'Sách 100 Trang', path: '/ebook', icon: BookOpen },
    { label: 'Từ Vựng HSK', path: '/vocabulary', icon: BookMarked },
    { label: 'Luyện Quiz', path: '/quiz', icon: Award },
    { label: 'Tiến Độ Của Tôi', path: '/progress', icon: Activity },
  ];

  const links = mode === 'ADMIN' ? adminLinks : studentLinks;

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <span className="font-chinese text-xl font-bold">北</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-white">TIẾNG TRUNG BẮC HẢI</h2>
            <p className="text-[11px] text-orange-400 font-semibold uppercase">
              {mode === 'ADMIN' ? 'Hệ Thống Quản Trị' : 'Cổng Học Viên'}
            </p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info Badge */}
      <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-sm">
            {mode === 'ADMIN' ? <Shield className="w-5 h-5" /> : (user?.fullName?.charAt(0) || 'H')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate">
              {user?.fullName || user?.username || (mode === 'ADMIN' ? 'Giáo Viên Admin' : 'Học Viên')}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {mode === 'ADMIN' ? 'Admin 9916' : 'Đang học'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 px-3 uppercase tracking-wider mb-2">
          Menu Điều Hướng
        </div>
        {links.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.path && location.pathname === item.path;

          if (item.onClick) {
            return (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  if (onClose) onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition text-left"
              >
                <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              to={item.path!}
              onClick={() => { if (onClose) onClose(); }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-orange-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng Xuất Khỏi Hệ Thống</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs" onClick={onClose}></div>
          <div className="relative w-4/5 max-w-xs h-full z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { Lock, Sparkles, LogIn, Key, PhoneCall } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedPageProps {
  pageNumber: number;
  title: string;
  onOpenLogin: () => void;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({
  pageNumber,
  title,
  onOpenLogin
}) => {
  const { user, isExpired } = useAuth();

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl p-8 md:p-12 text-center">
      {/* Blurred background mockup */}
      <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg mb-4 animate-bounce">
          <Lock className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 uppercase tracking-wide mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Nội Dung Bản Quyền — Trang {pageNumber}/100
        </span>

        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 max-w-md">
          {title}
        </h3>

        {user && isExpired ? (
          <div className="max-w-md">
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Tài khoản của bạn đã hết hạn sử dụng. Vui lòng liên hệ giáo viên hoặc Admin Tiếng Trung Bắc Hải để gia hạn truy cập.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="tel:0988889916"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md transition"
              >
                <PhoneCall className="w-4 h-4" />
                Gia Hạn Tài Khoản
              </a>
            </div>
          </div>
        ) : (
          <div className="max-w-md">
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Trang 1 đến trang 9 được mở miễn phí. Từ <strong>Trang 10 đến Trang 100</strong>, bạn cần đăng nhập tài khoản học viên Tiếng Trung Bắc Hải để học tập đầy đủ ngữ pháp, hội thoại và bài tập.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl shadow-md transition hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                Đăng Nhập Học Viên
              </button>

              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition"
              >
                <Key className="w-4 h-4 text-amber-500" />
                Nhập Mã Kích Hoạt
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-400">
          Hệ thống bảo vệ quyền tác giả Tiếng Trung Bắc Hải.
        </div>
      </div>

      {/* Decorative background skeleton */}
      <div className="opacity-10 pointer-events-none space-y-4 select-none">
        <div className="h-8 bg-slate-400 rounded w-1/3 mx-auto"></div>
        <div className="h-4 bg-slate-300 rounded w-2/3 mx-auto"></div>
        <div className="space-y-2 pt-6">
          <div className="h-4 bg-slate-300 rounded w-full"></div>
          <div className="h-4 bg-slate-300 rounded w-5/6"></div>
          <div className="h-4 bg-slate-300 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

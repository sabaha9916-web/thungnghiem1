import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Award, 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  Bookmark, 
  Star, 
  ArrowRight,
  Sparkles,
  Trophy,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { EBOOK_PAGES } from '../ebook/ebookData';

export const ProgressPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { progress, completedCount, progressPercent, isLessonCompleted } = useProgress();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
                Hồ Sơ Học Tập
              </span>
              <span className="text-xs text-slate-400">• Tiếng Trung Bắc Hải</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Tiến Độ & Thành Tích Cá Nhân
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Học viên: <strong className="text-slate-900">{user?.fullName || user?.username}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ebook"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Tiếp Tục Đọc Sách</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm transition cursor-pointer"
              title="Thoát tài khoản"
            >
              <LogOut className="w-4 h-4" />
              <span>Thoát</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Hoàn Thành</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{completedCount} / 100</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="text-[11px] text-slate-500 block">{progressPercent}% toàn bộ giáo trình</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm Kinh Nghiệm</span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600">{progress.xp} XP</div>
            <span className="text-[11px] text-slate-500 block">Cấp bậc: {progress.xp >= 1000 ? '⭐ Học Giả Bắc Hải' : progress.xp >= 300 ? '🌱 Học Viên Tích Cực' : '🐣 Tân Binh'}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chuỗi Học (Streak)</span>
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-extrabold text-red-600">{progress.streak} ngày</div>
            <span className="text-[11px] text-slate-500 block">Ngày hoạt động gần nhất: {progress.lastActiveDate}</span>
          </div>
        </div>

        {/* 100-PAGES COMPLETION MATRIX MAP */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Bản Đồ 100 Trang Bài Học</h2>
              <p className="text-xs text-slate-500">Màu xanh: đã hoàn thành • Màu xám: chưa học</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span> Đã hoàn thành</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span> Chưa học</span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((pageNum) => {
              const isDone = isLessonCompleted(pageNum);
              return (
                <Link
                  key={pageNum}
                  to={`/ebook?page=${pageNum}`}
                  title={`Trang ${pageNum}: ${isDone ? 'Đã hoàn thành' : 'Chưa học'}`}
                  className={`h-10 rounded-xl flex items-center justify-center font-bold text-xs transition transform hover:scale-110 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-orange-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

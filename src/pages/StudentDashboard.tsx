import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Flame, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Sparkles, 
  GraduationCap, 
  PhoneCall,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { ExpirationWarning } from '../components/ExpirationWarning';

export const StudentDashboard: React.FC = () => {
  const { user, logout, daysRemaining, isExpired } = useAuth();
  const navigate = useNavigate();
  const { progress, completedCount, progressPercent, isLessonCompleted } = useProgress();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Find next incomplete page (1 to 100)
  let nextLessonPage = 1;
  for (let i = 1; i <= 100; i++) {
    if (!isLessonCompleted(i)) {
      nextLessonPage = i;
      break;
    }
  }

  const units = [
    { num: 1, title: 'Nhập Môn Ngữ Âm & Phát Âm Chuẩn', start: 1, end: 10 },
    { num: 2, title: 'Chào Hỏi, Làm Quen & Giới Thiệu', start: 11, end: 20 },
    { num: 3, title: 'Số Đếm, Thời Gian & Lịch Trình', start: 21, end: 30 },
    { num: 4, title: 'Mua Sắm, Mặc Cả & Tiền Tệ', start: 31, end: 40 },
    { num: 5, title: 'Ăn Uống, Gọi Món & Ẩm Thực', start: 41, end: 50 },
    { num: 6, title: 'Hỏi Đường, Giao Thông & Đi Lại', start: 51, end: 60 },
    { num: 7, title: 'Khách Sạn, Du Lịch & Đặt Phòng', start: 61, end: 70 },
    { num: 8, title: 'Công Việc, Văn Phòng & Đàm Phán', start: 71, end: 80 },
    { num: 9, title: 'Sức Khỏe, Y Tế & Khẩn Cấp', start: 81, end: 90 },
    { num: 10, title: 'Giao Lưu Văn Hóa & Ôn Tập HSK', start: 91, end: 100 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Expiration Banner */}
        <ExpirationWarning />

        {/* WELCOME HERO BANNER */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Học Viên Tiếng Trung Bắc Hải
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/25 hover:bg-red-600/90 text-white text-xs font-semibold transition backdrop-blur-xs cursor-pointer"
                  title="Thoát phiên học hiện tại"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Thoát tài khoản</span>
                </button>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Xin chào, {user?.fullName || user?.username}!
              </h1>
              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed font-vietnamese">
                Tiếp tục hành trình chinh phục 100 trang bài học tiếng Trung chuẩn bản ngữ. Hãy duy trì thói quen học mỗi ngày!
              </p>
            </div>

            {/* Next Lesson Jump Card */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100 block">
                Bài Học Tiếp Theo:
              </span>
              <div className="text-base font-bold text-white">
                Trang {nextLessonPage} / 100
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/ebook?page=${nextLessonPage}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-orange-50 transition"
                >
                  <Play className="w-4 h-4 fill-orange-600" />
                  <span>Học Tiếp Ngay</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 PROGRESS STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến Độ Sách</span>
            <div className="text-2xl font-extrabold text-slate-900">{completedCount} / 100</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm XP Tích Lũy</span>
            <div className="text-2xl font-extrabold text-amber-600">{progress.xp} XP</div>
            <span className="text-[11px] text-slate-500">+50 XP mỗi bài học</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-2">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chuỗi Học (Streak)</span>
            <div className="text-2xl font-extrabold text-red-600">{progress.streak} ngày</div>
            <span className="text-[11px] text-slate-500">Giữ vững phong độ!</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời Hạn Sử Dụng</span>
            <div className="text-2xl font-extrabold text-indigo-900">
              {isExpired ? 'Hết hạn' : daysRemaining !== null ? `${daysRemaining} ngày` : 'Vĩnh viễn'}
            </div>
            <span className="text-[11px] text-slate-500">
              {user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString('vi-VN') : 'Đang kích hoạt'}
            </span>
          </div>

        </div>

        {/* 10 UNITS PROGRESS BREAKDOWN */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Lộ Trình 10 Chuyên Đề</h2>
              <p className="text-xs text-slate-500">Theo dõi tiến độ hoàn thành từng chuyên đề kiến thức</p>
            </div>
            <Link
              to="/ebook"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Vào Đọc Sách</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {units.map((unit) => {
              // Count completed pages in this unit
              let unitCompleted = 0;
              for (let p = unit.start; p <= unit.end; p++) {
                if (isLessonCompleted(p)) unitCompleted++;
              }
              const percent = Math.round((unitCompleted / 10) * 100);
              const isAllDone = unitCompleted === 10;

              return (
                <div
                  key={unit.num}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isAllDone ? 'bg-emerald-500 text-white' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isAllDone ? '✓' : unit.num}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          Chuyên Đề {unit.num}: {unit.title}
                        </h4>
                        <span className="text-[11px] text-slate-500">Trang {unit.start} - {unit.end}</span>
                      </div>
                    </div>

                    <Link
                      to={`/ebook?page=${unit.start}`}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:border-orange-300 transition"
                    >
                      Xem
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-600">
                      <span>Đã học {unitCompleted}/10 trang</span>
                      <span className="font-bold text-orange-600">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${isAllDone ? 'bg-emerald-500' : 'bg-orange-500'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACCOUNT INFO & LOGOUT SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-lg shrink-0">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">{user?.fullName || user?.username}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {user?.status === 'active' ? 'Đang kích hoạt' : 'Hết hạn'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tài khoản: <strong className="text-slate-700">{user?.username}</strong> • Mã phiên: {user?.sessionId ? user.sessionId.substring(0, 16) + '...' : 'Chưa có'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm transition shadow-2xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Thoát tài khoản</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

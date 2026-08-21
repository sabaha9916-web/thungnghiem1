import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Volume2, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Key, 
  GraduationCap, 
  Clock, 
  Lock, 
  Users 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HomePageProps {
  onOpenLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenLogin }) => {
  const { user } = useAuth();

  const units = [
    { num: 1, title: 'Nhập Môn Ngữ Âm & Phát Âm Chuẩn', pages: '1 - 10', free: '1-9 Miễn Phí' },
    { num: 2, title: 'Chào Hỏi, Làm Quen & Giới Thiệu', pages: '11 - 20', free: 'Bản Quyền' },
    { num: 3, title: 'Số Đếm, Thời Gian & Lịch Trình', pages: '21 - 30', free: 'Bản Quyền' },
    { num: 4, title: 'Mua Sắm, Mặc Cả & Tiền Tệ', pages: '31 - 40', free: 'Bản Quyền' },
    { num: 5, title: 'Ăn Uống, Gọi Món & Ẩm Thực', pages: '41 - 50', free: 'Bản Quyền' },
    { num: 6, title: 'Hỏi Đường, Giao Thông & Đi Lại', pages: '51 - 60', free: 'Bản Quyền' },
    { num: 7, title: 'Khách Sạn, Du Lịch & Đặt Phòng', pages: '61 - 70', free: 'Bản Quyền' },
    { num: 8, title: 'Công Việc, Văn Phòng & Đàm Phán', pages: '71 - 80', free: 'Bản Quyền' },
    { num: 9, title: 'Sức Khỏe, Y Tế & Khẩn Cấp', pages: '81 - 90', free: 'Bản Quyền' },
    { num: 10, title: 'Giao Lưu Văn Hóa & Ôn Tập HSK', pages: '91 - 100', free: 'Bản Quyền' },
  ];

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-slate-800">
        
        {/* Background decorative elements */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Giáo Trình Bản Quyền 100 Trang
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            TIẾNG TRUNG BẮC HẢI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 font-chinese">
              北海国际汉语
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-vietnamese">
            Hệ thống sách điện tử thông minh gồm 100 trang bài học toàn diện. Trải nghiệm phát âm chuẩn bản xứ, ngữ pháp trọng điểm, kho từ vựng tương tác và đồng bộ tiến độ học tập trên Cloud.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/ebook"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-orange-500/25 transition hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              <span>Học Thử Miễn Phí Trang 1 - 9</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/student'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur transition"
              >
                <GraduationCap className="w-5 h-5 text-orange-400" />
                <span>Vào Trang Cá Nhân</span>
              </Link>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur transition"
              >
                <Key className="w-5 h-5 text-amber-400" />
                <span>Đăng Nhập / Kích Hoạt Mã</span>
              </button>
            )}
          </div>

          {/* Value Badges */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Trang 1-9 xem miễn phí</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Khóa 1 thiết bị bảo mật</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Phát âm chuẩn bản xứ</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Đồng bộ tiến độ học Cloud</span>
            </div>
          </div>

        </div>
      </section>

      {/* 10 UNITS CURRICULUM OVERVIEW */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Lộ Trình Đào Tạo</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            10 Chuyên Đề — 100 Trang Kiến Thức Toàn Diện
          </h2>
          <p className="text-sm text-slate-600">
            Từ sơ cấp phát âm đến giao tiếp chuyên sâu đời sống, du lịch, ẩm thực và công việc.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map((u) => {
            const isFree = u.num === 1;
            return (
              <Link
                key={u.num}
                to={`/ebook?page=${(u.num - 1) * 10 + 1}`}
                className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition ${
                    isFree ? 'bg-orange-100 text-orange-700 group-hover:bg-orange-600 group-hover:text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-orange-600 transition">
                      Chuyên Đề {u.num}: {u.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Trang {u.pages}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.free}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE BAC HAI EBOOK */}
      <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ưu Thế Vượt Trội Của Hệ Thống Tiếng Trung Bắc Hải
          </h2>
          <p className="text-sm text-slate-600">
            Ứng dụng công nghệ hiện đại kết hợp phương pháp sư phạm tối ưu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Bảo Mật 1 Thiết Bị Học</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mỗi tài khoản được quản lý nghiêm ngặt qua Single-Device Lock và Heartbeat thời gian thực, bảo đảm quyền lợi học viên chính chủ.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Phát Âm Chuẩn Từng Câu</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tích hợp công nghệ âm thanh chuẩn giọng Bắc Kinh cho từng từ vựng, hội thoại và mẫu câu thực tế đời sống.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Bài Tập & Tích Lũy XP</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống trắc nghiệm củng cố ngay cuối mỗi trang cùng bảng xếp hạng kinh nghiệm, streak tạo động lực học tập mỗi ngày.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

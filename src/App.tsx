import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useHeartbeat } from './hooks/useHeartbeat';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { EbookPage } from './pages/EbookPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VocabularyPage } from './pages/VocabularyPage';
import { QuizPage } from './pages/QuizPage';
import { ProgressPage } from './pages/ProgressPage';
import { BookOpen, Phone, Mail, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [revokedNotice, setRevokedNotice] = useState(false);
  const location = useLocation();

  // Active student heartbeat listener
  useHeartbeat(() => {
    setRevokedNotice(true);
  });

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-vietnamese antialiased">
      
      {/* Session Revoked Notice Modal */}
      {revokedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Phiên Học Đã Được Kết Thúc</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tài khoản của bạn đã được đăng xuất hoặc Admin đã làm mới phiên thiết bị. Vui lòng đăng nhập lại để tiếp tục học tập.
            </p>
            <button
              onClick={() => {
                setRevokedNotice(false);
                setIsLoginModalOpen(true);
              }}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              Đăng Nhập Lại
            </button>
          </div>
        </div>
      )}

      {/* Main Header (Hidden in Admin view for max dashboard screen real estate) */}
      {!isAdminRoute && (
        <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
      )}

      {/* Route Views */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenLogin={() => setIsLoginModalOpen(true)} />} />
          <Route path="/ebook" element={<EbookPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/quiz" element={<QuizPage />} />

          {/* Protected Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProgressPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Global Footer (Hidden in Admin and Ebook full reading view) */}
      {!isAdminRoute && location.pathname !== '/ebook' && (
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-lg font-chinese">
                  北
                </div>
                <span className="font-extrabold text-white text-base tracking-tight">TIẾNG TRUNG BẮC HẢI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md font-vietnamese">
                Hệ thống giáo trình điện tử 100 trang độc quyền kết hợp công nghệ học tập thông minh, luyện phát âm chuẩn bản ngữ và khóa thiết bị bảo mật bản quyền.
              </p>
              <div className="text-[11px] text-slate-500 font-chinese">
                北海国际汉语教学系统 — 严禁未经授权复制或传播
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Liên Kết Nhanh</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/ebook" className="hover:text-orange-400 transition">Sách 100 Trang (Học Thử 1-9)</Link></li>
                <li><Link to="/vocabulary" className="hover:text-orange-400 transition">Sổ Tay Từ Vựng HSK</Link></li>
                <li><Link to="/quiz" className="hover:text-orange-400 transition">Luyện Tập Trắc Nghiệm</Link></li>
                <li><Link to="/login" className="hover:text-orange-400 transition">Cổng Đăng Nhập Học Viên</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Hỗ Trợ & Bản Quyền</h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  <span>Hotline / Zalo: 0988.889.916</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-orange-500" />
                  <span>Email: lienhe@tiengtrungbachai.edu.vn</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Bắc Hải — Việt Nam</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>&copy; 2026 Tiếng Trung Bắc Hải. Tất cả quyền được bảo lưu.</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Hệ thống bảo mật Cloud Firestore hoạt động bình thường</span>
            </div>
          </div>
        </footer>
      )}

      {/* Global Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

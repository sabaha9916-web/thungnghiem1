import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from './LoadingScreen';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireActiveSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireActiveSubscription = true
}) => {
  const { user, loading, isExpired } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Đang xác thực thông tin tài khoản..." />;
  }

  // Not logged in -> Redirect to /login
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Check role restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  // Check account lock
  if (user.status === 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tài Khoản Đã Bị Khóa</h2>
          <p className="text-sm text-slate-600 mb-6">
            Tài khoản của bạn đã bị khóa. Vui lòng liên hệ giáo viên hoặc quản trị viên Tiếng Trung Bắc Hải để được hỗ trợ.
          </p>
          <a
            href="/"
            className="inline-block py-2.5 px-6 bg-slate-900 text-white text-sm font-semibold rounded-xl"
          >
            Quay Về Trang Chủ
          </a>
        </div>
      </div>
    );
  }

  // Check expiration for protected student routes
  if (requireActiveSubscription && user.role !== 'admin' && isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            ⏳
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tài Khoản Đã Hết Hạn</h2>
          <p className="text-sm text-slate-600 mb-6">
            Tài khoản học tập của bạn đã kết thúc thời hạn sử dụng. Vui lòng liên hệ Admin để gia hạn và tiếp tục hành trình học tập.
          </p>
          <a
            href="/student"
            className="inline-block py-2.5 px-6 bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-md"
          >
            Xem Trang Cá Nhân
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

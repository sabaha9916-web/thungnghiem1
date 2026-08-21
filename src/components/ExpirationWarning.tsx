import React from 'react';
import { AlertTriangle, Clock, PhoneCall } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const ExpirationWarning: React.FC = () => {
  const { user, isExpired, daysRemaining } = useAuth();

  if (!user || user.role === 'admin') return null;

  if (isExpired) {
    return (
      <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-900">Tài khoản học tập đã hết hạn</h4>
            <p className="text-xs text-red-700 mt-1">
              Thời hạn sử dụng đã kết thúc. Để tiếp tục truy cập các bài học từ trang 10 đến 100 và kho bài tập, vui lòng liên hệ giáo viên hoặc Admin Tiếng Trung Bắc Hải để gia hạn.
            </p>
          </div>
          <a
            href="tel:0988889916"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow transition shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Liên Hệ Giáo Viên
          </a>
        </div>
      </div>
    );
  }

  if (daysRemaining !== null && daysRemaining <= 7) {
    return (
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 mb-6 rounded-r-xl shadow-sm">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900">Cảnh báo: Tài khoản của bạn sắp hết hạn!</h4>
            <p className="text-xs text-amber-700 mt-1">
              Tài khoản chỉ còn <strong className="font-bold text-amber-900">{daysRemaining} ngày</strong> sử dụng ({user.expiresAt ? new Date(user.expiresAt).toLocaleDateString('vi-VN') : ''}). Hãy gia hạn sớm để không gián đoạn tiến trình học tập.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

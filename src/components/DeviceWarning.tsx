import React from 'react';
import { Smartphone, ShieldAlert, X, RefreshCw } from 'lucide-react';

interface DeviceWarningProps {
  isOpen: boolean;
  onClose: () => void;
  deviceDetails?: {
    browser?: string;
    platform?: string;
    deviceInfo?: string;
    lastHeartbeat?: number;
  };
  onRetry?: () => void;
}

export const DeviceWarning: React.FC<DeviceWarningProps> = ({
  isOpen,
  onClose,
  deviceDetails,
  onRetry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-center text-slate-900 mb-2">
          Tài Khoản Đang Đăng Nhập Trên Thiết Bị Khác
        </h3>

        <p className="text-sm text-slate-600 text-center mb-5 leading-relaxed">
          Để bảo mật quyền lợi học tập và bảo vệ bản quyền giáo trình, mỗi tài khoản học viên chỉ được phép sử dụng trên <strong className="text-slate-900">1 thiết bị tại một thời điểm</strong>.
        </p>

        {deviceDetails && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-5 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Smartphone className="w-4 h-4 text-orange-500" />
              Thiết bị đang hoạt động:
            </div>
            <div className="pl-6 text-slate-600">
              • Trình duyệt: <span className="font-semibold text-slate-800">{deviceDetails.browser || 'Chrome/Safari'}</span>
            </div>
            <div className="pl-6 text-slate-600">
              • Nền tảng: <span className="font-semibold text-slate-800">{deviceDetails.platform || 'Thiết bị di động/PC'}</span>
            </div>
            {deviceDetails.lastHeartbeat && (
              <div className="pl-6 text-slate-500 text-[11px]">
                • Tín hiệu cuối: {Math.max(1, Math.round((Date.now() - deviceDetails.lastHeartbeat) / 1000))} giây trước
              </div>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Kiểm Tra Lại
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
          >
            Đã Hiểu
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400 mt-4">
          Nếu bạn đã tắt thiết bị cũ hoặc bị kẹt phiên, vui lòng liên hệ Admin/Giáo viên để được <strong>[Mở Khóa Máy]</strong> từ xa.
        </p>
      </div>
    </div>
  );
};

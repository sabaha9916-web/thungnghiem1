import React from 'react';
import { X, User, Calendar, Smartphone, Shield, BookOpen, CheckCircle, Clock, Award, Key, Phone, Mail } from 'lucide-react';
import { Student } from '../types/student';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => void;
  onUnlockDevice: () => void;
  onGenerateLink: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onExtend,
  onUnlockDevice,
  onGenerateLink
}) => {
  if (!isOpen || !student) return null;

  const now = Date.now();
  const expTime = new Date(student.expiresAt).getTime();
  const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
  const isOnline = student.activeSession && (now - student.activeSession.lastHeartbeat <= 90000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-bold text-lg">
              {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'H'}
            </div>
            <div>
              <h3 className="font-extrabold text-base">{student.fullName}</h3>
              <p className="text-xs text-slate-300 font-mono">@{student.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          
          {/* Status Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg font-bold ${
              student.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
              student.status === 'locked' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
            }`}>
              Trạng thái: {student.status === 'active' ? 'Hoạt động' : student.status === 'locked' ? 'Bị khóa' : 'Hết hạn'}
            </span>

            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
              isOnline ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></span>
              {isOnline ? 'Đang online học' : 'Ngoại tuyến'}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 font-bold">
              {diffDays > 0 ? `Còn ${diffDays} ngày` : 'Đã hết hạn'}
            </span>
          </div>

          {/* Account Details Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Thông Tin Liên Hệ & Đăng Nhập</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                <span className="font-semibold text-slate-800">{student.phone || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <span className="font-semibold text-slate-800">{student.email || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày tạo:</span>
                <span className="font-semibold text-slate-800">{new Date(student.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Hạn sử dụng:</span>
                <span className="font-semibold text-slate-800">{new Date(student.expiresAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            {student.notes && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block text-[11px]">Ghi chú khóa học:</span>
                <span className="italic text-slate-600">{student.notes}</span>
              </div>
            )}
          </div>

          {/* Active Session & Device Lock Info */}
          <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-950 uppercase text-[11px] tracking-wider flex items-center justify-between">
              <span>Khóa Thiết Bị Học (Single-Device Lock)</span>
              {student.activeSession && (
                <button
                  onClick={onUnlockDevice}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition"
                >
                  Mở Khóa Máy Này
                </button>
              )}
            </h4>

            {student.activeSession ? (
              <div className="space-y-1 text-slate-600">
                <div>• Trình duyệt: <strong className="text-slate-800">{student.activeSession.browser}</strong></div>
                <div>• Nền tảng: <strong className="text-slate-800">{student.activeSession.platform}</strong></div>
                <div>• Session ID: <span className="font-mono text-[11px] text-slate-500">{student.activeSession.sessionId}</span></div>
                <div>• Đăng nhập lúc: {new Date(student.activeSession.loginAt).toLocaleString('vi-VN')}</div>
                <div>• Heartbeat cuối: {Math.max(1, Math.round((now - student.activeSession.lastHeartbeat) / 1000))} giây trước</div>
              </div>
            ) : (
              <p className="text-slate-500 italic">Hiện không có thiết bị nào đang chiếm phiên học này.</p>
            )}
          </div>

          {/* Progress Overview */}
          <div className="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100 space-y-2">
            <h4 className="font-bold text-indigo-950 uppercase text-[11px] tracking-wider">Tiến Độ Học Tập Sách 100 Trang</h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Đã hoàn thành</span>
                <span className="text-lg font-extrabold text-indigo-900">{student.progressCount || 0} / 100</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Điểm tích lũy</span>
                <span className="text-lg font-extrabold text-orange-600">{(student.progressCount || 0) * 50} XP</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Tiến độ</span>
                <span className="text-lg font-extrabold text-emerald-600">
                  {Math.round(((student.progressCount || 0) / 100) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={onExtend}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition text-center"
            >
              + Gia Hạn Ngày Học
            </button>
            <button
              onClick={onGenerateLink}
              className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition text-center"
            >
              Tạo Link 1 Chạm
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

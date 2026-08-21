import React, { useState } from 'react';
import { X, Calendar, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { Student } from '../types/student';
import { extendStudentAccount } from '../firebase/students';

interface ExtendAccountModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newExpiresAt: string) => void;
}

export const ExtendAccountModal: React.FC<ExtendAccountModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [days, setDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const currentExpiry = new Date(student.expiresAt);
  const isCurrentlyExpired = Date.now() > currentExpiry.getTime();

  const handleExtend = async (extendDays: number) => {
    setLoading(true);
    setErrorMsg(null);

    const res = await extendStudentAccount(student.id || student.username, extendDays);
    setLoading(false);

    if (res.success && res.newExpiresAt) {
      onSuccess(res.newExpiresAt);
      onClose();
    } else {
      setErrorMsg(res.message || 'Lỗi gia hạn tài khoản.');
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseInt(customDays, 10);
    if (!isNaN(d) && d > 0) {
      handleExtend(d);
    } else {
      setErrorMsg('Vui lòng nhập số ngày gia hạn hợp lệ (> 0).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-extrabold text-base">Gia Hạn Tài Khoản Học Viên</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Target Student Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Học viên:</span>
              <span className="font-bold text-slate-900">{student.fullName} ({student.username})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hạn hiện tại:</span>
              <span className={`font-bold ${isCurrentlyExpired ? 'text-red-600' : 'text-slate-800'}`}>
                {currentExpiry.toLocaleDateString('vi-VN')} {isCurrentlyExpired && '(Đã hết hạn)'}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Quick Extend Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700">Chọn gói gia hạn nhanh:</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: '+7 ngày', days: 7 },
                { label: '+30 ngày', days: 30 },
                { label: '+90 ngày', days: 90 },
              ].map((item) => (
                <button
                  key={item.days}
                  onClick={() => handleExtend(item.days)}
                  disabled={loading}
                  className="py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs sm:text-sm transition flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days Form */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700">Hoặc nhập số ngày tùy chỉnh:</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Số ngày (vd: 120)"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={loading || !customDays}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Gia Hạn
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Key, Plus, Copy, Check, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { ActivationCode } from '../types/student';
import { createActivationCode, getActivationCodes } from '../firebase/students';

interface ActivationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivationCodeModal: React.FC<ActivationCodeModalProps> = ({
  isOpen,
  onClose
}) => {
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [durationDays, setDurationDays] = useState<number>(90);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCodes = async () => {
    const list = await getActivationCodes();
    setCodes(list);
  };

  useEffect(() => {
    if (isOpen) {
      fetchCodes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createActivationCode(durationDays, notes);
    setLoading(false);
    if (res.success) {
      setNotes('');
      fetchCodes();
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base">Quản Lý Mã Kích Hoạt (Activation Codes)</h3>
              <p className="text-[11px] text-amber-100">Sinh mã ACT6-XXXX-XXXX chuẩn Crypto-Safe</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-amber-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generator Form */}
        <div className="p-6 border-b border-slate-200 bg-amber-50/30">
          <form onSubmit={handleGenerate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời hạn</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                >
                  <option value={30}>30 ngày (1 tháng)</option>
                  <option value={90}>90 ngày (3 tháng)</option>
                  <option value={180}>180 ngày (6 tháng)</option>
                  <option value={365}>365 ngày (1 năm)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú mục đích cấp mã</label>
                <input
                  type="text"
                  placeholder="ví dụ: Tặng học viên lớp HSK 2, Quà tặng khai giảng..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>TẠO MÃ KÍCH HOẠT MỚI (ACT6)</span>
            </button>
          </form>
        </div>

        {/* List of Activation Codes */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Danh sách mã đã phát hành ({codes.length})
          </h4>

          {codes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có mã kích hoạt nào. Hãy bấm nút tạo ở trên!
            </div>
          ) : (
            codes.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{item.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.used ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.used ? 'Đã sử dụng' : 'Khả dụng'}
                    </span>
                    <span className="text-[11px] font-semibold text-orange-600">{item.durationDays} ngày</span>
                  </div>
                  {item.notes && <p className="text-[11px] text-slate-500">{item.notes}</p>}
                  {item.used && item.usedBy && (
                    <p className="text-[10px] text-slate-400">Được kích hoạt bởi: <strong>{item.usedBy}</strong> lúc {new Date(item.usedAt || '').toLocaleDateString('vi-VN')}</p>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(item.code)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
                  title="Sao chép mã"
                >
                  {copiedCode === item.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

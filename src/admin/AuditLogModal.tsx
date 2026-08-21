import React, { useState, useEffect } from 'react';
import { X, FileText, Shield, User, Clock, CheckCircle } from 'lucide-react';
import { AuditLog } from '../types/student';
import { getAuditLogs } from '../firebase/students';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAuditLogs().then(data => {
        setLogs(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base">Nhật Ký Hoạt Động Hệ Thống (Audit Logs)</h3>
              <p className="text-[11px] text-slate-300">Ghi lại toàn bộ thao tác bảo mật của Admin & Học viên</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Log List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <span className="inline-block w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></span>
              <div>Đang tải dữ liệu nhật ký...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Chưa có bản ghi hoạt động nào.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 text-slate-800 uppercase">
                      {log.action}
                    </span>
                    {log.targetUsername && (
                      <span className="font-bold text-slate-900">
                        Đối tượng: @{log.targetUsername}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </span>
                </div>

                <p className="text-slate-600 pl-1">{log.details}</p>

                <div className="text-[10px] text-slate-400 pl-1">
                  Thực hiện bởi: <strong className="text-slate-700">{log.performedBy}</strong>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

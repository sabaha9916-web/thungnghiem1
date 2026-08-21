import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Smartphone, 
  Lock, 
  Unlock, 
  Key, 
  MoreVertical, 
  Clock, 
  Check, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Student } from '../types/student';
import { FilterStatus } from '../hooks/useStudent';

interface StudentTableProps {
  students: Student[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filter: FilterStatus;
  onFilterChange: (f: FilterStatus) => void;
  onOpenCreateModal: () => void;
  onOpenExtendModal: (student: Student) => void;
  onOpenEditModal: (student: Student) => void;
  onOpenDetailModal: (student: Student) => void;
  onOpenLoginLinkModal: (student: Student) => void;
  onUnlockDevice: (student: Student) => void;
  onToggleLockAccount: (student: Student) => void;
  onResetPassword: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onOpenCreateModal,
  onOpenExtendModal,
  onOpenEditModal,
  onOpenDetailModal,
  onOpenLoginLinkModal,
  onUnlockDevice,
  onToggleLockAccount,
  onResetPassword,
  onDeleteStudent
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'ALL', label: 'Tất Cả' },
    { key: 'ONLINE', label: 'Đang Online 🟢' },
    { key: 'ACTIVE', label: 'Đang Học' },
    { key: 'EXPIRING_SOON', label: 'Sắp Hết Hạn' },
    { key: 'EXPIRED', label: 'Hết Hạn' },
    { key: 'LOCKED', label: 'Bị Khóa' },
  ];

  const now = Date.now();

  const handleCopyCredentials = (student: Student) => {
    const domain = window.location.origin;
    const exp = new Date(student.expiresAt).toLocaleDateString('vi-VN');
    const text = `Thông tin tài khoản — TIẾNG TRUNG BẮC HẢI
Học viên: ${student.fullName}
Trang học: ${domain}
Tài khoản: ${student.username}
Hạn sử dụng: ${exp}
(Mỗi tài khoản học trên 1 thiết bị tại một thời điểm)`;

    navigator.clipboard.writeText(text);
    setCopiedId(student.id || student.username);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, username, SĐT..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Học Viên</th>
              <th className="py-3.5 px-4">Liên Hệ</th>
              <th className="py-3.5 px-4">Thời Hạn Sử Dụng</th>
              <th className="py-3.5 px-4 text-center">Tiến Độ (100 Trang)</th>
              <th className="py-3.5 px-4">Trạng Thái & Thiết Bị</th>
              <th className="py-3.5 px-4 text-right">Thao Tác Quản Trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Không tìm thấy học viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const expTime = new Date(student.expiresAt).getTime();
                const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
                const isExpired = diffDays <= 0 || student.status === 'expired';
                const isExpiringSoon = diffDays > 0 && diffDays <= 7;
                const isOnline = student.activeSession && (now - student.activeSession.lastHeartbeat <= 90000);

                return (
                  <tr key={student.id || student.username} className="hover:bg-slate-50/80 transition group">
                    
                    {/* Column 1: Student info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'H'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {student.fullName}
                            {student.status === 'locked' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Khóa</span>
                            )}
                          </div>
                          <div className="font-mono text-slate-500 text-[11px]">@{student.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Contact */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.phone || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {student.email || '—'}
                      </div>
                    </td>

                    {/* Column 3: Expiration */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {new Date(student.expiresAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                            <Clock className="w-3 h-3" /> Đã hết hạn
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                            <Clock className="w-3 h-3" /> Còn {diffDays} ngày
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            Còn {diffDays} ngày
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Progress */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900">
                          {student.progressCount || 0} / 100 trang
                        </span>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (student.progressCount || 0))}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Column 5: Status & Device */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`}></span>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {isOnline ? 'Đang học Online' : 'Offline'}
                          </div>
                          {student.activeSession && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-orange-500" />
                              {student.activeSession.browser} ({student.activeSession.platform})
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 6: Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Copy Info button */}
                        <button
                          onClick={() => handleCopyCredentials(student)}
                          title="Sao chép thông tin gửi Zalo/SMS"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition"
                        >
                          {copiedId === (student.id || student.username) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Extend button */}
                        <button
                          onClick={() => onOpenExtendModal(student)}
                          title="Gia hạn thời hạn sử dụng"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 transition"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {/* 1-touch link */}
                        <button
                          onClick={() => onOpenLoginLinkModal(student)}
                          title="Tạo Link 1 chạm"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>

                        {/* Unlock device */}
                        {student.activeSession && (
                          <button
                            onClick={() => onUnlockDevice(student)}
                            title="Mở khóa máy (Xóa session kẹt)"
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Toggle lock account */}
                        <button
                          onClick={() => onToggleLockAccount(student)}
                          title={student.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          className={`p-2 rounded-xl transition ${
                            student.status === 'locked'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {student.status === 'locked' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Detail / Edit */}
                        <button
                          onClick={() => onOpenDetailModal(student)}
                          title="Xem chi tiết học viên"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenEditModal(student)}
                          title="Chỉnh sửa thông tin"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE / TABLET CARDS VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
        {students.map((student) => {
          const expTime = new Date(student.expiresAt).getTime();
          const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
          const isExpired = diffDays <= 0 || student.status === 'expired';
          const isOnline = student.activeSession && (now - student.activeSession.lastHeartbeat <= 90000);

          return (
            <div
              key={student.id || student.username}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                    {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'H'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {student.fullName}
                      {isOnline && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                    </h4>
                    <p className="font-mono text-xs text-slate-500">@{student.username}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  student.status === 'locked' ? 'bg-red-100 text-red-700' :
                  isExpired ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {student.status === 'locked' ? 'Bị Khóa' : isExpired ? 'Hết hạn' : `Còn ${diffDays} ngày`}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                <div>• SĐT: <strong className="text-slate-800">{student.phone || 'Chưa có'}</strong></div>
                <div>• Hạn dùng: <strong>{new Date(student.expiresAt).toLocaleDateString('vi-VN')}</strong></div>
                <div>• Tiến độ: <strong>{student.progressCount || 0}/100 trang</strong></div>
                {student.activeSession && (
                  <div className="text-[11px] text-amber-800 font-medium">
                    • Máy: {student.activeSession.browser} ({student.activeSession.platform})
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => handleCopyCredentials(student)}
                  className="flex-1 py-2 px-2 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-700 font-semibold text-xs transition text-center flex items-center justify-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedId === (student.id || student.username) ? 'Đã chép' : 'Gửi TK'}</span>
                </button>

                <button
                  onClick={() => onOpenExtendModal(student)}
                  className="flex-1 py-2 px-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs transition text-center flex items-center justify-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  <span>Gia Hạn</span>
                </button>

                <button
                  onClick={() => onOpenDetailModal(student)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 transition"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {student.activeSession && (
                  <button
                    onClick={() => onUnlockDevice(student)}
                    className="p-2 rounded-xl bg-amber-100 text-amber-800 transition"
                    title="Mở khóa máy"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

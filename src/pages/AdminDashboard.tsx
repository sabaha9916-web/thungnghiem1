import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Key, 
  FileText, 
  Download, 
  Smartphone, 
  Clock, 
  AlertTriangle, 
  Lock, 
  ShieldCheck, 
  RefreshCw,
  Search,
  Sparkles,
  LogOut,
  Home,
  BookOpen,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStudent } from '../hooks/useStudent';
import { StudentTable } from '../admin/StudentTable';
import { CreateStudentModal } from '../admin/CreateStudentModal';
import { ExtendAccountModal } from '../admin/ExtendAccountModal';
import { EditStudentModal } from '../admin/EditStudentModal';
import { StudentDetailModal } from '../admin/StudentDetailModal';
import { ActivationCodeModal } from '../admin/ActivationCodeModal';
import { LoginLinkModal } from '../admin/LoginLinkModal';
import { AuditLogModal } from '../admin/AuditLogModal';
import { Student } from '../types/student';
import { unlockStudentDevice, toggleStudentLock, deleteStudentAccount } from '../firebase/students';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    students,
    filteredStudents,
    loading,
    stats,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    refreshStudents
  } = useStudent();

  const handleAdminLogout = async () => {
    await logout();
    navigate('/');
  };

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const [selectedStudentForExtend, setSelectedStudentForExtend] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [selectedStudentForLink, setSelectedStudentForLink] = useState<Student | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Actions
  const handleUnlockDevice = async (student: Student) => {
    if (confirm(`Bạn có chắc muốn mở khóa thiết bị (xóa session kẹt) cho học viên ${student.fullName}?`)) {
      const res = await unlockStudentDevice(student.id || student.username);
      if (res.success) {
        showToast(`Đã mở khóa thiết bị cho ${student.fullName}`);
        refreshStudents();
      }
    }
  };

  const handleToggleLock = async (student: Student) => {
    const isLocking = student.status !== 'locked';
    const actionName = isLocking ? 'khóa tài khoản' : 'mở khóa tài khoản';
    if (confirm(`Bạn có chắc muốn ${actionName} của ${student.fullName}?`)) {
      const res = await toggleStudentLock(student.id || student.username);
      if (res.success) {
        showToast(`Đã ${actionName} ${student.fullName}`);
        refreshStudents();
      }
    }
  };

  const handleDelete = async (student: Student) => {
    if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA HOÀN TOÀN học viên ${student.fullName} (${student.username})?`)) {
      const res = await deleteStudentAccount(student.id || student.username);
      if (res.success) {
        showToast(`Đã xóa học viên ${student.fullName}`);
        refreshStudents();
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Họ và tên', 'Username', 'Số điện thoại', 'Email', 'Hạn sử dụng', 'Trạng thái', 'Số trang đã học'];
    const rows = students.map(s => [
      `"${s.fullName}"`,
      `"${s.username}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${new Date(s.expiresAt).toLocaleDateString('vi-VN')}"`,
      `"${s.status}"`,
      `"${s.progressCount || 0}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hoc_vien_tieng_trung_bac_hai_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-slide-up">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ADMIN TOP NAVIGATION BAR */}
        <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-white hover:text-orange-400 transition">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold font-chinese text-base">
                北
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight">Tiếng Trung Bắc Hải</span>
            </Link>
            <span className="hidden sm:inline-block text-slate-500">/</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-800/80 text-amber-300 text-xs font-bold">
              <Shield className="w-3 h-3" />
              Hệ Thống Quản Trị
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/ebook"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>Xem Sách 100 Trang</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Trang Chủ</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Đăng xuất khỏi tài khoản Quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát tài khoản</span>
            </button>
          </div>
        </div>

        {/* TOP BAR / TITLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase">
                Admin Center
              </span>
              <span className="text-xs text-slate-400">• Tiếng Trung Bắc Hải</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Quản Trị Hệ Thống & Học Viên
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý tài khoản 100 trang, phân quyền thiết bị, sinh mã kích hoạt và link 1 chạm.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tạo Học Viên Mới</span>
            </button>

            <button
              onClick={() => setIsActivationOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-bold rounded-2xl transition"
            >
              <Key className="w-4 h-4 text-amber-600" />
              <span>Mã ACT6</span>
            </button>

            <button
              onClick={() => setIsAuditOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl transition"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Nhật Ký</span>
            </button>

            <button
              onClick={handleExportCSV}
              title="Xuất file CSV"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={refreshStudents}
              title="Làm mới dữ liệu"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 6 STATISTIC METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng Học Viên</span>
            <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
            <span className="text-[10px] text-slate-500">Đã đăng ký hệ thống</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Đang Online</span>
            <div className="text-2xl font-extrabold text-emerald-600 flex items-center gap-2">
              {stats.online}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <span className="text-[10px] text-slate-500">Tín hiệu heartbeat 90s</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Đang Học</span>
            <div className="text-2xl font-extrabold text-indigo-900">{stats.active}</div>
            <span className="text-[10px] text-slate-500">Tài khoản còn hạn</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Sắp Hết Hạn</span>
            <div className="text-2xl font-extrabold text-amber-600">{stats.expiringSoon}</div>
            <span className="text-[10px] text-slate-500">≤ 7 ngày sử dụng</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Đã Hết Hạn</span>
            <div className="text-2xl font-extrabold text-red-600">{stats.expired}</div>
            <span className="text-[10px] text-slate-500">Cần liên hệ gia hạn</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Bị Khóa</span>
            <div className="text-2xl font-extrabold text-slate-700">{stats.locked}</div>
            <span className="text-[10px] text-slate-500">Tạm dừng truy cập</span>
          </div>

        </div>

        {/* STUDENT TABLE WITH FILTERS */}
        <StudentTable
          students={filteredStudents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenExtendModal={(student) => setSelectedStudentForExtend(student)}
          onOpenEditModal={(student) => setSelectedStudentForEdit(student)}
          onOpenDetailModal={(student) => setSelectedStudentForDetail(student)}
          onOpenLoginLinkModal={(student) => setSelectedStudentForLink(student)}
          onUnlockDevice={handleUnlockDevice}
          onToggleLockAccount={handleToggleLock}
          onResetPassword={(student) => setSelectedStudentForEdit(student)}
          onDeleteStudent={handleDelete}
        />

      </div>

      {/* ALL MODALS */}
      <CreateStudentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          showToast('Tạo học viên mới thành công!');
          refreshStudents();
        }}
      />

      <ExtendAccountModal
        student={selectedStudentForExtend}
        isOpen={!!selectedStudentForExtend}
        onClose={() => setSelectedStudentForExtend(null)}
        onSuccess={(newExpiry) => {
          showToast(`Đã gia hạn tài khoản đến ${new Date(newExpiry).toLocaleDateString('vi-VN')}`);
          refreshStudents();
        }}
      />

      <EditStudentModal
        student={selectedStudentForEdit}
        isOpen={!!selectedStudentForEdit}
        onClose={() => setSelectedStudentForEdit(null)}
        onSuccess={() => {
          showToast('Cập nhật thông tin thành công!');
          refreshStudents();
        }}
      />

      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={!!selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        onExtend={() => {
          const s = selectedStudentForDetail;
          setSelectedStudentForDetail(null);
          setSelectedStudentForExtend(s);
        }}
        onUnlockDevice={() => {
          if (selectedStudentForDetail) {
            handleUnlockDevice(selectedStudentForDetail);
            setSelectedStudentForDetail(null);
          }
        }}
        onGenerateLink={() => {
          const s = selectedStudentForDetail;
          setSelectedStudentForDetail(null);
          setSelectedStudentForLink(s);
        }}
      />

      <ActivationCodeModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
      />

      <LoginLinkModal
        student={selectedStudentForLink}
        isOpen={!!selectedStudentForLink}
        onClose={() => setSelectedStudentForLink(null)}
      />

      <AuditLogModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

    </div>
  );
};

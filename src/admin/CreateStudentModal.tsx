import React, { useState } from 'react';
import { X, UserPlus, Check, Copy, Sparkles, Shield, User, Lock, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { StudentFormData, Student } from '../types/student';
import { createStudent } from '../firebase/students';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
}

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    durationDays: 90,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Created success dialog state
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickDurationOptions = [
    { label: '30 ngày (1 tháng)', days: 30 },
    { label: '90 ngày (3 tháng)', days: 90 },
    { label: '180 ngày (6 tháng)', days: 180 },
    { label: '365 ngày (1 năm)', days: 365 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.fullName.trim()) {
      setErrorMsg('Vui lòng điền Tên đăng nhập và Họ tên học viên.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const generatedPassword = formData.password?.trim() || Math.random().toString(36).slice(-6);
    const res = await createStudent({
      ...formData,
      username: formData.username.trim().toLowerCase(),
      password: generatedPassword
    });

    setLoading(false);

    if (res.success && res.student) {
      setCreatedStudent(res.student);
      setCreatedPassword(res.password || generatedPassword);
      onSuccess(res.student);
    } else {
      setErrorMsg(res.message || 'Không thể tạo học viên. Tên đăng nhập có thể đã tồn tại.');
    }
  };

  const getShareTemplate = () => {
    if (!createdStudent) return '';
    const domain = window.location.origin;
    const formattedExpiry = new Date(createdStudent.expiresAt).toLocaleDateString('vi-VN');

    return `Thông tin tài khoản học tập — TIẾNG TRUNG BẮC HẢI

Học viên: ${createdStudent.fullName}
Link học: ${domain}
Tài khoản: ${createdStudent.username}
Mật khẩu: ${createdPassword}
Hạn sử dụng: ${formattedExpiry}

Bạn vui lòng không chia sẻ tài khoản cho người khác. Hệ thống bảo mật chỉ cho phép học trên 1 thiết bị tại một thời điểm. Chúc bạn học tập tốt!`;
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(getShareTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetAndClose = () => {
    setCreatedStudent(null);
    setCreatedPassword('');
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      durationDays: 90,
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Tạo Tài Khoản Học Viên Mới</h3>
              <p className="text-[11px] text-orange-100">Cấp quyền học Ebook 100 trang Tiếng Trung Bắc Hải</p>
            </div>
          </div>
          <button onClick={handleResetAndClose} className="p-1.5 text-orange-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {createdStudent ? (
            /* SUCCESS MODAL AFTER CREATING */
            <div className="text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">TẠO TÀI KHOẢN THÀNH CÔNG</h4>
                <p className="text-xs text-slate-500 mt-1">Đã lưu thông tin học viên vào cơ sở dữ liệu Cloud Firestore</p>
              </div>

              {/* Account Credentials Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-bold text-slate-900">{createdStudent.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Username:</span>
                  <span className="font-mono font-bold text-orange-600">{createdStudent.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Password:</span>
                  <span className="font-mono font-bold text-slate-900">{createdPassword}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Hạn sử dụng:</span>
                  <span className="font-bold text-emerald-600">
                    {new Date(createdStudent.expiresAt).toLocaleDateString('vi-VN')} ({createdStudent.durationDays} ngày)
                  </span>
                </div>
              </div>

              {/* Copy Template Button */}
              <button
                onClick={handleCopyCredentials}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ĐÃ SAO CHÉP VÀO BỘ NHỚ TẠM!' : 'SAO CHÉP THÔNG TIN GỬI HỌC VIÊN'}</span>
              </button>

              <p className="text-[11px] text-slate-400">
                Nội dung sao chép đã được định dạng sẵn để gửi qua Zalo, Messenger, SMS hoặc Facebook.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Hoàn Tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            /* FORM CREATION */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="ví dụ: hocvien99"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu (Tùy chọn)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Để trống sẽ tự tạo"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên học viên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0988xxxxxx"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="hocvien@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Duration Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Thời hạn sử dụng:</span>
                  <span className="text-orange-600 font-bold">{formData.durationDays} ngày</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {quickDurationOptions.map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setFormData({ ...formData, durationDays: opt.days })}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition text-center ${
                        formData.durationDays === opt.days
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.days} ngày
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú khóa học / Lớp học</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ví dụ: Lớp HSK1 K24, đăng ký qua Zalo"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Xác Nhận Tạo Tài Khoản</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

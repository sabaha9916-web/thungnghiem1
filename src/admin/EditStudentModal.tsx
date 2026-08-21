import React, { useState, useEffect } from 'react';
import { X, Edit, User, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { Student } from '../types/student';
import { updateStudent, resetStudentPassword } from '../firebase/students';

interface EditStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Student) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFullName(student.fullName || '');
      setEmail(student.email || '');
      setPhone(student.phone || '');
      setNotes(student.notes || '');
      setNewPassword('');
      setMsg(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // If password provided, update password first
    if (newPassword.trim()) {
      await resetStudentPassword(student.id || student.username, newPassword.trim());
    }

    const res = await updateStudent(student.id || student.username, {
      fullName,
      email,
      phone,
      notes
    });

    setLoading(false);

    if (res.success && res.student) {
      onSuccess(res.student);
      onClose();
    } else {
      setMsg(res.message || 'Lỗi khi cập nhật thông tin.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-orange-400" />
            <h3 className="font-extrabold text-base">Chỉnh Sửa Thông Tin Học Viên</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {msg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {msg}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
            <span className="text-slate-500 font-medium">Tài khoản (Username):</span>
            <span className="font-mono font-bold text-orange-600">{student.username}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đặt lại mật khẩu mới (Nếu cần)</label>
            <input
              type="text"
              placeholder="Để trống nếu không muốn đổi mật khẩu"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

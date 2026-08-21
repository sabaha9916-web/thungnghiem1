import React, { useState } from 'react';
import { X, Link as LinkIcon, Copy, Check, Smartphone, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { Student } from '../types/student';
import { createLoginLinkToken } from '../firebase/students';

interface LoginLinkModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LoginLinkModal: React.FC<LoginLinkModalProps> = ({
  student,
  isOpen,
  onClose
}) => {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const handleGenerate = async () => {
    setLoading(true);
    const res = await createLoginLinkToken(student.id || student.username);
    setLoading(false);

    if (res.success && res.loginUrl) {
      setLoginUrl(res.loginUrl);
    }
  };

  const getFullShareMessage = () => {
    if (!loginUrl) return '';
    return `Chào bạn ${student.fullName},

Đây là link đăng nhập 1 chạm vào hệ thống Ebook Tiếng Trung Bắc Hải dành riêng cho bạn:
${loginUrl}

(Lưu ý: Link chỉ có hiệu lực sử dụng 1 lần để bảo mật tài khoản). Chúc bạn học tốt!`;
  };

  const handleCopy = () => {
    if (!loginUrl) return;
    navigator.clipboard.writeText(getFullShareMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LinkIcon className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base">Tạo Link Đăng Nhập 1 Chạm</h3>
              <p className="text-[11px] text-indigo-100">Đăng nhập trực tiếp không cần nhập mật khẩu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-indigo-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-xs text-slate-700 space-y-1">
            <div>Học viên nhận link: <strong className="text-indigo-950 font-bold">{student.fullName}</strong> ({student.username})</div>
            <div>Trạng thái tài khoản: <span className="font-semibold text-emerald-600">{student.status}</span></div>
          </div>

          {!loginUrl ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Hệ thống sẽ sinh ra một Token bảo mật ngẫu nhiên mã hóa 128-bit kết nối với tài khoản này. Link chỉ sử dụng một lần và hết hạn sau 7 ngày nếu không dùng.
              </p>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>TẠO LINK ĐĂNG NHẬP NGAY</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Đường dẫn 1 chạm:</label>
                <div className="font-mono text-xs text-indigo-700 break-all select-all font-semibold bg-white p-2.5 rounded-lg border border-slate-200">
                  {loginUrl}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ĐÃ SAO CHÉP LỜI NHẮN!' : 'SAO CHÉP TIN NHẮN GỬI HỌC VIÊN'}</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Có thể dán trực tiếp vào Zalo, SMS, Messenger của học viên.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

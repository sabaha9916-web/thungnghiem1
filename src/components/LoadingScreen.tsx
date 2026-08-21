import React from 'react';
import { BookOpen } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Đang kết nối Tiếng Trung Bắc Hải...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm text-white">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 animate-spin blur-md opacity-75"></div>
        <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 shadow-xl">
          <BookOpen className="w-8 h-8 text-orange-400 animate-pulse" />
        </div>
      </div>
      <h2 className="text-xl font-bold tracking-wide text-slate-100 mb-2 font-chinese">北海中文 — TIẾNG TRUNG BẮC HẢI</h2>
      <p className="text-sm text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};

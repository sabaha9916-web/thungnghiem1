import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, List, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleToc: () => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onToggleToc
}) => {
  const { user } = useAuth();
  const { isLessonCompleted, markLessonComplete } = useProgress();
  const [jumpInput, setJumpInput] = useState<string>('');

  const completed = isLessonCompleted(currentPage);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpInput('');
    }
  };

  return (
    <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur border-t border-slate-200 shadow-md py-2.5 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trang Trước</span>
        </button>

        {/* Center: TOC & Page Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onToggleToc}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition"
          >
            <List className="w-4 h-4" />
            <span>Mục Lục</span>
          </button>

          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-bold text-slate-800">Trang</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={`${currentPage}`}
              className="w-12 sm:w-14 text-center py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <span className="text-xs sm:text-sm text-slate-500 font-medium">/ {totalPages}</span>
          </form>

          {/* Mark completed button for logged-in students */}
          {user && user.role !== 'admin' && (
            <button
              onClick={() => markLessonComplete(currentPage)}
              title={completed ? "Đã hoàn thành bài học này" : "Đánh dấu hoàn thành bài học (+50 XP)"}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                completed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${completed ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{completed ? 'Đã Học' : 'Hoàn Thành'}</span>
            </button>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 shadow-sm"
        >
          <span className="hidden sm:inline">Trang Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

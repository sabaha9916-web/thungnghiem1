import React, { useState } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  Lock, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  ChevronRight, 
  X,
  Share2,
  Award
} from 'lucide-react';
import { EbookPage, VocabularyItem } from '../types/ebook';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { ProtectedPage } from '../components/ProtectedPage';

interface EbookReaderProps {
  page: EbookPage;
  totalPages: number;
  onSelectPage: (pageNumber: number) => void;
  onOpenLogin: () => void;
  isTocOpen: boolean;
  onCloseToc: () => void;
  allPages: EbookPage[];
}

export const EbookReader: React.FC<EbookReaderProps> = ({
  page,
  totalPages,
  onSelectPage,
  onOpenLogin,
  isTocOpen,
  onCloseToc,
  allPages
}) => {
  const { user, isExpired } = useAuth();
  const { progress, markLessonComplete, toggleVocab, isLessonCompleted } = useProgress();

  const [selectedExerciseOption, setSelectedExerciseOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [audioPlayingText, setAudioPlayingText] = useState<string | null>(null);

  const isCompleted = isLessonCompleted(page.page);
  const requiresAuth = page.requiresLogin;
  const isAccessible = !requiresAuth || (user && user.status === 'active' && !isExpired);

  // Browser Speech Synthesis for standard Chinese voice
  const speakChinese = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // Slightly slower for clear learners' listening
    setAudioPlayingText(text);
    utterance.onend = () => setAudioPlayingText(null);
    utterance.onerror = () => setAudioPlayingText(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative max-w-4xl mx-auto pb-24">
      
      {/* Table of Contents Drawer / Modal */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseToc}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-slide-right">
            
            {/* TOC Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  Mục Lục 100 Trang
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Trang 1-9 Miễn phí • Trang 10-100 Bản quyền</p>
              </div>
              <button onClick={onCloseToc} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TOC List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5">
              {allPages.map((p) => {
                const isCurrent = p.page === page.page;
                const isDone = isLessonCompleted(p.page);
                const isLocked = p.requiresLogin && (!user || isExpired);

                return (
                  <button
                    key={p.page}
                    onClick={() => {
                      onSelectPage(p.page);
                      onCloseToc();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs sm:text-sm font-medium transition ${
                      isCurrent
                        ? 'bg-orange-600 text-white shadow-sm font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.page}
                      </span>
                      <div className="truncate">
                        <div className="truncate font-semibold">{p.title}</div>
                        {p.chineseTitle && (
                          <div className={`text-[11px] font-chinese truncate ${isCurrent ? 'text-orange-100' : 'text-slate-400'}`}>
                            {p.chineseTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isDone && (
                        <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-500'}`} />
                      )}
                      {isLocked ? (
                        <Lock className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-amber-500'}`} />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Main Ebook Content Container */}
      {!isAccessible ? (
        <ProtectedPage
          pageNumber={page.page}
          title={page.title}
          onOpenLogin={onOpenLogin}
        />
      ) : (
        <article className="ebook-paper rounded-3xl border border-amber-900/10 p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in">
          
          {/* Header Banner */}
          <div className="border-b border-amber-900/10 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Chuyên Đề {page.unit}: {page.unitTitle}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Trang {page.page} / {totalPages}
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-vietnamese">
              {page.title}
            </h1>
            {page.chineseTitle && (
              <div className="flex items-center gap-3 mt-2">
                <h2 className="text-xl sm:text-2xl font-chinese font-bold text-orange-700">
                  {page.chineseTitle}
                </h2>
                <button
                  onClick={() => speakChinese(page.chineseTitle!)}
                  title="Nghe phát âm chuẩn"
                  className="p-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {page.intro && (
              <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-vietnamese italic bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                {page.intro}
              </p>
            )}
          </div>

          {/* Dialogue Section */}
          {page.dialogue && page.dialogue.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-vietnamese">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  Hội Thoại Ứng Dụng (情景对话)
                </h3>
                <button
                  onClick={() => speakChinese(page.dialogue!.map(d => d.chinese).join('，'))}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800 bg-orange-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Nghe Toàn Bộ Hội Thoại
                </button>
              </div>

              <div className="space-y-3">
                {page.dialogue.map((line, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-700 font-vietnamese">
                          {line.speaker}:
                        </span>
                        <p className="text-base sm:text-lg font-chinese font-semibold text-slate-900">
                          {line.chinese}
                        </p>
                      </div>
                      <button
                        onClick={() => speakChinese(line.chinese)}
                        className="p-1 text-slate-400 hover:text-orange-600 transition"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-mono text-orange-700 pl-4">{line.pinyin}</p>
                    <p className="text-xs sm:text-sm text-slate-600 pl-4 font-vietnamese">{line.translation}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Grammar Points Section */}
          {page.grammar && page.grammar.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-vietnamese">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Ngữ Pháp Trọng Điểm (核心语法)
              </h3>

              <div className="space-y-4">
                {page.grammar.map((g, idx) => (
                  <div key={idx} className="bg-indigo-50/40 rounded-2xl p-5 border border-indigo-100 space-y-3">
                    <h4 className="font-bold text-indigo-950 text-base font-vietnamese">{g.title}</h4>
                    <div className="bg-white/80 p-3 rounded-xl border border-indigo-200/60 text-xs sm:text-sm font-semibold text-indigo-900 font-mono">
                      {g.structure}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-vietnamese leading-relaxed">
                      {g.explanation}
                    </p>

                    {g.examples && g.examples.length > 0 && (
                      <div className="pt-2 border-t border-indigo-100/80 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">Ví Dụ Minh Họa:</span>
                        {g.examples.map((ex, exIdx) => (
                          <div key={exIdx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-chinese font-bold text-slate-900">{ex.chinese}</span>
                              <button onClick={() => speakChinese(ex.chinese)} className="text-slate-400 hover:text-indigo-600">
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-[11px] text-orange-600 font-mono">{ex.pinyin}</div>
                            <div className="text-slate-600 font-vietnamese">{ex.translation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Vocabulary Table */}
          {page.vocabulary && page.vocabulary.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-vietnamese">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Bảng Từ Vựng Trọng Tâm (生词表)
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Chữ Hán</th>
                      <th className="py-3 px-4">Phiên Âm</th>
                      <th className="py-3 px-4">Hán Việt</th>
                      <th className="py-3 px-4">Ý Nghĩa</th>
                      <th className="py-3 px-4 text-center">Âm Thanh</th>
                      <th className="py-3 px-4 text-center">Lưu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {page.vocabulary.map((item) => {
                      const isSaved = progress.savedVocabIds?.includes(item.id);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-chinese text-base sm:text-lg font-bold text-slate-900">
                            {item.hanzi}
                          </td>
                          <td className="py-3 px-4 font-mono text-orange-600 font-medium">
                            {item.pinyin}
                          </td>
                          <td className="py-3 px-4 font-vietnamese text-slate-500">
                            {item.hanViet}
                          </td>
                          <td className="py-3 px-4 font-vietnamese font-medium text-slate-800">
                            {item.meaning}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => speakChinese(item.hanzi)}
                              className="p-1.5 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleVocab(item.id)}
                              title={isSaved ? "Bỏ lưu từ" : "Lưu vào sổ tay từ vựng"}
                              className={`p-1.5 rounded-lg transition ${
                                isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-600'
                              }`}
                            >
                              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Interactive Practice Exercises */}
          {page.exercises && page.exercises.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-vietnamese">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Luyện Tập & Củng Cố Kiến Thức (课堂练习)
              </h3>

              {page.exercises.map((ex, idx) => {
                const isAnswered = selectedExerciseOption !== null;
                const isCorrect = selectedExerciseOption === ex.correctIndex;

                return (
                  <div key={idx} className="bg-amber-50/30 rounded-2xl p-5 border border-amber-200/80 space-y-4">
                    <p className="font-bold text-slate-900 text-sm sm:text-base font-vietnamese">
                      Câu hỏi: {ex.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ex.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700';

                        if (isAnswered) {
                          if (optIdx === ex.correctIndex) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                          } else if (optIdx === selectedExerciseOption) {
                            btnStyle = 'bg-red-50 border-red-500 text-red-800 font-bold';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setSelectedExerciseOption(optIdx);
                              setShowExplanation(true);
                            }}
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition ${btnStyle}`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showExplanation && (
                      <div className={`p-4 rounded-xl text-xs sm:text-sm font-vietnamese ${
                        isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        <div className="font-bold mb-1">
                          {isCorrect ? '✓ Chính xác! Rất xuất sắc!' : '✗ Chưa chính xác. Hãy xem giải thích bên dưới:'}
                        </div>
                        <p>{ex.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Cultural Note */}
          {page.culturalNote && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200/60 text-xs sm:text-sm text-slate-700 font-vietnamese">
              <h4 className="font-bold text-orange-950 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                Góc Văn Hóa & Lời Khuyên Học Tập
              </h4>
              <p className="leading-relaxed">{page.culturalNote}</p>
            </div>
          )}

          {/* Completion Action */}
          {user && user.role !== 'admin' && (
            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Hoàn thành trang bài học này?</h4>
                <p className="text-xs text-slate-500">Đánh dấu hoàn thành để ghi nhận điểm kinh nghiệm (+50 XP) và chuỗi ngày học streak.</p>
              </div>

              <button
                onClick={() => markLessonComplete(page.page)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? '✓ Đã Hoàn Thành' : 'Đánh Dấu Hoàn Thành'}</span>
              </button>
            </div>
          )}

        </article>
      )}

    </div>
  );
};

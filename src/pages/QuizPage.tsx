import React, { useState, useMemo } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import { EBOOK_PAGES } from '../ebook/ebookData';
import { useProgress } from '../hooks/useProgress';
import confetti from 'canvas-confetti';

export const QuizPage: React.FC = () => {
  const { recordQuiz, progress } = useProgress();
  const [selectedUnit, setSelectedUnit] = useState<number | 'ALL'>('ALL');
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Extract all exercises from 100 pages
  const quizPool = useMemo(() => {
    const list: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      page: number;
      unit: number;
    }[] = [];

    EBOOK_PAGES.forEach(page => {
      if (page.exercises) {
        page.exercises.forEach(ex => {
          if (selectedUnit === 'ALL' || page.unit === selectedUnit) {
            list.push({
              ...ex,
              page: page.page,
              unit: page.unit
            });
          }
        });
      }
    });

    return list.slice(0, 10); // Take 10 questions per quiz session
  }, [selectedUnit]);

  const startQuiz = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setQuizFinished(false);
    setQuizStarted(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (userAnswers[currentIndex] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < quizPool.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    let correctCount = 0;
    quizPool.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    // Record score
    recordQuiz(`unit_${selectedUnit}`, correctCount, quizPool.length);

    if (correctCount >= quizPool.length * 0.7) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const currentQ = quizPool[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold uppercase">
                Luyện Tập & Đánh Giá
              </span>
              <span className="text-xs text-slate-400">• Tiếng Trung Bắc Hải</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Phòng Luyện Quiz & Trắc Nghiệm
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kiểm tra nhanh kiến thức ngữ pháp, từ vựng và mẫu câu theo chuyên đề.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 shrink-0">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-900">{progress.xp} XP</span>
          </div>
        </div>

        {/* NOT STARTED: SETUP SCREEN */}
        {!quizStarted && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl text-white flex items-center justify-center mx-auto shadow-lg text-3xl">
              📝
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Chọn Chuyên Đề Kiểm Tra</h2>
              <p className="text-xs text-slate-500">
                Mỗi lượt thi gồm 10 câu hỏi trắc nghiệm lấy từ giáo trình 100 trang.
              </p>
            </div>

            <div className="max-w-sm mx-auto">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800"
              >
                <option value="ALL">Toàn Bộ 10 Chuyên Đề (Tổng Hợp 100 Trang)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(u => (
                  <option key={u} value={u}>Chuyên Đề {u} (Trang {(u - 1) * 10 + 1} - {u * 10})</option>
                ))}
              </select>
            </div>

            <button
              onClick={startQuiz}
              className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-orange-500/25 transition hover:scale-105"
            >
              Bắt Đầu Làm Bài
            </button>
          </div>
        )}

        {/* QUIZ IN PROGRESS */}
        {quizStarted && !quizFinished && currentQ && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Câu hỏi {currentIndex + 1} / {quizPool.length}</span>
              <span>Chuyên Đề {currentQ.unit} (Trang {currentQ.page})</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / quizPool.length) * 100}%` }}
              ></div>
            </div>

            {/* Question */}
            <div className="py-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-vietnamese leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentIndex] === optIdx;
                const isAnswered = userAnswers[currentIndex] !== undefined;
                const isCorrect = optIdx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-50 border-red-500 text-red-900 font-bold';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {userAnswers[currentIndex] !== undefined && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm font-vietnamese text-amber-900 space-y-1 animate-fade-in">
                <div className="font-bold">Giải thích chi tiết:</div>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {/* Next button */}
            {userAnswers[currentIndex] !== undefined && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-2xl shadow-md transition"
                >
                  <span>{currentIndex < quizPool.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* QUIZ FINISHED: RESULTS SCREEN */}
        {quizFinished && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-3xl font-bold">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">Hoàn Thành Bài Luyện Tập!</h2>
              <p className="text-xs text-slate-500">
                Chúc mừng bạn đã hoàn thành bài kiểm tra kiến thức
              </p>
            </div>

            {/* Score */}
            <div className="inline-block p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Kết Quả Đạt Được</span>
              <div className="text-4xl font-extrabold text-orange-600">
                {quizPool.filter((q, idx) => userAnswers[idx] === q.correctIndex).length} / {quizPool.length}
              </div>
              <span className="text-xs font-semibold text-emerald-600 block mt-2">
                +{(quizPool.filter((q, idx) => userAnswers[idx] === q.correctIndex).length) * 20} Điểm Kinh Nghiệm (XP)
              </span>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={startQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-2xl shadow-md transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm Lại Lượt Mới</span>
              </button>
              <button
                onClick={() => setQuizStarted(false)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition"
              >
                Chọn Chuyên Đề Khác
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

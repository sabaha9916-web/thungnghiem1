import React, { useState, useMemo } from 'react';
import { 
  BookMarked, 
  Search, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight,
  Filter 
} from 'lucide-react';
import { EBOOK_PAGES } from '../ebook/ebookData';
import { VocabularyItem } from '../types/ebook';
import { useProgress } from '../hooks/useProgress';

export const VocabularyPage: React.FC = () => {
  const { progress, toggleVocab } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<number | 'ALL'>('ALL');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'TABLE' | 'FLASHCARD'>('TABLE');

  // Flashcard state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Extract all vocabulary items from 100 pages
  const allVocabList = useMemo(() => {
    const list: (VocabularyItem & { pageNumber: number; unitNumber: number })[] = [];
    const seen = new Set<string>();

    EBOOK_PAGES.forEach(page => {
      if (page.vocabulary) {
        page.vocabulary.forEach(v => {
          if (!seen.has(v.hanzi)) {
            seen.add(v.hanzi);
            list.push({
              ...v,
              pageNumber: page.page,
              unitNumber: page.unit
            });
          }
        });
      }
    });

    return list;
  }, []);

  // Filtered vocabulary
  const filteredVocab = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allVocabList.filter(item => {
      const matchUnit = selectedUnit === 'ALL' || item.unitNumber === selectedUnit;
      const matchSaved = !onlySaved || progress.savedVocabIds?.includes(item.id);
      const matchQuery = !query ||
        item.hanzi.includes(query) ||
        item.pinyin.toLowerCase().includes(query) ||
        item.hanViet.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query);

      return matchUnit && matchSaved && matchQuery;
    });
  }, [allVocabList, searchQuery, selectedUnit, onlySaved, progress.savedVocabIds]);

  const speakChinese = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const currentCard = filteredVocab[flashcardIndex] || filteredVocab[0];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[11px] font-bold uppercase">
                Kho Từ Vựng HSK
              </span>
              <span className="text-xs text-slate-400">• Tiếng Trung Bắc Hải</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Sổ Tay Từ Vựng & Flashcard 100 Trang
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tổng hợp toàn bộ từ vựng trọng tâm kèm phát âm chuẩn, bính âm và âm Hán Việt.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dạng Bảng Danh Sách
            </button>
            <button
              onClick={() => { setViewMode('FLASHCARD'); setFlashcardIndex(0); setIsFlipped(false); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'FLASHCARD' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Luyện Flashcard</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm từ Hán, bính âm, nghĩa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Unit Filter */}
            <div>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700"
              >
                <option value="ALL">Tất Cả Chuyên Đề (1-10)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(u => (
                  <option key={u} value={u}>Chuyên Đề {u}</option>
                ))}
              </select>
            </div>

            {/* Only Saved Bookmark Filter */}
            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition ${
                onlySaved
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${onlySaved ? 'fill-white' : 'text-amber-500'}`} />
              <span>Sổ Tay Đã Lưu ({progress.savedVocabIds?.length || 0})</span>
            </button>

          </div>
        </div>

        {/* VIEW 1: TABLE VIEW */}
        {viewMode === 'TABLE' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Chữ Hán</th>
                    <th className="py-3 px-4">Bính Âm (Pinyin)</th>
                    <th className="py-3 px-4">Hán Việt</th>
                    <th className="py-3 px-4">Ý Nghĩa</th>
                    <th className="py-3 px-4">Chuyên Đề</th>
                    <th className="py-3 px-4 text-center">Phát Âm</th>
                    <th className="py-3 px-4 text-center">Lưu Sổ Tay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVocab.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Không tìm thấy từ vựng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredVocab.map((item) => {
                      const isSaved = progress.savedVocabIds?.includes(item.id);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-chinese text-lg sm:text-xl font-bold text-slate-900">
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
                          <td className="py-3 px-4 text-slate-500 text-xs">
                            CĐ {item.unitNumber} (Trang {item.pageNumber})
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
                              className={`p-1.5 rounded-lg transition ${
                                isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-600'
                              }`}
                            >
                              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: FLASHCARD VIEW */}
        {viewMode === 'FLASHCARD' && currentCard && (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold px-2">
              <span>Thẻ số {flashcardIndex + 1} / {filteredVocab.length}</span>
              <span>Bấm vào thẻ để lật mặt</span>
            </div>

            {/* Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-80 rounded-3xl bg-white border-2 border-slate-200 hover:border-orange-400 shadow-xl cursor-pointer p-8 flex flex-col items-center justify-center text-center transition transform hover:scale-[1.01] relative select-none"
            >
              {!isFlipped ? (
                /* Front Side: Hanzi + Pinyin */
                <div className="space-y-4">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">CHỮ HÁN</span>
                  <div className="font-chinese text-6xl font-extrabold text-slate-900">
                    {currentCard.hanzi}
                  </div>
                  <div className="font-mono text-xl font-bold text-orange-600">
                    {currentCard.pinyin}
                  </div>
                  <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" /> Chạm để xem nghĩa tiếng Việt
                  </p>
                </div>
              ) : (
                /* Back Side: Vietnamese Translation & Details */
                <div className="space-y-3">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">Ý NGHĨA & HÁN VIỆT</span>
                  <div className="text-2xl font-extrabold text-slate-900 font-vietnamese">
                    {currentCard.meaning}
                  </div>
                  <div className="text-sm font-bold text-slate-500">
                    Hán Việt: <span className="text-slate-800">{currentCard.hanViet}</span>
                  </div>
                  <div className="text-xs text-slate-400 pt-2">
                    Chuyên đề {currentCard.unitNumber} • Trang {currentCard.pageNumber}
                  </div>
                </div>
              )}

              {/* Speak button inside card */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakChinese(currentCard.hanzi);
                }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Flashcard Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  setFlashcardIndex(prev => Math.max(0, prev - 1));
                  setIsFlipped(false);
                }}
                disabled={flashcardIndex === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-40 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Thẻ Trước
              </button>

              <button
                onClick={() => toggleVocab(currentCard.id)}
                className={`p-3 rounded-2xl border transition ${
                  progress.savedVocabIds?.includes(currentCard.id)
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-amber-500'
                }`}
                title="Lưu vào sổ tay"
              >
                <Bookmark className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setFlashcardIndex(prev => Math.min(filteredVocab.length - 1, prev + 1));
                  setIsFlipped(false);
                }}
                disabled={flashcardIndex >= filteredVocab.length - 1}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 disabled:opacity-40 shadow-md"
              >
                Thẻ Tiếp
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

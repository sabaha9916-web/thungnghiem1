import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { StudentProgress } from '../types/student';
import { getStudentProgress, completeLesson, toggleSavedVocab, submitQuizScore } from '../firebase/progress';
import confetti from 'canvas-confetti';

const DEFAULT_PROGRESS: StudentProgress = {
  completedLessons: {},
  unitProgress: {},
  savedVocabIds: [],
  quizBestScores: {},
  unlockedAchievements: [],
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState<boolean>(true);

  // Load progress on user change
  const refreshProgress = useCallback(async () => {
    if (!user || user.role === 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getStudentProgress(user.username);
      if (data) {
        setProgress(data);
      }
    } catch (e) {
      console.warn("Failed to load progress:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.username, user?.role]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  // Mark lesson page completed
  const markLessonComplete = async (pageNumber: number) => {
    if (!user || user.role === 'admin') return;

    // Optimistic UI update
    setProgress(prev => ({
      ...prev,
      completedLessons: { ...prev.completedLessons, [pageNumber]: true },
      xp: prev.completedLessons[pageNumber] ? prev.xp : prev.xp + 50
    }));

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }

    // Call server
    const res = await completeLesson(user.username, pageNumber);
    if (res.success && res.progress) {
      setProgress(res.progress);
    }
  };

  // Toggle bookmark / saved vocabulary
  const toggleVocab = async (vocabId: string) => {
    if (!user) return;
    const isSaved = progress.savedVocabIds.includes(vocabId);
    setProgress(prev => ({
      ...prev,
      savedVocabIds: isSaved
        ? prev.savedVocabIds.filter(id => id !== vocabId)
        : [...prev.savedVocabIds, vocabId]
    }));

    const res = await toggleSavedVocab(user.username, vocabId);
    if (res.success && res.savedVocabIds) {
      setProgress(prev => ({ ...prev, savedVocabIds: res.savedVocabIds! }));
    }
  };

  // Record quiz score
  const recordQuiz = async (quizId: string, score: number, total: number) => {
    if (!user) return;
    const res = await submitQuizScore(user.username, quizId, score, total);
    if (res.success) {
      refreshProgress();
    }
  };

  const completedCount = Object.keys(progress.completedLessons || {}).length;
  const progressPercent = Math.min(100, Math.round((completedCount / 100) * 100));

  return {
    progress,
    loading,
    completedCount,
    progressPercent,
    markLessonComplete,
    toggleVocab,
    recordQuiz,
    refreshProgress,
    isLessonCompleted: (page: number) => !!progress.completedLessons?.[page]
  };
}

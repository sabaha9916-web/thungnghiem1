import { StudentProgress } from '../types/student';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch current student profile and progress
 */
export async function getStudentProgress(username: string): Promise<StudentProgress | null> {
  try {
    const data = await safeFetchJson<{ success: boolean; progress?: StudentProgress }>(`/api/student/progress?username=${encodeURIComponent(username)}`);
    return data?.progress || null;
  } catch (err) {
    console.error("Error fetching student progress:", err);
    return null;
  }
}

/**
 * Mark a lesson page as completed and award XP
 */
export async function completeLesson(username: string, pageNumber: number): Promise<{ success: boolean; progress?: StudentProgress; xpGained?: number }> {
  try {
    const data = await safeFetchJson<{ success: boolean; progress?: StudentProgress; xpGained?: number }>('/api/student/complete-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pageNumber })
    });
    return data || { success: false };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Toggle saved vocabulary item for review
 */
export async function toggleSavedVocab(username: string, vocabId: string): Promise<{ success: boolean; savedVocabIds?: string[] }> {
  try {
    const data = await safeFetchJson<{ success: boolean; savedVocabIds?: string[] }>('/api/student/toggle-vocab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, vocabId })
    });
    return data || { success: false };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Submit Quiz result and record best score
 */
export async function submitQuizScore(username: string, quizId: string, score: number, total: number): Promise<{ success: boolean; xpGained?: number }> {
  try {
    const data = await safeFetchJson<{ success: boolean; xpGained?: number }>('/api/student/quiz-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, quizId, score, total })
    });
    return data || { success: false };
  } catch (err) {
    return { success: false };
  }
}

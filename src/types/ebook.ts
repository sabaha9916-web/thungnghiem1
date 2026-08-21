export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  hanViet: string;
  meaning: string;
  exampleSentence?: string;
  examplePinyin?: string;
  exampleMeaning?: string;
  audio?: string;
  level?: string;
}

export interface DialogueLine {
  speaker: string;
  chinese: string;
  pinyin: string;
  translation: string;
}

export interface GrammarPoint {
  title: string;
  structure: string;
  explanation: string;
  examples: {
    chinese: string;
    pinyin: string;
    translation: string;
  }[];
}

export interface PracticeExercise {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EbookPage {
  page: number;
  unit: number;
  unitTitle: string;
  title: string;
  chineseTitle?: string;
  requiresLogin: boolean;
  intro?: string;
  dialogue?: DialogueLine[];
  grammar?: GrammarPoint[];
  vocabulary?: VocabularyItem[];
  exercises?: PracticeExercise[];
  culturalNote?: string;
  tips?: string[];
}

export interface QuizQuestion {
  id: string;
  pageNumber: number;
  question: string;
  chinese?: string;
  pinyin?: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type QuestionType =
  | 'choice'
  | 'fill'
  | 'build'
  | 'truefalse'
  | 'odd'
  | 'match'
  | 'listen'
  | 'dialog'
  | 'wordsearch';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title?: string;
  georgianHint?: string;
  audioText?: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  clockTime?: { hour: number; minute: number }; // For analog clock questions
}

export interface FillQuestion extends BaseQuestion {
  type: 'fill';
  sentence: string; // Uses ___ for gaps
  answers: string[][]; // Array of acceptable answers for each gap: [ ["eine"], ["Die"], ["Sie"] ]
  chips?: string[]; // Available word chips
  typed?: boolean; // Whether typed input is default/allowed
  hintInBrackets?: string; // E.g. "(verbringen)"
  explanation?: string;
}

export interface BuildQuestion extends BaseQuestion {
  type: 'build';
  prompt?: string;
  targetSentence: string;
  tokens: string[]; // Word chips including distractors
  acceptableSentences?: string[]; // Alternate word sequences
  explanation?: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse';
  statement: string;
  isTrue: boolean;
  dialogContext?: string[]; // Optional dialog lines for context
  explanation?: string;
}

export interface OddQuestion extends BaseQuestion {
  type: 'odd';
  prompt: string; // "რომელი არ ერგება?"
  options: string[];
  oddIndex: number;
  reason: string; // Georgian reason why it doesn't fit
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  pairs: MatchPair[];
}

export interface ListenQuestion extends BaseQuestion {
  type: 'listen';
  targetSentence: string;
  tokens: string[]; // Chips including 1-2 distractors
  acceptableSentences?: string[];
  explanation?: string;
}

export interface DialogLine {
  speaker: string;
  text: string;
}

export interface DialogQuestion extends BaseQuestion {
  type: 'dialog';
  dialogLines: DialogLine[];
  subQuestion: ChoiceQuestion | TrueFalseQuestion;
}

export interface WordSearchTarget {
  german: string;
  georgian: string;
  start?: [number, number];
  end?: [number, number];
}

export interface WordSearchQuestion extends BaseQuestion {
  type: 'wordsearch';
  grid: string[][];
  words: WordSearchTarget[];
}

export type Question =
  | ChoiceQuestion
  | FillQuestion
  | BuildQuestion
  | TrueFalseQuestion
  | OddQuestion
  | MatchQuestion
  | ListenQuestion
  | DialogQuestion
  | WordSearchQuestion;

export interface Lesson {
  id: string; // e.g. "2.1", "2.2", "2-boss"
  unitId: 'modul-2' | 'modul-3';
  unitTitle: string; // "მოდული 2" | "მოდული 3"
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  isBoss?: boolean;
  heartsCost?: number; // 3 for boss, 5 otherwise
  questions: Question[];
}

export interface Unit {
  id: 'modul-2' | 'modul-3';
  title: string;
  subtitle: string;
  color: 'green' | 'blue';
  bannerBg: string;
  lessons: Lesson[];
}

export interface DictionaryEntry {
  german: string;
  article?: string;
  plural?: string;
  georgian: string;
  category?: string;
  exampleSentence?: string;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayXp: number;
  hearts: number;
  maxHearts: number;
  lastHeartLossTime: number; // timestamp
  completedLessons: Record<string, { stars: number; completedAt: string }>;
  unlockedLessons: string[]; // IDs
  mistakes: Array<{ question: Question; failedAt: number }>;
  soundEnabled: boolean;
  typingModeEnabled: boolean;
  darkMode: boolean;
}

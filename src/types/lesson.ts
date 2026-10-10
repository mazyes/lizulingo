export type QuestionType =
  | 'choice'
  | 'fill'
  | 'build'
  | 'truefalse'
  | 'odd'
  | 'match'
  | 'listen'
  | 'dialog'
  | 'wordsearch'
  | 'picture'
  | 'translate'
  | 'speak';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title?: string;
  georgianHint?: string;
  audioText?: string;
  translation?: string; // Tap-to-reveal Georgian translation for German sentences
  explanation?: string; // Georgian explanation when user makes a mistake
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  prompt: string;
  options: string[];
  correctAnswer: string;
  clockTime?: { hour: number; minute: number }; // For analog clock questions
}

export interface FillQuestion extends BaseQuestion {
  type: 'fill';
  sentence: string; // Uses ___ for gaps
  answers: string[][]; // Array of acceptable answers for each gap: [ ["eine"], ["Die"], ["Sie"] ]
  chips?: string[]; // Available word chips
  typed?: boolean; // Whether typed input is default/allowed
  hintInBrackets?: string; // E.g. "(verbringen)"
}

export interface BuildQuestion extends BaseQuestion {
  type: 'build';
  prompt?: string;
  targetSentence: string;
  tokens: string[]; // Word chips including distractors
  acceptableSentences?: string[]; // Alternate word sequences
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse';
  statement: string;
  isTrue: boolean;
  dialogContext?: string[]; // Dialog lines providing full context on screen
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
}

export interface DialogLine {
  speaker: string;
  text: string;
  translation?: string;
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

export interface PictureOption {
  id: string;
  emoji: string;
  label: string;
}

export interface PictureQuestion extends BaseQuestion {
  type: 'picture';
  germanWord: string;
  article?: 'der' | 'die' | 'das';
  options: PictureOption[];
  correctId: string;
}

export interface TranslateQuestion extends BaseQuestion {
  type: 'translate';
  sourceSentence: string;
  targetSentence: string;
  fromGeorgian: boolean; // true = Georgian -> German, false = German -> Georgian
  tokens: string[];
  acceptableSentences?: string[];
}

export interface SpeakQuestion extends BaseQuestion {
  type: 'speak';
  targetSentence: string;
  georgianTranslation: string;
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
  | WordSearchQuestion
  | PictureQuestion
  | TranslateQuestion
  | SpeakQuestion;

export interface WordTeachCard {
  type: 'word';
  german: string;
  article?: 'der' | 'die' | 'das';
  plural?: string;
  georgian: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  image?: string; // Emoji or SVG symbol
}

export interface RuleTeachCard {
  type: 'rule';
  title: string;
  ruleGeorgian: string; // Max 3 short lines in Georgian
  table?: {
    headers: string[];
    rows: string[][];
  };
  examples: Array<{
    german: string;
    georgian: string;
  }>;
  liziBubble?: string; // What Lizi says
}

export type TeachCard = WordTeachCard | RuleTeachCard;

export type UnitId = 'modul-1' | 'modul-2' | 'modul-3' | 'modul-4' | 'modul-5' | 'modul-6';

export interface Lesson {
  id: string; // e.g. "1.1", "1-boss", "2.1"
  unitId: UnitId;
  unitTitle: string; // "მოდული 1", etc.
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  isBoss?: boolean;
  heartsCost?: number; // 3 for boss, 5 otherwise
  storyIntro?: string; // Story snippet: "ლიზი ბერლინში ჩავიდა..."
  location?: string; // "Berlin", "Heide", "Hamburg", "Ostsee", "Düsseldorf", "München"
  teachCards?: TeachCard[]; // 4-8 swipeable teaching cards (Phase 1)
  questions: Question[];
}

export interface Unit {
  id: UnitId;
  title: string;
  subtitle: string;
  city: string; // Berlin, Heide, Hamburg, Ostsee, Düsseldorf, München
  color: 'green' | 'blue' | 'purple' | 'amber' | 'teal' | 'rose';
  bannerBg: string;
  lessons: Lesson[];
}

export interface DictionaryEntry {
  german: string;
  article?: string;
  plural?: string;
  georgian: string;
  category?: string;
  module?: UnitId;
  exampleSentence?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
  rewardXp: number;
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
  wordsLearned: string[]; // Words seen on teach cards
  achievements: Record<string, boolean>; // e.g. { first_lesson: true, streak_7: false, ... }
  placementCompleted: boolean;
  dailyQuests?: DailyQuest[];
}


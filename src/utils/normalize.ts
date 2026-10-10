import { Question } from '../types/lesson';

/**
 * Standard German punctuation and symbols to strip
 */
const PUNCT_REGEX = /[.,!?:;\-–—"„“”'()…/\\_]/g;

/**
 * Remove all punctuation, symbols and collapse multiple whitespace
 */
export function cleanGermanText(text: string): string {
  if (!text) return '';
  return text
    .replace(PUNCT_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes German strings for checking answers:
 * - Trims whitespace and collapses multiple spaces
 * - Lowercases
 * - Removes all punctuation and symbols everywhere: . , ! ? : ; - – — " „ “ ” ' ( ) … / \ _
 * - Maps ß -> ss
 * - Maps umlauts: ä -> a, ö -> o, ü -> u
 * - Maps ae -> a, oe -> o, ue -> u
 * - Case-insensitive (Sie/sie, Die/die treated as equal)
 */
export function normalizeGerman(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(PUNCT_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u')
    .trim();
}

/**
 * Normalizes German while preserving exact umlauts and eszett
 */
export function normalizeGermanExact(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(PUNCT_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits sentence into clean lowercase word tokens
 */
export function tokenizeSentence(text: string): string[] {
  if (!text) return [];
  return cleanGermanText(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Damerau-Levenshtein distance calculation
 * Handles insertion, deletion, substitution, and transposition of adjacent characters
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const d: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return d[al][bl];
}

/**
 * Comprehensive set of German grammar words (articles, pronouns, prepositions).
 * No typo tolerance is permitted on these words because endings determine grammatical correctness.
 */
export const GRAMMAR_WORDS = new Set([
  // Articles
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
  'kein', 'keine', 'keinen', 'keinem', 'keiner', 'keines',
  // Possessives
  'mein', 'meine', 'meinen', 'meinem', 'meiner', 'meines',
  'dein', 'deine', 'deinen', 'deinem', 'deiner', 'deines',
  'sein', 'seine', 'seinen', 'seinem', 'seiner', 'seines',
  'ihr', 'ihre', 'ihren', 'ihrem', 'ihrer', 'ihres',
  'unser', 'unsere', 'unseren', 'unserem', 'unserer', 'unseres',
  'euer', 'eure', 'euren', 'eurem', 'eurer', 'eures',
  // Personal & interrogative pronouns
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr',
  'mich', 'dich', 'ihn', 'uns', 'euch',
  'mir', 'dir', 'ihm', 'ihnen',
  'wer', 'wen', 'wem', 'wessen', 'was', 'wo', 'woher', 'wohin', 'wie', 'wann', 'warum',
  // Contracted prepositions
  'am', 'im', 'ans', 'ins', 'zum', 'zur', 'beim', 'vom',
]);

const VERB_ENDINGS = ['st', 'en', 'te', 'test', 'tet', 'ten', 'e', 't'];

/**
 * Checks if two words differ purely by a verb inflectional ending (e.g. lernt vs lernst)
 */
function isVerbEndingMismatch(a: string, b: string): boolean {
  if (a.length < 4 || b.length < 4) return false;
  for (const endA of VERB_ENDINGS) {
    if (a.endsWith(endA)) {
      const stemA = a.slice(0, -endA.length);
      for (const endB of VERB_ENDINGS) {
        if (endB !== endA && b.endsWith(endB)) {
          const stemB = b.slice(0, -endB.length);
          if (stemA === stemB && stemA.length >= 3) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Checks a single typed word against a list of acceptable answers
 */
export function checkTypedWord(
  userInput: string,
  acceptableAnswers: string[],
  contextWords?: string[]
): 'correct' | 'almost' | 'wrong' {
  const normUserExact = normalizeGermanExact(userInput);
  const normUserGeneral = normalizeGerman(userInput);

  if (!normUserGeneral) return 'wrong';

  // 1. Exact match (preserving umlauts and eszett, or standard eszett expansion)
  for (const ans of acceptableAnswers) {
    const normAnsExact = normalizeGermanExact(ans);
    if (normUserExact === normAnsExact) return 'correct';
    if (normUserExact.replace(/ß/g, 'ss') === normAnsExact.replace(/ß/g, 'ss')) {
      // e.g. "Straße" vs "Strasse"
      return 'almost';
    }
  }

  // 2. Missing umlauts or alternate spelling (e.g. schon for schön, Groesse for Größe)
  for (const ans of acceptableAnswers) {
    const normAnsGeneral = normalizeGerman(ans);
    if (normUserGeneral === normAnsGeneral) {
      return 'almost';
    }
  }

  // 3. Typo tolerance: only for words of 5+ letters that are NOT grammar words
  // Collect other options/chips in question to avoid confusion with another correct form
  const forbiddenForms = new Set<string>();
  if (contextWords) {
    for (const w of contextWords) {
      forbiddenForms.add(normalizeGerman(w));
    }
  }

  for (const ans of acceptableAnswers) {
    const cleanAns = normalizeGermanExact(ans);
    const cleanUser = normUserExact;

    // Check if either word is in grammar words list
    if (GRAMMAR_WORDS.has(cleanAns) || GRAMMAR_WORDS.has(cleanUser)) {
      continue;
    }

    // Check if user input equals another option/form in context
    if (forbiddenForms.has(cleanUser) && !acceptableAnswers.map(normalizeGerman).includes(cleanUser)) {
      continue;
    }

    // Check if words differ by verb endings (e.g. lernst vs lernt)
    if (isVerbEndingMismatch(cleanAns, cleanUser)) {
      continue;
    }

    const dist = damerauLevenshtein(cleanUser, cleanAns);
    if (cleanAns.length >= 9 && dist <= 2) {
      return 'almost';
    }
    if (cleanAns.length >= 5 && dist <= 1) {
      return 'almost';
    }
  }

  return 'wrong';
}

/**
 * Unified checkAnswer function for all Question types.
 * Returns: 'correct' | 'almost' | 'wrong'
 */
export function checkAnswer(question: Question, input: unknown): 'correct' | 'almost' | 'wrong' {
  if (input === null || input === undefined) return 'wrong';

  switch (question.type) {
    case 'choice': {
      let userChoice = '';
      if (typeof input === 'number') {
        userChoice = question.options[input] || '';
      } else if (typeof input === 'string') {
        userChoice = input;
      }

      // Check if options collide under normalizeGerman
      const normOptions = question.options.map(o => normalizeGerman(o));
      const hasCollision = new Set(normOptions).size !== normOptions.length;

      if (hasCollision) {
        // Compare strictly
        return userChoice.trim() === question.correctAnswer.trim() ? 'correct' : 'wrong';
      }

      // Exact match
      if (normalizeGermanExact(userChoice) === normalizeGermanExact(question.correctAnswer)) {
        return 'correct';
      }
      // General normalized match
      if (normalizeGerman(userChoice) === normalizeGerman(question.correctAnswer)) {
        return 'correct';
      }
      return 'wrong';
    }

    case 'fill': {
      const inputs = Array.isArray(input)
        ? input
        : typeof input === 'object'
        ? Object.values(input as Record<string, string>)
        : [String(input)];

      if (inputs.length < question.answers.length) return 'wrong';

      let hasAlmost = false;
      const contextWords = question.answers.flat();

      for (let i = 0; i < question.answers.length; i++) {
        const userVal = String(inputs[i] || '');
        const res = checkTypedWord(userVal, question.answers[i], contextWords);
        if (res === 'wrong') return 'wrong';
        if (res === 'almost') hasAlmost = true;
      }

      return hasAlmost ? 'almost' : 'correct';
    }

    case 'build':
    case 'translate':
    case 'listen': {
      let userStr = '';
      if (Array.isArray(input)) {
        userStr = input.map(String).join(' ');
      } else if (typeof input === 'string') {
        userStr = input;
      }

      const cleanUserTokens = tokenizeSentence(userStr).map(normalizeGermanExact);

      const targetSentences = [
        question.targetSentence,
        ...(question.acceptableSentences || []),
      ];

      for (const sent of targetSentences) {
        const cleanTargetTokens = tokenizeSentence(sent).map(normalizeGermanExact);
        if (cleanUserTokens.length === cleanTargetTokens.length) {
          const match = cleanUserTokens.every(
            (tok, idx) => tok === cleanTargetTokens[idx] || normalizeGerman(tok) === normalizeGerman(cleanTargetTokens[idx])
          );
          if (match) return 'correct';
        }
      }

      return 'wrong';
    }

    case 'picture': {
      return String(input) === question.correctId ? 'correct' : 'wrong';
    }

    case 'truefalse': {
      return Boolean(input) === question.isTrue ? 'correct' : 'wrong';
    }

    case 'odd': {
      if (typeof input === 'number') {
        return input === question.oddIndex ? 'correct' : 'wrong';
      }
      if (typeof input === 'string') {
        return normalizeGerman(input) === normalizeGerman(question.options[question.oddIndex])
          ? 'correct'
          : 'wrong';
      }
      return 'wrong';
    }

    case 'dialog': {
      if (question.subQuestion.type === 'choice') {
        let userChoice = '';
        if (typeof input === 'number') {
          userChoice = question.subQuestion.options[input] || '';
        } else if (typeof input === 'string') {
          userChoice = input;
        }
        return normalizeGerman(userChoice) === normalizeGerman(question.subQuestion.correctAnswer)
          ? 'correct'
          : 'wrong';
      }
      if (question.subQuestion.type === 'truefalse') {
        return Boolean(input) === question.subQuestion.isTrue ? 'correct' : 'wrong';
      }
      return 'wrong';
    }

    case 'match': {
      if (input === true) return 'correct';
      if (typeof input === 'object' && input !== null) {
        const pairs = input as Record<string, string>;
        const allMatched = question.pairs.every(p => pairs[p.left] === p.right);
        return allMatched ? 'correct' : 'wrong';
      }
      return 'wrong';
    }

    case 'wordsearch': {
      if (input === true) return 'correct';
      if (Array.isArray(input)) {
        const found = new Set(input.map(w => normalizeGerman(String(w))));
        const allFound = question.words.every(w => {
          const wordStr = typeof w === 'string' ? w : w.german;
          return found.has(normalizeGerman(wordStr));
        });
        return allFound ? 'correct' : 'wrong';
      }
      return 'wrong';
    }

    case 'speak': {
      if (input === true) return 'correct';
      if (typeof input === 'string') {
        const cleanUser = normalizeGerman(input);
        const cleanTarget = normalizeGerman(question.targetSentence);
        if (cleanUser === cleanTarget) return 'correct';

        const userTokens = tokenizeSentence(input);
        const targetTokens = tokenizeSentence(question.targetSentence);
        if (userTokens.length > 0 && targetTokens.length > 0) {
          const matchedCount = userTokens.filter(t => targetTokens.includes(t)).length;
          const ratio = matchedCount / targetTokens.length;
          if (ratio >= 0.75) return 'almost';
        }
      }
      return 'wrong';
    }

    default: {
      // TypeScript exhaustive check: if a new question type is added, this will cause a compile error!
      const _never: never = question;
      void _never;
      return 'wrong';
    }
  }
}

/**
 * Returns canonical expected answer string for display
 */
export function getExpectedAnswer(question: Question): string {
  switch (question.type) {
    case 'choice':
      return question.correctAnswer;
    case 'fill':
      return question.answers.map(arr => arr[0]).join(' / ');
    case 'build':
    case 'translate':
    case 'listen':
      return question.targetSentence;
    case 'picture': {
      const opt = question.options.find(o => o.id === question.correctId);
      return opt ? `${opt.emoji} ${opt.label}` : question.germanWord;
    }
    case 'truefalse':
      return question.isTrue ? 'Richtig (სწორია)' : 'Falsch (მცდარია)';
    case 'odd':
      return question.options[question.oddIndex];
    case 'dialog':
      return question.subQuestion.type === 'choice'
        ? question.subQuestion.correctAnswer
        : question.subQuestion.isTrue
        ? 'Richtig'
        : 'Falsch';
    case 'match':
      return 'ყველა წყვილი';
    case 'wordsearch':
      return question.words.map(w => (typeof w === 'string' ? w : w.german)).join(', ');
    case 'speak':
      return question.targetSentence;
    default: {
      const _never: never = question;
      void _never;
      return '';
    }
  }
}

/**
 * Backward compatibility helpers
 */
export function isAnswerMatch(userInput: string, acceptableAnswers: string[]): boolean {
  return checkTypedWord(userInput, acceptableAnswers) !== 'wrong';
}

export function isSentenceMatch(userSentence: string, targetSentence: string, alternatives?: string[]): boolean {
  const q: Question = {
    id: 'compat',
    type: 'build',
    targetSentence,
    acceptableSentences: alternatives,
    tokens: [],
    georgianHint: '',
  };
  return checkAnswer(q, userSentence) !== 'wrong';
}

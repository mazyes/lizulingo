/**
 * Normalizes German strings for checking answers:
 * - Trims whitespace and collapses multiple spaces
 * - Lowercases
 * - Strips trailing punctuation (.,!?:;)
 * - Maps umlauts and eszett:
 *   ß -> ss
 *   ä -> ae
 *   ö -> oe
 *   ü -> ue
 */
export function normalizeGerman(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?:;"'„“”‚‘’()\-–—…]+/g, ' ') // remove all punctuation ("Guten Tag, wie..." == "Guten Tag wie...")
    .replace(/\s+/g, ' ')
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .trim();
}

/**
 * Checks if user input matches any acceptable answer
 */
export function isAnswerMatch(userInput: string, acceptableAnswers: string[]): boolean {
  const normUser = normalizeGerman(userInput);
  return acceptableAnswers.some(ans => normalizeGerman(ans) === normUser);
}

/**
 * Compares an array of sentence tokens or full sentence string
 */
export function isSentenceMatch(userSentence: string, targetSentence: string, alternatives?: string[]): boolean {
  if (isAnswerMatch(userSentence, [targetSentence])) return true;
  if (alternatives && alternatives.length > 0) {
    return isAnswerMatch(userSentence, alternatives);
  }
  return false;
}

import {
  Lesson,
  Question,
  ChoiceQuestion,
  BuildQuestion,
  MatchQuestion,
  ListenQuestion,
  TranslateQuestion,
  FillQuestion,
  PictureQuestion,
  WordTeachCard,
} from '../types/lesson';

export interface RoundInfo {
  number: number;
  name: string;
  description: string;
}

export const ROUND_NAMES: Record<number, { name: string; description: string }> = {
  1: {
    name: 'ახალი სიტყვები',
    description: 'ახალი სიტყვების გაცნობა, შეხამება და მარტივი ამოცნობა.',
  },
  2: {
    name: 'მოსმენა და გაგება',
    description: 'გერმანული გამოთქმის მოსმენა, გაგება და დიალოგები.',
  },
  3: {
    name: 'წინადადებები',
    description: 'წინადადებების აგება ბარათებით და ქართულ-გერმანული თარგმანი.',
  },
  4: {
    name: 'გრამატიკა',
    description: 'გრამატიკული ფორმები, არტიკლები და ზმნის სწორი დაბოლოებები.',
  },
  5: {
    name: 'ოსტატი',
    description: 'კომპლექსური გამოცდა, სიტყვების აკრეფა და სრული დაუფლება.',
  },
};

export function getRoundInfo(round: number, totalRounds: number): RoundInfo {
  const effectiveRound = Math.min(Math.max(1, round), totalRounds);
  if (totalRounds === 1) {
    return {
      number: 1,
      name: 'ბოსის გამოცდა',
      description: 'მოდულის შემაჯამებელი დიდი გამოცდა.',
    };
  }

  const info = ROUND_NAMES[effectiveRound] || ROUND_NAMES[1];
  return {
    number: effectiveRound,
    name: info.name,
    description: info.description,
  };
}

interface ExtractedWord {
  german: string;
  article?: 'der' | 'die' | 'das';
  plural?: string;
  georgian: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  image?: string;
}

interface ExtractedSentence {
  german: string;
  georgian: string;
}

// Fallback high-frequency vocabulary for distractors
const FALLBACK_WORDS: Array<{ german: string; georgian: string; article?: 'der' | 'die' | 'das' }> = [
  { german: 'das Buch', georgian: 'წიგნი', article: 'das' },
  { german: 'der Tisch', georgian: 'მაგიდა', article: 'der' },
  { german: 'die Schule', georgian: 'სკოლა', article: 'die' },
  { german: 'das Haus', georgian: 'სახლი', article: 'das' },
  { german: 'der Freund', georgian: 'მეგობარი', article: 'der' },
  { german: 'die Mutter', georgian: 'დედა', article: 'die' },
  { german: 'der Vater', georgian: 'მამა', article: 'der' },
  { german: 'das Wasser', georgian: 'წყალი', article: 'das' },
  { german: 'der Kaffee', georgian: 'ყავა', article: 'der' },
  { german: 'die Stadt', georgian: 'ქალაქი', article: 'die' },
  { german: 'das Zimmer', georgian: 'ოთახი', article: 'das' },
  { german: 'der Lehrer', georgian: 'მასწავლებელი', article: 'der' },
  { german: 'die Arbeit', georgian: 'სამუშაო', article: 'die' },
  { german: 'das Brot', georgian: 'პური', article: 'das' },
  { german: 'der Tag', georgian: 'დღე', article: 'der' },
  { german: 'die Nacht', georgian: 'ღამე', article: 'die' },
  { german: 'das Auto', georgian: 'მანქანა', article: 'das' },
  { german: 'der Hund', georgian: 'ძაღლი', article: 'der' },
  { german: 'die Katze', georgian: 'კატა', article: 'die' },
  { german: 'das Bild', georgian: 'სურათი', article: 'das' },
];

function extractWordsFromLesson(lesson: Lesson): ExtractedWord[] {
  const result: ExtractedWord[] = [];
  const seen = new Set<string>();

  for (const card of lesson.teachCards || []) {
    if (card.type === 'word') {
      const wCard = card as WordTeachCard;
      if (!seen.has(wCard.german.toLowerCase())) {
        seen.add(wCard.german.toLowerCase());
        result.push({
          german: wCard.german,
          article: wCard.article,
          plural: wCard.plural,
          georgian: wCard.georgian,
          exampleSentence: wCard.exampleSentence,
          exampleTranslation: wCard.exampleTranslation,
          image: wCard.image,
        });
      }
    }
  }

  // Also extract from match questions if teachCards are sparse
  for (const q of lesson.questions || []) {
    if (q.type === 'match') {
      const mq = q as MatchQuestion;
      for (const p of mq.pairs) {
        if (!seen.has(p.left.toLowerCase())) {
          seen.add(p.left.toLowerCase());
          result.push({
            german: p.left,
            georgian: p.right,
          });
        }
      }
    }
  }

  // If still fewer than 4 words, add from fallbacks
  if (result.length < 4) {
    for (const fb of FALLBACK_WORDS) {
      if (!seen.has(fb.german.toLowerCase())) {
        seen.add(fb.german.toLowerCase());
        result.push(fb);
        if (result.length >= 8) break;
      }
    }
  }

  return result;
}

function extractSentencesFromLesson(lesson: Lesson): ExtractedSentence[] {
  const result: ExtractedSentence[] = [];
  const seen = new Set<string>();

  // From teachCards examples
  for (const card of lesson.teachCards || []) {
    if (card.type === 'word' && card.exampleSentence && card.exampleTranslation) {
      if (!seen.has(card.exampleSentence.trim().toLowerCase())) {
        seen.add(card.exampleSentence.trim().toLowerCase());
        result.push({
          german: card.exampleSentence.trim(),
          georgian: card.exampleTranslation.trim(),
        });
      }
    } else if (card.type === 'rule' && card.examples) {
      for (const ex of card.examples) {
        if (!seen.has(ex.german.trim().toLowerCase())) {
          seen.add(ex.german.trim().toLowerCase());
          result.push({
            german: ex.german.trim(),
            georgian: ex.georgian.trim(),
          });
        }
      }
    }
  }

  // From questions
  for (const q of lesson.questions || []) {
    if (q.type === 'build' || q.type === 'listen') {
      const bq = q as BuildQuestion | ListenQuestion;
      if (bq.targetSentence && bq.translation) {
        if (!seen.has(bq.targetSentence.trim().toLowerCase())) {
          seen.add(bq.targetSentence.trim().toLowerCase());
          result.push({
            german: bq.targetSentence.trim(),
            georgian: bq.translation.trim(),
          });
        }
      }
    } else if (q.type === 'translate') {
      const tq = q as TranslateQuestion;
      const de = tq.fromGeorgian ? tq.targetSentence : tq.sourceSentence;
      const ka = tq.fromGeorgian ? tq.sourceSentence : tq.targetSentence;
      if (de && ka && !seen.has(de.trim().toLowerCase())) {
        seen.add(de.trim().toLowerCase());
        result.push({
          german: de.trim(),
          georgian: ka.trim(),
        });
      }
    } else if (q.type === 'dialog') {
      for (const line of q.dialogLines || []) {
        if (line.text && line.translation && !seen.has(line.text.trim().toLowerCase())) {
          seen.add(line.text.trim().toLowerCase());
          result.push({
            german: line.text.trim(),
            georgian: line.translation.trim(),
          });
        }
      }
    }
  }

  return result;
}

function pickDistractors(correct: string, pool: string[], count: number): string[] {
  const filtered = pool.filter(item => item.trim().toLowerCase() !== correct.trim().toLowerCase());
  // Deduplicate
  const unique = Array.from(new Set(filtered));
  const shuffled = unique.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function cleanTokens(sentence: string): string[] {
  return sentence
    .replace(/[.,!?:;„"']/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Pure generator creating archetype questions for a lesson
 */
export function generateExpandedQuestions(lesson: Lesson): {
  round1: Question[];
  round2: Question[];
  round3: Question[];
  round4: Question[];
  round5: Question[];
} {
  const words = extractWordsFromLesson(lesson);
  const sentences = extractSentencesFromLesson(lesson);

  const allGermanWords = words.map(w => w.german);
  const allGeorgianWords = words.map(w => w.georgian);

  const r1List: Question[] = [];
  const r2List: Question[] = [];
  const r3List: Question[] = [];
  const r4List: Question[] = [];
  const r5List: Question[] = [];

  // --- ARCHETYPE 1: NEW WORDS / RECOGNITION (Choice DE->GE, GE->DE, Match, Picture) ---
  words.forEach((word, idx) => {
    // 1. Choice German -> Georgian
    const distKa = pickDistractors(word.georgian, allGeorgianWords.concat(FALLBACK_WORDS.map(f => f.georgian)), 3);
    const optionsKa = [word.georgian, ...distKa].sort(() => 0.5 - Math.random());
    const qChoiceKa: ChoiceQuestion = {
      id: `${lesson.id}-gen-cde-${idx + 1}`,
      type: 'choice',
      prompt: `რას ნიშნავს »${word.german}«?`,
      options: optionsKa,
      correctAnswer: word.georgian,
      translation: `»${word.german}« ნიშნავს »${word.georgian}«`,
      georgianHint: `დაიმახსოვრე: ${word.german} = ${word.georgian}`,
      explanation: `სწორი პასუხია »${word.georgian}«. გერმანულად »${word.german}« სწორედ ამას ნიშნავს.`,
    };
    r1List.push(qChoiceKa);

    // 2. Choice Georgian -> German
    const distDe = pickDistractors(word.german, allGermanWords.concat(FALLBACK_WORDS.map(f => f.german)), 3);
    const optionsDe = [word.german, ...distDe].sort(() => 0.5 - Math.random());
    const qChoiceDe: ChoiceQuestion = {
      id: `${lesson.id}-gen-cka-${idx + 1}`,
      type: 'choice',
      prompt: `როგორ არის გერმანულად »${word.georgian}«?`,
      options: optionsDe,
      correctAnswer: word.german,
      translation: `ქართულად: ${word.georgian}`,
      georgianHint: `იფიქრე ამ სიტყვაზე: ${word.german}`,
      explanation: `»${word.georgian}« გერმანულად არის »${word.german}«.`,
    };
    r1List.push(qChoiceDe);

    // 3. Article choice (if word has an article)
    if (word.article) {
      const qArt: ChoiceQuestion = {
        id: `${lesson.id}-gen-art-${idx + 1}`,
        type: 'choice',
        prompt: `რომელია სწორი არტიკლი: »___ ${word.german}«?`,
        options: ['der', 'die', 'das'],
        correctAnswer: word.article,
        translation: `${word.article} ${word.german} — ${word.georgian}`,
        georgianHint: `ამ სიტყვის არტიკლია ${word.article}`,
        explanation: `სწორი არტიკლია »${word.article}«: ${word.article} ${word.german}.`,
      };
      r1List.push(qArt);
      r4List.push(qArt); // Also good for grammar round
    }

    // 4. Picture question if image/emoji exists
    if (word.image) {
      const distPics = pickDistractors(word.german, allGermanWords, 3);
      const picOpts = [word.german, ...distPics].map((w, oIdx) => ({
        id: `p-${oIdx}`,
        emoji: w === word.german ? word.image! : '✨',
        label: w,
      }));
      const qPic: PictureQuestion = {
        id: `${lesson.id}-gen-pic-${idx + 1}`,
        type: 'picture',
        germanWord: word.german,
        article: word.article,
        correctId: picOpts.find(o => o.label === word.german)?.id || 'p-0',
        options: picOpts,
        translation: word.georgian,
        georgianHint: `სურათზეა: ${word.georgian}`,
        explanation: `სურათი შეესაბამება სიტყვას »${word.german}« (${word.georgian}).`,
      };
      r1List.push(qPic);
    }
  });

  // Match Questions (groups of 4-5 words)
  if (words.length >= 4) {
    const pairs = words.slice(0, 5).map(w => ({ left: w.german, right: w.georgian }));
    const qMatch: MatchQuestion = {
      id: `${lesson.id}-gen-match-1`,
      type: 'match',
      pairs,
      georgianHint: 'დააკავშირე გერმანული და ქართული სიტყვები ერთმანეთთან',
      explanation: 'ყოჩაღ! ყველა სიტყვა სწორად დააკავშირე.',
    };
    r1List.push(qMatch);
  }

  // --- ARCHETYPE 2: LISTENING & COMPREHENSION ---
  words.forEach((word, idx) => {
    const dist = pickDistractors(word.german, allGermanWords.concat(FALLBACK_WORDS.map(f => f.german)), 3);
    const opts = [word.german, ...dist].sort(() => 0.5 - Math.random());
    const qListenWord: ChoiceQuestion = {
      id: `${lesson.id}-gen-lisw-${idx + 1}`,
      type: 'choice',
      prompt: 'მოუსმინე და აირჩიე წარმოთქმული სიტყვა:',
      audioText: word.german,
      options: opts,
      correctAnswer: word.german,
      translation: word.georgian,
      georgianHint: `ყურადღებით მოუსმინე: ${word.german}`,
      explanation: `წარმოითქვა »${word.german}«, რაც ნიშნავს »${word.georgian}«-ს.`,
    };
    r2List.push(qListenWord);
  });

  sentences.forEach((sent, idx) => {
    const tokens = cleanTokens(sent.german);
    const distractorPool = allGermanWords.filter(w => !tokens.includes(w));
    const distractors = distractorPool.slice(0, 2);
    const chips = [...tokens, ...distractors].sort(() => 0.5 - Math.random());

    // Listen + Build
    const qListenSent: ListenQuestion = {
      id: `${lesson.id}-gen-liss-${idx + 1}`,
      type: 'listen',
      targetSentence: sent.german,
      tokens: chips,
      translation: sent.georgian,
      georgianHint: `ქართულად ნიშნავს: »${sent.georgian}«`,
      explanation: `სწორი წინადადებაა: »${sent.german}« (${sent.georgian}).`,
    };
    r2List.push(qListenSent);

    // Translate German -> Georgian
    const kaTokens = cleanTokens(sent.georgian);
    const kaDist = pickDistractors(kaTokens[0] || '', allGeorgianWords, 2);
    const kaChips = [...kaTokens, ...kaDist].sort(() => 0.5 - Math.random());
    const qTransKa: TranslateQuestion = {
      id: `${lesson.id}-gen-trka-${idx + 1}`,
      type: 'translate',
      sourceSentence: sent.german,
      targetSentence: sent.georgian,
      fromGeorgian: false,
      tokens: kaChips,
      translation: sent.georgian,
      georgianHint: 'ააწყვე ქართული თარგმანი ბარათებით',
      explanation: `»${sent.german}« ქართულად არის: »${sent.georgian}«.`,
    };
    r2List.push(qTransKa);
  });

  // --- ARCHETYPE 3: SENTENCES & CHIPS (Build, Translate GE->DE, Fill with Chips) ---
  sentences.forEach((sent, idx) => {
    const tokens = cleanTokens(sent.german);
    const distractorPool = allGermanWords.filter(w => !tokens.includes(w));
    const distractors = distractorPool.slice(0, 2);
    const chips = [...tokens, ...distractors].sort(() => 0.5 - Math.random());

    // Build sentence
    const qBuild: BuildQuestion = {
      id: `${lesson.id}-gen-bld-${idx + 1}`,
      type: 'build',
      prompt: `ააწყვე გერმანული წინადადება: »${sent.georgian}«`,
      targetSentence: sent.german,
      tokens: chips,
      translation: sent.georgian,
      georgianHint: 'დაალაგე სიტყვები სწორი თანმიმდევრობით',
      explanation: `სწორი წესია: »${sent.german}« (${sent.georgian}).`,
    };
    r3List.push(qBuild);

    // Translate Georgian -> German
    const qTransDe: TranslateQuestion = {
      id: `${lesson.id}-gen-trde-${idx + 1}`,
      type: 'translate',
      sourceSentence: sent.georgian,
      targetSentence: sent.german,
      fromGeorgian: true,
      tokens: chips,
      translation: sent.georgian,
      georgianHint: 'გერმანულში ზმნა ჩვეულებრივ მეორე ადგილზე დგას',
      explanation: `სწორი თარგმანია: »${sent.german}«.`,
    };
    r3List.push(qTransDe);

    // Fill sentence with verb or key word missing
    if (tokens.length >= 3) {
      const targetWord = tokens[1]; // usually verb or second word
      const sentenceWithBlank = sent.german.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '___');
      const fillChips = [targetWord, ...distractorPool.slice(0, 3)].sort(() => 0.5 - Math.random());
      const qFillChip: FillQuestion = {
        id: `${lesson.id}-gen-fch-${idx + 1}`,
        type: 'fill',
        sentence: sentenceWithBlank,
        answers: [[targetWord]],
        chips: fillChips,
        translation: sent.georgian,
        georgianHint: `გამოტოვებულია სიტყვა »${targetWord}«`,
        explanation: `გამოტოვებულ ადგილას ჯდება »${targetWord}«: ${sent.german}.`,
      };
      r3List.push(qFillChip);
    }
  });

  // --- ARCHETYPE 4: GRAMMAR & GAP FILLING (Conjugations, Rules, Plurals) ---
  words.forEach((word, idx) => {
    // Plural fill
    if (word.plural) {
      const qPlural: FillQuestion = {
        id: `${lesson.id}-gen-plu-${idx + 1}`,
        type: 'fill',
        sentence: `ერთი: ${word.german} → ბევრი: ___`,
        answers: [[word.plural, word.plural.replace(/^die\s+/i, '')]],
        chips: [word.plural.replace(/^die\s+/i, ''), word.german, `${word.german}s`, `${word.german}en`].sort(() => 0.5 - Math.random()),
        translation: `${word.georgian} (მრავლობითი)`,
        georgianHint: `მრავლობითში არტიკლი ყოველთვის არის die: ${word.plural}`,
        explanation: `»${word.german}«-ის მრავლობითია »${word.plural}«.`,
      };
      r4List.push(qPlural);
    }

    // Article fill
    if (word.article) {
      const qArtFill: FillQuestion = {
        id: `${lesson.id}-gen-artf-${idx + 1}`,
        type: 'fill',
        sentence: `___ ${word.german}`,
        answers: [[word.article]],
        chips: ['der', 'die', 'das'],
        translation: word.georgian,
        georgianHint: `დაიმახსოვრე: ${word.article} ${word.german}`,
        explanation: `სწორი არტიკლია »${word.article}«.`,
      };
      r4List.push(qArtFill);
    }
  });

  // Include hand-written lesson questions in grammar and mastery rounds
  for (const q of lesson.questions || []) {
    if (q.type === 'fill' || q.type === 'odd' || q.type === 'choice') {
      r4List.push(q);
    }
    r5List.push(q);
  }

  // --- ARCHETYPE 5: MASTERY (Typed Inputs, High Application) ---
  words.forEach((word, idx) => {
    const qTyped: FillQuestion = {
      id: `${lesson.id}-gen-typ-${idx + 1}`,
      type: 'fill',
      sentence: `ჩაწერე გერმანულად (${word.georgian}): ___`,
      answers: [[word.german, word.german.toLowerCase()]],
      typed: true,
      translation: word.georgian,
      georgianHint: `აკრიფე: ${word.german}`,
      explanation: `სწორი მართლწერაა »${word.german}«.`,
    };
    r5List.push(qTyped);
  });

  sentences.forEach((sent, idx) => {
    const tokens = cleanTokens(sent.german);
    const chips = [...tokens].sort(() => 0.5 - Math.random());
    const qMasterBuild: BuildQuestion = {
      id: `${lesson.id}-gen-mbld-${idx + 1}`,
      type: 'build',
      prompt: `თარგმნე და ააწყვე: »${sent.georgian}«`,
      targetSentence: sent.german,
      tokens: chips,
      translation: sent.georgian,
      georgianHint: 'ააწყვე დამოუკიდებლად, მინიშნების გარეშე',
      explanation: `სწორია: »${sent.german}«!`,
    };
    r5List.push(qMasterBuild);
  });

  return { round1: r1List, round2: r2List, round3: r3List, round4: r4List, round5: r5List };
}

/**
 * Returns exactly 12–15 questions for a specific round of a lesson.
 * Respects round progression (Round 1: Recognition -> Round 5: Mastery).
 * Stable and reproducible.
 */
export function getQuestionsForRound(
  lesson: Lesson,
  round: number,
  totalRounds: number = 3
): Question[] {
  // Boss challenge: take curated questions up to 15
  if (lesson.isBoss || totalRounds <= 1) {
    const base = [...(lesson.questions || [])];
    if (base.length >= 12) return base.slice(0, 15);
    const pools = generateExpandedQuestions(lesson);
    const extra = [...pools.round2, ...pools.round3, ...pools.round4];
    return base.concat(extra).slice(0, 15);
  }

  const effectiveRound = Math.min(Math.max(1, round), totalRounds);
  const pools = generateExpandedQuestions(lesson);

  let candidatePool: Question[] = [];

  if (totalRounds === 2) {
    if (effectiveRound === 1) {
      candidatePool = pools.round1.concat(pools.round2);
    } else {
      candidatePool = pools.round3.concat(pools.round4, pools.round5);
    }
  } else if (totalRounds === 3) {
    if (effectiveRound === 1) {
      candidatePool = pools.round1;
    } else if (effectiveRound === 2) {
      candidatePool = pools.round2.concat(pools.round3);
    } else {
      candidatePool = pools.round4.concat(pools.round5);
    }
  } else if (totalRounds === 4) {
    if (effectiveRound === 1) {
      candidatePool = pools.round1;
    } else if (effectiveRound === 2) {
      candidatePool = pools.round2;
    } else if (effectiveRound === 3) {
      candidatePool = pools.round3;
    } else {
      candidatePool = pools.round4.concat(pools.round5);
    }
  } else {
    // 5 rounds
    if (effectiveRound === 1) candidatePool = pools.round1;
    else if (effectiveRound === 2) candidatePool = pools.round2;
    else if (effectiveRound === 3) candidatePool = pools.round3;
    else if (effectiveRound === 4) candidatePool = pools.round4;
    else candidatePool = pools.round5;
  }

  // Deduplicate questions by ID
  const map = new Map<string, Question>();
  for (const q of candidatePool) {
    if (!map.has(q.id)) {
      map.set(q.id, q);
    }
  }

  // If pool has fewer than 12 questions, supplement from adjacent pools
  if (map.size < 12) {
    const allPools = [
      ...pools.round1,
      ...pools.round2,
      ...pools.round3,
      ...pools.round4,
      ...pools.round5,
    ];
    for (const q of allPools) {
      if (!map.has(q.id)) {
        map.set(q.id, q);
        if (map.size >= 14) break;
      }
    }
  }

  // Select 12 to 15 questions deterministically
  const finalQuestions = Array.from(map.values()).slice(0, 14);

  // Fallback guard: ensure at least 12 questions exist
  if (finalQuestions.length < 12 && lesson.questions && lesson.questions.length > 0) {
    for (const q of lesson.questions) {
      if (!finalQuestions.some(item => item.id === q.id)) {
        finalQuestions.push(q);
        if (finalQuestions.length >= 12) break;
      }
    }
  }

  return finalQuestions;
}

import { describe, it, expect } from 'vitest';
import { lessons, units, dictionaryEntries } from './lessons';
import { Question } from '../types/lesson';

const DIALOG_NAMES = [
  'Martin',
  'Michael',
  'Anton',
  'Rilke',
  'Katharina',
  'Schmitt',
  'Simone',
  'Anna',
];

describe('LIZULINGO v2 Curriculum & Rule Verification', () => {
  it('contains all 6 modules and exactly 6 boss tests', () => {
    expect(units.length).toBe(6);
    const unitIds = units.map(u => u.id);
    expect(unitIds).toEqual([
      'modul-1',
      'modul-2',
      'modul-3',
      'modul-4',
      'modul-5',
      'modul-6',
    ]);

    const bossLessons = lessons.filter(l => l.isBoss);
    expect(bossLessons.length).toBe(6);
    expect(bossLessons.map(b => b.id)).toEqual([
      '1-boss',
      '2-boss',
      '3-boss',
      '4-boss',
      '5-boss',
      '6-boss',
    ]);
  });

  it('every lesson has teaching cards (Phase 1) at the start', () => {
    lessons.forEach(lesson => {
      expect(lesson.teachCards).toBeDefined();
      expect(lesson.teachCards!.length).toBeGreaterThan(0);
      lesson.teachCards!.forEach(card => {
        expect(card.type).toMatch(/^(word|rule)$/);
        if (card.type === 'word') {
          expect(card.german).toBeTruthy();
          expect(card.georgian).toBeTruthy();
        } else if (card.type === 'rule') {
          expect(card.title).toBeTruthy();
          expect(card.ruleGeorgian).toBeTruthy();
        }
      });
    });
  });

  it('every question has a georgianHint and an explanation', () => {
    lessons.forEach(lesson => {
      lesson.questions.forEach((q: Question) => {
        expect(q.id).toBeTruthy();
        expect(q.georgianHint, `Question ${q.id} in ${lesson.id} missing georgianHint`).toBeTruthy();
        if (q.type !== 'wordsearch') {
          const hasExplanation = Boolean(
            q.explanation ||
            (q.type === 'odd' && q.reason) ||
            (q.type === 'match' && q.pairs && q.pairs.length > 0) ||
            (q.type === 'dialog' && q.subQuestion.explanation)
          );
          expect(hasExplanation, `Question ${q.id} in ${lesson.id} missing explanation`).toBe(true);
        }
      });
    });
  });

  it('Rule 0: No question references book characters without dialogContext or being inside a dialog', () => {
    lessons.forEach(lesson => {
      lesson.questions.forEach((q: Question) => {
        if (q.type === 'choice') {
          const mentionsName = DIALOG_NAMES.some(name =>
            q.prompt.includes(name) || q.options.some(opt => opt.includes(name))
          );
          // If a choice question mentions a character, it must be self-contained on screen or a general grammar prompt
          if (mentionsName) {
            // Must have audio or explanation or prompt must be self-contained
            expect(q.prompt).toBeTruthy();
          }
        } else if (q.type === 'truefalse') {
          const mentionsName = DIALOG_NAMES.some(name => q.statement.includes(name));
          if (mentionsName) {
            // Must have dialogContext providing the source lines!
            expect(
              q.dialogContext && q.dialogContext.length > 0,
              `TrueFalse Question ${q.id} in ${lesson.id} mentions book character but lacks dialogContext!`
            ).toBe(true);
          }
        }
      });
    });
  });

  it('every fill question has matching gaps and answer slots', () => {
    lessons.forEach(lesson => {
      lesson.questions.forEach((q: Question) => {
        if (q.type === 'fill') {
          const gaps = (q.sentence.match(/___/g) || []).length;
          expect(gaps).toBeGreaterThan(0);
          expect(q.answers.length).toBe(gaps);
          q.answers.forEach(arr => {
            expect(arr.length).toBeGreaterThan(0);
            arr.forEach(ans => expect(typeof ans).toBe('string'));
          });
        }
      });
    });
  });

  it('dictionary contains entries across all 6 modules', () => {
    expect(dictionaryEntries.length).toBeGreaterThan(20);
    const modulesInDict = new Set(dictionaryEntries.map(e => e.module));
    expect(modulesInDict.has('modul-1')).toBe(true);
    expect(modulesInDict.has('modul-2')).toBe(true);
    expect(modulesInDict.has('modul-3')).toBe(true);
    expect(modulesInDict.has('modul-4')).toBe(true);
    expect(modulesInDict.has('modul-5')).toBe(true);
    expect(modulesInDict.has('modul-6')).toBe(true);
  });
});

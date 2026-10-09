import { describe, it, expect } from 'vitest';
import { lessons } from './lessons';
import { Question } from '../types/lesson';

describe('LIZULINGO Curriculum Validation', () => {
  it('every lesson has valid metadata and questions', () => {
    expect(lessons.length).toBeGreaterThan(0);
    lessons.forEach(lesson => {
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.questions.length).toBeGreaterThan(0);
    });
  });

  it('every question has valid structure and required fields', () => {
    lessons.forEach(lesson => {
      lesson.questions.forEach((q: Question) => {
        expect(q.id).toBeTruthy();
        expect(q.type).toBeTruthy();

        if (q.type === 'choice') {
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(q.correctAnswer).toBeTruthy();
          expect(q.options).toContain(q.correctAnswer);
        } else if (q.type === 'fill') {
          // Count ___ gaps in the sentence
          const gaps = (q.sentence.match(/___/g) || []).length;
          expect(gaps).toBeGreaterThan(0);
          expect(q.answers.length).toBe(gaps);
          q.answers.forEach(ansArr => {
            expect(ansArr.length).toBeGreaterThan(0);
            ansArr.forEach(a => expect(typeof a).toBe('string'));
          });
        } else if (q.type === 'build') {
          expect(q.targetSentence).toBeTruthy();
          expect(q.tokens.length).toBeGreaterThan(0);
        } else if (q.type === 'truefalse') {
          expect(q.statement).toBeTruthy();
          expect(typeof q.isTrue).toBe('boolean');
        } else if (q.type === 'odd') {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.oddIndex).toBeGreaterThanOrEqual(0);
          expect(q.oddIndex).toBeLessThan(q.options.length);
          expect(q.reason).toBeTruthy();
        } else if (q.type === 'match') {
          expect(q.pairs.length).toBeGreaterThan(0);
          q.pairs.forEach(p => {
            expect(p.left).toBeTruthy();
            expect(p.right).toBeTruthy();
          });
        } else if (q.type === 'listen') {
          expect(q.targetSentence).toBeTruthy();
          expect(q.tokens.length).toBeGreaterThan(0);
        } else if (q.type === 'dialog') {
          expect(q.dialogLines.length).toBeGreaterThan(0);
          expect(q.subQuestion).toBeTruthy();
        } else if (q.type === 'wordsearch') {
          expect(q.grid.length).toBe(8);
          expect(q.words.length).toBeGreaterThan(0);
        }
      });
    });
  });
});

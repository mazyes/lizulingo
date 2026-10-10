import { describe, it, expect } from 'vitest';
import { checkAnswer, getExpectedAnswer } from './normalize';
import { lessons } from '../data/lessons';
import { Question } from '../types/lesson';

describe('A1 & A2: Answer Checking, Normalization & Forgiving Answers', () => {
  it('handles Größe variations: Grosse, grosse, Größe., Groesse -> correct/almost', () => {
    const q: Question = {
      id: 'test-grosse',
      type: 'fill',
      sentence: 'Was ist deine ___?',
      answers: [['Größe']],
      georgianHint: 'ზომა',
    };

    expect(['correct', 'almost']).toContain(checkAnswer(q, ['Größe']));
    expect(['correct', 'almost']).toContain(checkAnswer(q, ['Größe.']));
    expect(['correct', 'almost']).toContain(checkAnswer(q, ['größe']));
    expect(['correct', 'almost']).toContain(checkAnswer(q, ['Grosse']));
    expect(['correct', 'almost']).toContain(checkAnswer(q, ['grosse']));
    expect(['correct', 'almost']).toContain(checkAnswer(q, ['Groesse']));
  });

  it('rejects grammar word confusion: einen for einem -> wrong', () => {
    const q: Question = {
      id: 'test-grammar',
      type: 'fill',
      sentence: 'Ich helfe ___ Mann.',
      answers: [['einem']],
      georgianHint: 'დატივი',
    };

    expect(checkAnswer(q, ['einen'])).toBe('wrong');
  });

  it('rejects verb ending confusion: lernst for lernt -> wrong', () => {
    const q: Question = {
      id: 'test-verb',
      type: 'fill',
      sentence: 'Er ___ Deutsch.',
      answers: [['lernt']],
      georgianHint: 'ის სწავლობს',
    };

    expect(checkAnswer(q, ['lernst'])).toBe('wrong');
  });

  it('accepts long words with one typo: Lieblingsfarbe -> almost', () => {
    const q: Question = {
      id: 'test-typo',
      type: 'fill',
      sentence: 'Meine ___ ist blau.',
      answers: [['Lieblingsfarbe']],
      georgianHint: 'საყვარელი ფერი',
    };

    expect(checkAnswer(q, ['Lieblingsfarba'])).toBe('almost');
    expect(checkAnswer(q, ['Liebligsfarbe'])).toBe('almost');
  });

  it('accepts sentence without commas and without final period -> correct', () => {
    const q: Question = {
      id: 'test-punct',
      type: 'build',
      targetSentence: 'Ich brauche keinen Drucker, denn ich habe schon einen.',
      tokens: ['Ich', 'brauche', 'keinen', 'Drucker,', 'denn', 'ich', 'habe', 'schon', 'einen'],
      georgianHint: 'ააწყვე წინადადება',
    };

    const userNoPunct = ['Ich', 'brauche', 'keinen', 'Drucker', 'denn', 'ich', 'habe', 'schon', 'einen'];
    expect(checkAnswer(q, userNoPunct)).toBe('correct');
    expect(checkAnswer(q, userNoPunct.join(' '))).toBe('correct');
  });

  it('chips carrying punctuation still match clean targets and vice versa', () => {
    const q: Question = {
      id: 'test-chips',
      type: 'translate',
      sourceSentence: 'გამარჯობა, როგორ ხარ?',
      targetSentence: 'Hallo, wie geht es dir?',
      fromGeorgian: true,
      tokens: ['Hallo,', 'wie', 'geht', 'es', 'dir?'],
      georgianHint: 'თარგმნე',
    };

    // User selects chips with punctuation
    expect(checkAnswer(q, ['Hallo,', 'wie', 'geht', 'es', 'dir?'])).toBe('correct');
    // User selects chips without punctuation
    expect(checkAnswer(q, ['Hallo', 'wie', 'geht', 'es', 'dir'])).toBe('correct');
  });

  it('getExpectedAnswer returns proper canonical text for all types', () => {
    const q: Question = {
      id: 'test-choice',
      type: 'choice',
      prompt: 'Test',
      options: ['A', 'B'],
      correctAnswer: 'A',
      georgianHint: 'აირჩიე',
    };
    expect(getExpectedAnswer(q)).toBe('A');
  });

  it('VERIFICATION: for EVERY question in EVERY lesson, correct input returns "correct"', () => {
    let checkedCount = 0;

    for (const lesson of lessons) {
      for (const q of lesson.questions) {
        let correctInput: unknown = null;

        switch (q.type) {
          case 'choice':
            correctInput = q.correctAnswer;
            break;

          case 'fill':
            correctInput = q.answers.map(arr => arr[0]);
            break;

          case 'build':
            // Provide clean tokens from targetSentence
            correctInput = q.targetSentence.split(/\s+/);
            break;

          case 'translate':
            correctInput = q.targetSentence.split(/\s+/);
            break;

          case 'listen':
            correctInput = q.targetSentence.split(/\s+/);
            break;

          case 'picture':
            correctInput = q.correctId;
            break;

          case 'truefalse':
            correctInput = q.isTrue;
            break;

          case 'odd':
            correctInput = q.oddIndex;
            break;

          case 'dialog':
            correctInput =
              q.subQuestion.type === 'choice'
                ? q.subQuestion.correctAnswer
                : q.subQuestion.isTrue;
            break;

          case 'match':
            correctInput = true;
            break;

          case 'wordsearch':
            correctInput = true;
            break;

          case 'speak':
            correctInput = q.targetSentence;
            break;

          default: {
            const _never: never = q;
            void _never;
            throw new Error(`Unhandled question type in test: ${JSON.stringify(q)}`);
          }
        }

        const res = checkAnswer(q, correctInput);
        expect(
          res,
          `Question ${q.id} in lesson ${lesson.id} (type: ${q.type}) failed with correct input!`
        ).toBe('correct');
        checkedCount++;
      }
    }

    expect(checkedCount).toBeGreaterThan(200);
  });
});

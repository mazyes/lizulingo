import { describe, it, expect } from 'vitest';
import { lessons } from './lessons';
import { getQuestionsForRound, getRoundInfo } from './expand';
import { checkAnswer } from '../utils/normalize';
import { migrate } from '../utils/migration';

describe('Part 2 — Lesson Rounds and Question Expansion', () => {
  it('every lesson has valid rounds configured (2-5 for regular, 1 for boss)', () => {
    expect(lessons.length).toBeGreaterThan(15);
    for (const lesson of lessons) {
      if (lesson.isBoss) {
        expect(lesson.rounds).toBe(1);
      } else {
        expect(lesson.rounds).toBeGreaterThanOrEqual(2);
        expect(lesson.rounds).toBeLessThanOrEqual(5);
      }
    }
  });

  it('getQuestionsForRound always returns 12 to 15 self-contained questions for each round', () => {
    for (const lesson of lessons) {
      const totalRounds = lesson.rounds || (lesson.isBoss ? 1 : 3);
      for (let r = 1; r <= totalRounds; r++) {
        const questions = getQuestionsForRound(lesson, r, totalRounds);
        expect(
          questions.length,
          `Lesson ${lesson.id} round ${r}/${totalRounds} has ${questions.length} questions`
        ).toBeGreaterThanOrEqual(12);
        expect(
          questions.length,
          `Lesson ${lesson.id} round ${r}/${totalRounds} has ${questions.length} questions`
        ).toBeLessThanOrEqual(15);
      }
    }
  });

  it('every generated question has valid format and checkAnswer succeeds on its intended answer', () => {
    // Sample a diverse set of lessons across modules
    const sampleLessons = [
      lessons[0], // m1_l1
      lessons[3], // m1_l4
      lessons.find(l => l.id.includes('m2')) || lessons[5],
      lessons.find(l => l.id.includes('m3')) || lessons[8],
      lessons.find(l => l.id.includes('m4')) || lessons[11],
      lessons.find(l => l.id.includes('m5')) || lessons[15],
      lessons.find(l => l.id.includes('m6')) || lessons[18],
    ];

    for (const lesson of sampleLessons) {
      const totalRounds = lesson.rounds || 3;
      for (let r = 1; r <= totalRounds; r++) {
        const questions = getQuestionsForRound(lesson, r, totalRounds);
        for (const q of questions) {
          expect(q.id).toBeTruthy();
          expect(q.type).toBeTruthy();

          // Validate that the question type has consistent answer targets
          switch (q.type) {
            case 'choice': {
              expect(q.prompt).toBeTruthy();
              expect(q.options).toBeDefined();
              expect(q.options).toContain(q.correctAnswer);
              const result = checkAnswer(q, q.correctAnswer);
              expect(result, `choice failed for ${q.id}: ${q.correctAnswer}`).toBe('correct');
              break;
            }
            case 'truefalse': {
              expect(q.statement).toBeTruthy();
              const result = checkAnswer(q, q.isTrue);
              expect(result, `tf failed for ${q.id}`).toBe('correct');
              break;
            }
            case 'fill': {
              expect(q.sentence).toBeTruthy();
              const firstAnswers = q.answers.map(g => g[0]);
              const result = checkAnswer(q, firstAnswers);
              expect(result, `fill failed for ${q.id}`).toBe('correct');
              break;
            }
            case 'build': {
              expect(q.targetSentence).toBeTruthy();
              const words = q.targetSentence.replace(/[.,!?:;„"']/g, '').trim().split(/\s+/).filter(Boolean);
              const result = checkAnswer(q, words);
              expect(result, `build failed for ${q.id}`).toBe('correct');
              break;
            }
            case 'translate': {
              expect(q.targetSentence).toBeTruthy();
              const words = q.targetSentence.replace(/[.,!?:;„"']/g, '').trim().split(/\s+/).filter(Boolean);
              const result = checkAnswer(q, words);
              expect(result, `translate failed for ${q.id}`).toBe('correct');
              break;
            }
            case 'listen': {
              expect(q.targetSentence).toBeTruthy();
              const words = q.targetSentence.replace(/[.,!?:;„"']/g, '').trim().split(/\s+/).filter(Boolean);
              const result = checkAnswer(q, words);
              expect(result, `listen failed for ${q.id}`).toBe('correct');
              break;
            }
            case 'odd': {
              expect(q.options).toBeDefined();
              const result = checkAnswer(q, q.oddIndex);
              expect(result, `odd failed for ${q.id}`).toBe('correct');
              break;
            }
            case 'picture': {
              expect(q.options).toBeDefined();
              const result = checkAnswer(q, q.correctId);
              expect(result, `picture failed for ${q.id}`).toBe('correct');
              break;
            }
            default:
              break;
          }
        }
      }
    }
  });

  it('getRoundInfo gives progressive metadata for rounds', () => {
    const infoR1 = getRoundInfo(1, 3);
    expect(infoR1.name).toBe('ახალი სიტყვები');
    expect(infoR1.description).toBeTruthy();

    const infoR2 = getRoundInfo(2, 3);
    expect(infoR2.name).toBe('მოსმენა და გაგება');

    const infoR3 = getRoundInfo(3, 3);
    expect(infoR3.name).toBe('წინადადებები');

    const infoBoss = getRoundInfo(1, 1);
    expect(infoBoss.name).toBe('ბოსის გამოცდა');
  });

  it('migration upgrades completedLessons into max lessonRounds without resetting progress', () => {
    const legacy = {
      completedLessons: {
        'm1_l1': { stars: 3, completedAt: '2026-01-01' },
        'm2_l1': { stars: 2, completedAt: '2026-01-02' },
      },
      unlockedLessons: ['m1_l1', 'm1_l2', 'm2_l1'],
      xp: 120,
    };

    const migrated = migrate(legacy);
    expect(migrated.lessonRounds).toBeDefined();
    expect(migrated.lessonRounds!['m1_l1']).toBe(5);
    expect(migrated.lessonRounds!['m2_l1']).toBe(5);
    expect(migrated.completedLessons['m1_l1'].stars).toBe(3);
    expect(migrated.darkMode).toBe(true);
  });
});

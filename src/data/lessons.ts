import { Lesson, Unit, DictionaryEntry } from '../types/lesson';
import { m1Lessons } from './modules/m1';
import { m2Lessons } from './modules/m2';
import { m3Lessons } from './modules/m3';
import { m4Lessons } from './modules/m4';
import { m5Lessons } from './modules/m5';
import { m6Lessons } from './modules/m6';

// Re-export individual modules for modular access
export { m1Lessons, m2Lessons, m3Lessons, m4Lessons, m5Lessons, m6Lessons };

/**
 * Explicit round configuration (Part 2 — Rounds per Circle: 2 to 5 rounds)
 * Difficulty mapping:
 * - 2 rounds: very easy lessons (greetings, first words; most of Modul 1)
 * - 3 rounds: normal vocabulary + one simple rule
 * - 4 rounds: new grammar rule (Akkusativ, separable verbs, possessives, Präteritum war/hatte)
 * - 5 rounds: hardest topics (Dativ vs Akkusativ, Genitiv, final mastery review)
 * - Boss tests: 1 round
 */
export const LESSON_ROUNDS_CONFIG: Record<string, { rounds: number; reason: string }> = {
  // Modul 1: პირველი ნაბიჯები
  '1.1': { rounds: 2, reason: 'ძალიან მარტივი: მისალმება და პირველი სიტყვები' },
  '1.2': { rounds: 2, reason: 'ძალიან მარტივი: ვინ ხარ, პირის ნაცვალსახელები' },
  '1.3': { rounds: 2, reason: 'ძალიან მარტივი: საიდან ხარ, ქვეყნები' },
  '1.4': { rounds: 3, reason: 'სტანდარტული ლექსიკა: საცხოვრებელი ადგილი' },
  '1.5': { rounds: 3, reason: 'სტანდარტული ზმნები: heißen, kommen, wohnen უღლება' },
  '1.6': { rounds: 3, reason: 'სტანდარტული წესი: განუსაზღვრელი არტიკლი ein/eine' },
  '1-boss': { rounds: 1, reason: 'მოდულის შემაჯამებელი ბოსი' },

  // Modul 2: ქალაქი და ორიენტაცია
  '2.1': { rounds: 3, reason: 'ქალაქის შენობები და ადგილები' },
  '2.2': { rounds: 3, reason: 'გზის კითხვა და მიმართულებები' },
  '2.3': { rounds: 3, reason: 'საათი და დროის გამოხატვა' },
  '2.4': { rounds: 3, reason: 'კვირის დღეები და დღის მონაკვეთები' },
  '2.5': { rounds: 3, reason: 'ჰობი და თავისუფალი დრო (gern)' },
  '2.6': { rounds: 3, reason: 'ოჯახის წევრები და ნათესაობა' },
  '2-boss': { rounds: 1, reason: 'მოდულის შემაჯამებელი ბოსი' },

  // Modul 3: პროფესიები და ყოველდღიურობა
  '3.1': { rounds: 3, reason: 'პროფესიები და სამუშაო ადგილები' },
  '3.2': { rounds: 3, reason: 'ბინა, ოთახები და ავეჯი' },
  '3.3': { rounds: 4, reason: 'ახალი გრამატიკა: აკუზატივი მამრობითში (den/einen)' },
  '3.4': { rounds: 3, reason: 'ავეჯი და ფერები' },
  '3.5': { rounds: 4, reason: 'ახალი გრამატიკა: მოდალური ზმნები können და müssen' },
  '3.6': { rounds: 3, reason: 'რესტორანში შეკვეთა და დიალოგები' },
  '3-boss': { rounds: 1, reason: 'მოდულის შემაჯამებელი ბოსი' },

  // Modul 4: დრო, სხეული და ცხოველები
  '4.1': { rounds: 3, reason: 'სეზონები, თვეები და ამინდი' },
  '4.2': { rounds: 4, reason: 'ახალი გრამატიკა: წარსული დრო war და hatte' },
  '4.3': { rounds: 3, reason: 'სხეულის ნაწილები' },
  '4.4': { rounds: 3, reason: 'ექიმთან ვიზიტი და ტკივილის გამოხატვა' },
  '4.5': { rounds: 3, reason: 'შინაური და გარეული ცხოველები' },
  '4.6': { rounds: 4, reason: 'ახალი გრამატიკა: განცალკევებადი ზმნები (aufstehen, einkaufen)' },
  '4-boss': { rounds: 1, reason: 'მოდულის შემაჯამებელი ბოსი' },

  // Modul 5: დატივი, ოჯახი და სახლი
  '5.1': { rounds: 4, reason: 'ახალი გრამატიკა: დატივის არტიკლები (dem, der, einem, einer)' },
  '5.2': { rounds: 4, reason: 'ახალი გრამატიკა: დატივის პირის ნაცვალსახელები (mir, dir, ihm)' },
  '5.3': { rounds: 4, reason: 'ახალი გრამატიკა: წინდებული mit + Dativ' },
  '5.4': { rounds: 4, reason: 'ახალი გრამატიკა: ზმნები დატივით (helfen, danken, gefallen)' },
  '5.5': { rounds: 5, reason: 'რთული თემა: დატივი vs აკუზატივი (Wo vs Wohin)' },
  '5.6': { rounds: 5, reason: 'რთული თემა: ორმაგი წინდებულები (in, an, auf, unter)' },
  '5-boss': { rounds: 1, reason: 'მოდულის შემაჯამებელი ბოსი' },

  // Modul 6: საჭმელი, გენიტივი და ტრანსპორტი
  '6.1': { rounds: 3, reason: 'სუპერმარკეტი, პროდუქტები და რაოდენობები' },
  '6.2': { rounds: 3, reason: 'ზრდილობიანი თხოვნა möchten და gern' },
  '6.3': { rounds: 5, reason: 'ურთულესი თემა: გენიტივი (des Vaters, der Mutter)' },
  '6.4': { rounds: 4, reason: 'კუთვნილებითი ნაცვალსახელები და ბრუნვები' },
  '6.5': { rounds: 4, reason: 'ტრანსპორტი და ქალაქში ორიენტაცია' },
  '6.6': { rounds: 5, reason: 'A1-ის სრული შემაჯამებელი მასტერ-გამეორება' },
  '6-boss': { rounds: 1, reason: 'მოდულის შემაჯამებელი ბოსი' },
};

// Helper to assign rounds to any raw lesson
const assignRounds = (l: Lesson): Lesson => {
  const config = LESSON_ROUNDS_CONFIG[l.id];
  const count = config ? config.rounds : l.isBoss ? 1 : 3;
  return { ...l, rounds: count };
};

// All lessons array ordered from Modul 1 to Modul 6 with rounds assigned
export const lessons: Lesson[] = [
  ...m1Lessons.map(assignRounds),
  ...m2Lessons.map(assignRounds),
  ...m3Lessons.map(assignRounds),
  ...m4Lessons.map(assignRounds),
  ...m5Lessons.map(assignRounds),
  ...m6Lessons.map(assignRounds),
];

// All 6 Units across Germany
export const units: Unit[] = [
  {
    id: 'modul-1',
    title: 'მოდული 1: პირველი ნაბიჯები',
    subtitle: 'მისალმება, ზმნა sein, ქვეყნები, ტანსაცმელი და W-კითხვები',
    city: 'Berlin',
    color: 'green',
    bannerBg: 'bg-lizu-green',
    lessons: m1Lessons.map(assignRounds),
  },
  {
    id: 'modul-2',
    title: 'მოდული 2: ქალაქი და ორიენტაცია',
    subtitle: 'ქალაქი, გზის კითხვა, დრო, ჰობი და ოჯახი',
    city: 'Heide',
    color: 'blue',
    bannerBg: 'bg-lizu-blue',
    lessons: m2Lessons.map(assignRounds),
  },
  {
    id: 'modul-3',
    title: 'მოდული 3: პროფესიები და ყოველდღიურობა',
    subtitle: 'პროფესიები, ბინა, Akkusativ და მოდალური ზმნები',
    city: 'Hamburg',
    color: 'purple',
    bannerBg: 'bg-purple-600',
    lessons: m3Lessons.map(assignRounds),
  },
  {
    id: 'modul-4',
    title: 'მოდული 4: დრო, სხეული და ცხოველები',
    subtitle: 'დრო, დღეები, წარსული war/waren, სხეული და ცხოველები',
    city: 'Ostsee',
    color: 'teal',
    bannerBg: 'bg-teal-600',
    lessons: m4Lessons.map(assignRounds),
  },
  {
    id: 'modul-5',
    title: 'მოდული 5: დატივი, ოჯახი და სახლი',
    subtitle: 'Dativ-ის ნაცვალსახელები და არტიკლები, mit, helfen და სახლი',
    city: 'Düsseldorf',
    color: 'amber',
    bannerBg: 'bg-amber-600',
    lessons: m5Lessons.map(assignRounds),
  },
  {
    id: 'modul-6',
    title: 'მოდული 6: საჭმელი, გენიტივი და ტრანსპორტი',
    subtitle: 'საკვები, möchten, Genitiv, ნათესავები და ტრანსპორტი',
    city: 'München',
    color: 'rose',
    bannerBg: 'bg-rose-600',
    lessons: m6Lessons.map(assignRounds),
  },
];

// --- AUTHENTIC GERMAN DICTIONARY GROUPED BY MODULE & CATEGORY ---
export const dictionaryEntries: DictionaryEntry[] = [
  // Modul 1: Berlin
  { german: 'Schüler', article: 'der', plural: 'die Schüler', georgian: 'მოსწავლე (ვაჟი)', module: 'modul-1', category: 'სკოლა' },
  { german: 'Schülerin', article: 'die', plural: 'die Schülerinnen', georgian: 'მოსწავლე (გოგო)', module: 'modul-1', category: 'სკოლა' },
  { german: 'Lehrer', article: 'der', plural: 'die Lehrer', georgian: 'მასწავლებელი (კაცი)', module: 'modul-1', category: 'სკოლა' },
  { german: 'Lehrerin', article: 'die', plural: 'die Lehrerinnen', georgian: 'მასწავლებელი (ქალი)', module: 'modul-1', category: 'სკოლა' },
  { german: 'Hallo', georgian: 'გამარჯობა', module: 'modul-1', category: 'მისალმება' },
  { german: 'Guten Tag', georgian: 'დღე მშვიდობისა', module: 'modul-1', category: 'მისალმება' },
  { german: 'Guten Morgen', georgian: 'დილა მშვიდობისა', module: 'modul-1', category: 'მისალმება' },
  { german: 'Auf Wiedersehen', georgian: 'ნახვამდის', module: 'modul-1', category: 'მისალმება' },
  { german: 'Deutschland', article: 'das', georgian: 'გერმანია', module: 'modul-1', category: 'ქვეყნები' },
  { german: 'Georgien', article: 'das', georgian: 'საქართველო', module: 'modul-1', category: 'ქვეყნები' },
  { german: 'Stadt', article: 'die', plural: 'die Städte', georgian: 'ქალაქი', module: 'modul-1', category: 'გეოგრაფია' },
  { german: 'Land', article: 'das', plural: 'die Länder', georgian: 'ქვეყანა', module: 'modul-1', category: 'გეოგრაფია' },
  { german: 'Pulli', article: 'der', plural: 'die Pullis', georgian: 'სვიტერი', module: 'modul-1', category: 'ტანსაცმელი' },
  { german: 'Hemd', article: 'das', plural: 'die Hemden', georgian: 'პერანგი', module: 'modul-1', category: 'ტანსაცმელი' },
  { german: 'Hose', article: 'die', plural: 'die Hosen', georgian: 'შარვალი', module: 'modul-1', category: 'ტანსაცმელი' },
  { german: 'Kleid', article: 'das', plural: 'die Kleider', georgian: 'კაბა', module: 'modul-1', category: 'ტანსაცმელი' },

  // Modul 2: Heide
  { german: 'Bahnhof', article: 'der', plural: 'die Bahnhöfe', georgian: 'რკინიგზის სადგური', module: 'modul-2', category: 'ქალაქი' },
  { german: 'Flughafen', article: 'der', plural: 'die Flughäfen', georgian: 'აეროპორტი', module: 'modul-2', category: 'ქალაქი' },
  { german: 'Apotheke', article: 'die', plural: 'die Apotheken', georgian: 'აფთიაქი', module: 'modul-2', category: 'ქალაქი' },
  { german: 'Fahrkarte', article: 'die', plural: 'die Fahrkarten', georgian: 'სამგზავრო ბილეთი', module: 'modul-2', category: 'ტრანსპორტი' },
  { german: 'Uhr', article: 'die', plural: 'die Uhren', georgian: 'საათი', module: 'modul-2', category: 'დრო' },
  { german: 'Montag', article: 'der', georgian: 'ორშაბათი', module: 'modul-2', category: 'დრო' },
  { german: 'Freizeit', article: 'die', georgian: 'თავისუფალი დრო', module: 'modul-2', category: 'ჰობი' },
  { german: 'Brot', article: 'das', plural: 'die Brote', georgian: 'პური', module: 'modul-2', category: 'საჭმელი' },
  { german: 'Käse', article: 'der', georgian: 'ყველი', module: 'modul-2', category: 'საჭმელი' },
  { german: 'Eltern', article: 'die', georgian: 'მშობლები', module: 'modul-2', category: 'ოჯახი' },

  // Modul 3: Hamburg
  { german: 'Arzt', article: 'der', plural: 'die Ärzte', georgian: 'ექიმი (კაცი)', module: 'modul-3', category: 'პროფესიები' },
  { german: 'Ärztin', article: 'die', plural: 'die Ärztinnen', georgian: 'ექიმი (ქალი)', module: 'modul-3', category: 'პროფესიები' },
  { german: 'Wohnung', article: 'die', plural: 'die Wohnungen', georgian: 'ბინა', module: 'modul-3', category: 'სახლი' },
  { german: 'Zimmer', article: 'das', plural: 'die Zimmer', georgian: 'ოთახი', module: 'modul-3', category: 'სახლი' },
  { german: 'Küche', article: 'die', plural: 'die Küchen', georgian: 'სამზარეულო', module: 'modul-3', category: 'სახლი' },

  // Modul 4: Ostsee
  { german: 'Ostsee', article: 'die', georgian: 'ბალტიის ზღვა', module: 'modul-4', category: 'გეოგრაფია' },
  { german: 'Auge', article: 'das', plural: 'die Augen', georgian: 'თვალი', module: 'modul-4', category: 'სხეული' },
  { german: 'Hand', article: 'die', plural: 'die Hände', georgian: 'ხელი', module: 'modul-4', category: 'სხეული' },
  { german: 'Hund', article: 'der', plural: 'die Hunde', georgian: 'ძაღლი', module: 'modul-4', category: 'ცხოველები' },
  { german: 'Katze', article: 'die', plural: 'die Katzen', georgian: 'კატა', module: 'modul-4', category: 'ცხოველები' },
  { german: 'Vogel', article: 'der', plural: 'die Vögel', georgian: 'ჩიტი', module: 'modul-4', category: 'ცხოველები' },
  { german: 'Geburtstag', article: 'der', plural: 'die Geburtstage', georgian: 'დაბადების დღე', module: 'modul-4', category: 'დღესასწაული' },
  { german: 'Geschenk', article: 'das', plural: 'die Geschenke', georgian: 'საჩუქარი', module: 'modul-4', category: 'დღესასწაული' },

  // Modul 5: Düsseldorf
  { german: 'Weihnachten', article: 'das', georgian: 'შობა', module: 'modul-5', category: 'დღესასწაული' },
  { german: 'Schal', article: 'der', plural: 'die Schals', georgian: 'შარფი', module: 'modul-5', category: 'ტანსაცმელი' },
  { german: 'Kuscheltier', article: 'das', plural: 'die Kuscheltiere', georgian: 'რბილი სათამაშო', module: 'modul-5', category: 'საჩუქრები' },

  // Modul 6: München
  { german: 'Obst', article: 'das', georgian: 'ხილი', module: 'modul-6', category: 'საჭმელი' },
  { german: 'Gemüse', article: 'das', georgian: 'ბოსტნეული', module: 'modul-6', category: 'საჭმელი' },
  { german: 'lecker', georgian: 'გემრიელი', module: 'modul-6', category: 'ზედსართავი' },
  { german: 'Kaffee', article: 'der', plural: 'die Kaffees', georgian: 'ყავა', module: 'modul-6', category: 'სასმელი' },
  { german: 'Zitrone', article: 'die', plural: 'die Zitronen', georgian: 'ლიმონი', module: 'modul-6', category: 'საჭმელი' },
  { german: 'Schokolade', article: 'die', plural: 'die Schokoladen', georgian: 'შოკოლადი', module: 'modul-6', category: 'საჭმელი' },
  { german: 'Zug', article: 'der', plural: 'die Züge', georgian: 'მატარებელი', module: 'modul-6', category: 'ტრანსპორტი' },
  { german: 'Straßenbahn', article: 'die', plural: 'die Straßenbahnen', georgian: 'ტრამვაი', module: 'modul-6', category: 'ტრანსპორტი' },
];

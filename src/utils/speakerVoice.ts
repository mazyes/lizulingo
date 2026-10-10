// Which ElevenLabs voice a text uses. Shared by the app (tts.ts) and scripts/generate-audio.ts,
// so the audio file hash matches. Add new female names here, then run `npm run audio`.
const FEMALE_NAMES = [
  'Anna', 'Katharina', 'Simone', 'Lizi', 'Sonja', 'Monika', 'Helena', 'Erika', 'Marie', 'Amanda',
  'Elfriede', 'Sabine', 'Angela', 'Maria', 'Julia', 'Lena', 'Sophie', 'Nino', 'Tamar', 'Mariam', 'Ana',
];
const FEMALE_SPEAKERS = new Set([...FEMALE_NAMES, 'Verkäuferin', 'Kellnerin', 'Lehrerin', 'Ärztin', 'Mutter', 'Oma']);

export function speakerVoice(speaker: string): 'female' | 'default' {
  const name = speaker.trim();
  return FEMALE_SPEAKERS.has(name) || name.startsWith('Frau ') ? 'female' : 'default';
}

const NAMES = FEMALE_NAMES.join('|');
// First person, said by a woman: "Ich heiße Anna", "Ich bin Lehrerin", "Ich bin keine Schülerin",
// "Mein Name ist Anna", "Ich bin Frau Rilke". -in nouns only after ich bin, so "Ich bin in Berlin" stays default.
const FEMALE_SENTENCE = new RegExp(
  `\\b(ich heiße|mein name ist|ich bin)\\s+(${NAMES})\\b` +
    `|\\bich bin\\s+(frau\\s|(eine|keine|die|noch|auch)\\s+)?(?!(?:[kmds]?ein|nein)\\b)[A-ZÄÖÜ][a-zäöüß]+in\\b` +
    `|\\bich bin frau\\b`,
  'i'
);

export function sentenceVoice(text: string): 'female' | 'default' {
  return FEMALE_SENTENCE.test(text) ? 'female' : 'default';
}

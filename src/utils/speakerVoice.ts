// Which ElevenLabs voice a dialog speaker uses. Shared by the app and scripts/generate-audio.ts,
// so the audio file hash matches. Add new female speakers here, then run `npm run audio`.
const FEMALE_SPEAKERS = new Set(['Anna', 'Katharina', 'Simone', 'Lizi', 'Verkäuferin', 'Kellnerin', 'Lehrerin']);

export function speakerVoice(speaker: string): 'female' | 'default' {
  const name = speaker.trim();
  return FEMALE_SPEAKERS.has(name) || name.startsWith('Frau ') ? 'female' : 'default';
}

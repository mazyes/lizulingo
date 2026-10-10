/**
 * Generates ElevenLabs MP3s for every German text the app speaks.
 *   npm run audio             -> generate missing files
 *   npm run audio -- --dry    -> only count texts/characters (no API calls, no credits)
 *   npm run audio -- --limit 5 -> generate at most 5 new files (test run)
 * Writes public/audio/<hash>.mp3 and public/audio/manifest.json (list of hashes).
 */
import fs from 'fs';
import path from 'path';
import { computeAudioHash } from '../src/utils/audioHash';
import { lessons, dictionaryEntries } from '../src/data/lessons';
import { speakerVoice, sentenceVoice } from '../src/utils/speakerVoice';

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].trim().replace(/(^['"]|['"]$)/g, '');
  }
}

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY && !DRY) {
  console.error('ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}

const voices: Record<string, string> = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'scripts', 'voices.json'), 'utf8')
);

const audioDir = path.resolve(process.cwd(), 'public', 'audio');
fs.mkdirSync(audioDir, { recursive: true });

// --- Collect every string the app passes to tts.speak() ---
const GEORGIAN = /[Ⴀ-ჿ]/;
// key "voice|text" -> one file per text and voice (dialog lines use the speaker's voice)
const texts = new Set<string>();
const add = (t: unknown, voice?: string) => {
  if (typeof t !== 'string') return;
  const s = t.replace(/___/g, '...').trim();
  voice ??= sentenceVoice(s); // same rule as tts.speak()
  if (s && !GEORGIAN.test(s)) texts.add(`${voice}|${s}`);
};
const SPOKEN_KEYS = new Set([
  'audioText', 'prompt', 'targetSentence', 'sourceSentence', 'sentence',
  'statement', 'text', 'germanWord', 'german', 'title',
]);
function walk(node: unknown) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (!node || typeof node !== 'object') return;
  const rec = node as Record<string, unknown>;
  if (typeof rec.speaker === 'string' && typeof rec.text === 'string') {
    add(rec.text, speakerVoice(rec.speaker)); // dialog line: speaker's voice only
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (SPOKEN_KEYS.has(k)) add(v);
    if (typeof v === 'object') walk(v);
  }
}
walk(lessons);
for (const e of dictionaryEntries) add(e.article ? `${e.article} ${e.german}` : e.german);

const split = (key: string) => { const i = key.indexOf('|'); return { voice: key.slice(0, i), text: key.slice(i + 1) }; };
const fileFor = (key: string) => { const { voice, text } = split(key); return path.join(audioDir, `${computeAudioHash(text, voice)}.mp3`); };
const all = [...texts];
const missing = all.filter(k => !fs.existsSync(fileFor(k)));
const chars = missing.reduce((n, k) => n + split(k).text.length, 0);
console.log(`Texts: ${all.length}, missing: ${missing.length}, characters to generate: ${chars}`);

function writeManifest() {
  const hashes = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4));
  fs.writeFileSync(path.join(audioDir, 'manifest.json'), JSON.stringify(hashes));
  console.log(`manifest.json: ${hashes.length} files`);
}

async function generateSpeech(text: string, voiceId: string, outputPath: string) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { Accept: 'audio/mpeg', 'xi-api-key': API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      language_code: 'de',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  fs.writeFileSync(outputPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  if (DRY) return writeManifest();
  let done = 0;
  for (const key of missing) {
    if (done >= LIMIT) break;
    const { voice, text } = split(key);
    try {
      await generateSpeech(text, voices[voice], fileFor(key));
      done++;
      console.log(`[${done}] (${voice}) ${text}`);
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.warn(`Failed "${text}":`, (err as Error).message);
      if (/40[12]/.test((err as Error).message)) break; // bad key / no credits: stop, don't spam
    }
  }
  writeManifest();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

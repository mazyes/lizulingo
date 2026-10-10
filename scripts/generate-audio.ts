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
// The app calls tts.speak(text) without a voice, so everything uses 'default'.
const VOICE_KEY = 'default';

const audioDir = path.resolve(process.cwd(), 'public', 'audio');
fs.mkdirSync(audioDir, { recursive: true });

// --- Collect every string the app passes to tts.speak() ---
const GEORGIAN = /[Ⴀ-ჿ]/;
const texts = new Set<string>();
const add = (t: unknown) => {
  if (typeof t !== 'string') return;
  const s = t.replace(/___/g, '...').trim();
  if (s && !GEORGIAN.test(s)) texts.add(s);
};
const SPOKEN_KEYS = new Set([
  'audioText', 'prompt', 'targetSentence', 'sourceSentence', 'sentence',
  'statement', 'text', 'germanWord', 'german', 'title',
]);
function walk(node: unknown) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    if (SPOKEN_KEYS.has(k)) add(v);
    if (typeof v === 'object') walk(v);
  }
}
walk(lessons);
for (const e of dictionaryEntries) add(e.article ? `${e.article} ${e.german}` : e.german);

const all = [...texts];
const missing = all.filter(t => !fs.existsSync(path.join(audioDir, `${computeAudioHash(t, VOICE_KEY)}.mp3`)));
const chars = missing.reduce((n, t) => n + t.length, 0);
console.log(`Texts: ${all.length}, missing: ${missing.length}, characters to generate: ${chars}`);

function writeManifest() {
  const hashes = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4));
  fs.writeFileSync(path.join(audioDir, 'manifest.json'), JSON.stringify(hashes));
  console.log(`manifest.json: ${hashes.length} files`);
}

async function generateSpeech(text: string, outputPath: string) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voices[VOICE_KEY]}`, {
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
  for (const text of missing) {
    if (done >= LIMIT) break;
    const dest = path.join(audioDir, `${computeAudioHash(text, VOICE_KEY)}.mp3`);
    try {
      await generateSpeech(text, dest);
      done++;
      console.log(`[${done}] ${text}`);
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

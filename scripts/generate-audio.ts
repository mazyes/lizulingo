import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.replace(/(^['"]|['"]$)/g, '').trim();
      process.env[key] = value;
    }
  });
}

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('❌ Error: ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}

// Load voices
const voicesPath = path.resolve(process.cwd(), 'scripts', 'voices.json');
let voices = {
  male: 'pNInz6obpgDQGcFmaJgB',
  female: '21m00Tcm4TlvDq8ikWAM',
  default: 'pNInz6obpgDQGcFmaJgB',
};
if (fs.existsSync(voicesPath)) {
  voices = JSON.parse(fs.readFileSync(voicesPath, 'utf8'));
}

const audioDir = path.resolve(process.cwd(), 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

function computeSha1(text: string, voice: string): string {
  return crypto.createHash('sha1').update(`${text.trim()}_${voice}`).digest('hex');
}

async function generateSpeech(text: string, voiceId: string, outputPath: string) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
}

async function main() {
  console.log('🎙️ Collecting German text for ElevenLabs generation...');

  // Sample texts to generate (will expand dynamically from modules)
  const sampleTexts = [
    { text: 'Hallo, ich heiße Luka.', voice: voices.male },
    { text: 'Guten Tag!', voice: voices.default },
    { text: 'Auf Wiedersehen!', voice: voices.default },
    { text: 'Ich möchte einen Kaffee, bitte.', voice: voices.male },
    { text: 'Die Rechnung, bitte!', voice: voices.female },
  ];

  for (const item of sampleTexts) {
    const hash = computeSha1(item.text, item.voice);
    const dest = path.join(audioDir, `${hash}.mp3`);

    if (fs.existsSync(dest)) {
      console.log(`⏩ Skipping existing audio: "${item.text}" (${hash}.mp3)`);
      continue;
    }

    try {
      console.log(`🔊 Generating: "${item.text}"...`);
      await generateSpeech(item.text, item.voice, dest);
      console.log(`✅ Saved: ${dest}`);
      // Small throttle to stay within rate limits
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.warn(`⚠️ Failed to generate "${item.text}":`, err);
    }
  }

  console.log('🎉 Audio generation task completed!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

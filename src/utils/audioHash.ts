/**
 * Synchronous hash for German audio file names (cyrb53).
 * Must stay synchronous: iOS Safari only allows audio/speech started
 * directly inside the tap handler, so we cannot await crypto.subtle.
 * Shared by the browser (tts.ts) and scripts/generate-audio.ts.
 */
export function computeAudioHash(text: string, voice: string = 'default'): string {
  const str = `${text.trim()}_${voice}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

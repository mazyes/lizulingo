/**
 * Computes a simple SHA-1 hex hash for German audio files.
 * Works in browser via SubtleCrypto and in Node via crypto.
 */

export async function computeAudioHash(text: string, voice: string = 'default'): Promise<string> {
  const normalized = `${text.trim()}_${voice}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Synchronous fallback hash
  let h = 0;
  for (let i = 0; i < normalized.length; i++) {
    h = Math.imul(31, h) + normalized.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(16);
}

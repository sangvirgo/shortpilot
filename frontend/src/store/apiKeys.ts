const STORAGE_KEY = 'shortpilot_api_keys';

export interface ApiKeys {
  gemini: string;
  pexels: string;
  pixabay: string;
}

export function getStoredKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { gemini: '', pexels: '', pixabay: '' };
}

export function saveKeys(keys: ApiKeys): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function getHeaders(): Record<string, string> {
  const keys = getStoredKeys();
  const h: Record<string, string> = {};
  if (keys.gemini) h['X-Gemini-Key'] = keys.gemini;
  if (keys.pexels) h['X-Pexels-Key'] = keys.pexels;
  if (keys.pixabay) h['X-Pixabay-Key'] = keys.pixabay;
  return h;
}

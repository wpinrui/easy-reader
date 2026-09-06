export type Theme = "dark" | "light";

export interface Prefs {
  fontSize: number;
  theme: Theme;
}

export const DEFAULT_PREFS: Prefs = { fontSize: 20, theme: "dark" };
export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 32;

const PREFS_KEY = "easy-reader:prefs";
const TEXT_KEY = "easy-reader:text";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or a full quota: preferences just do not persist. */
  }
}

export function loadPrefs(): Prefs {
  return { ...DEFAULT_PREFS, ...read<Partial<Prefs>>(PREFS_KEY) };
}

export function savePrefs(prefs: Prefs): void {
  write(PREFS_KEY, prefs);
}

export function loadText(): string {
  return read<string>(TEXT_KEY) ?? "";
}

export function saveText(text: string): void {
  write(TEXT_KEY, text);
}

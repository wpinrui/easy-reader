export type Face = "serif" | "sans" | "hyper";
export type Ground = "paper" | "cream" | "white" | "dark";

export interface Prefs {
  size: number;
  measure: number;
  leading: number;
  tracking: number;
  face: Face;
  ground: Ground;
  lineFocus: boolean;
  hyphenate: boolean;
  justify: boolean;
}

/* Defaults sit where the legibility research does: a 62-character measure and
   1.7 leading at 21px. */
export const DEFAULT_PREFS: Prefs = {
  size: 21,
  measure: 62,
  leading: 1.7,
  tracking: 0,
  face: "serif",
  ground: "paper",
  lineFocus: true,
  hyphenate: false,
  justify: false,
};

export const RANGES = {
  size: { min: 16, max: 34, step: 1 },
  measure: { min: 40, max: 90, step: 1 },
  leading: { min: 1.3, max: 2.1, step: 0.05 },
  tracking: { min: -0.02, max: 0.08, step: 0.005 },
};

/** The measure band the research points at, drawn on the slider track. */
export const MEASURE_BAND = { from: 55, to: 70 };

const PREFS_KEY = "easy-reader:prefs";
const TEXT_KEY = "easy-reader:text";
const NOTES_KEY = "easy-reader:notes";

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

/** Notes belong to one text, so they are keyed by its share id when it has one
    and kept under "local" until it does. */
export function loadNotes(id: string): string {
  return read<string>(`${NOTES_KEY}:${id}`) ?? "";
}

export function saveNotes(id: string, notes: string): void {
  write(`${NOTES_KEY}:${id}`, notes);
}

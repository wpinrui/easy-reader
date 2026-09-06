import {
  type Face,
  type Ground,
  MEASURE_BAND,
  type Prefs,
  RANGES,
} from "../lib/storage";
import { Slider } from "./Slider";
import { Toggle } from "./Toggle";

const FACES: { id: Face; label: string }[] = [
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans" },
  { id: "hyper", label: "Hyper" },
];

const GROUNDS: { id: Ground; label: string }[] = [
  { id: "paper", label: "Paper" },
  { id: "cream", label: "Cream" },
  { id: "white", label: "White" },
  { id: "dark", label: "Dark" },
];

interface ControlsProps {
  prefs: Prefs;
  set: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
}

export function Controls({ prefs, set }: ControlsProps) {
  return (
    <div className="panel">
      <Slider
        label="Size"
        value={`${prefs.size} px`}
        {...RANGES.size}
        current={prefs.size}
        onChange={(v) => set("size", v)}
      />
      <Slider
        label="Measure"
        value={`${prefs.measure} characters`}
        {...RANGES.measure}
        band={MEASURE_BAND}
        current={prefs.measure}
        onChange={(v) => set("measure", v)}
      />
      <Slider
        label="Leading"
        value={prefs.leading.toFixed(2)}
        {...RANGES.leading}
        current={prefs.leading}
        onChange={(v) => set("leading", v)}
      />
      <Slider
        label="Letter spacing"
        value={
          prefs.tracking === 0 ? "normal" : `${prefs.tracking.toFixed(3)}em`
        }
        {...RANGES.tracking}
        current={prefs.tracking}
        onChange={(v) => set("tracking", v)}
      />

      <div className="field">
        <span className="field-label">Face</span>
        <div className="choices">
          {FACES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`face face-${id}${prefs.face === id ? " on" : ""}`}
              onClick={() => set("face", id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">Ground</span>
        <div className="choices">
          {GROUNDS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`swatch swatch-${id}${prefs.ground === id ? " on" : ""}`}
              onClick={() => set("ground", id)}
              aria-label={label}
              title={label}
            />
          ))}
        </div>
      </div>

      <div className="toggles">
        <Toggle
          label="Line focus"
          on={prefs.lineFocus}
          onChange={(v) => set("lineFocus", v)}
        />
        <Toggle
          label="Hyphenate"
          on={prefs.hyphenate}
          onChange={(v) => set("hyphenate", v)}
        />
        <Toggle
          label="Justify"
          on={prefs.justify}
          onChange={(v) => set("justify", v)}
        />
      </div>
    </div>
  );
}

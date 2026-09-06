interface SliderProps {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  band?: { from: number; to: number };
  onChange: (value: number) => void;
}

/** A labelled range whose track can show the band the research points at. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  current,
  band,
  onChange,
}: SliderProps) {
  const pct = (n: number) => ((n - min) / (max - min)) * 100;

  return (
    <label className="field">
      <span className="field-head">
        <span className="field-label">{label}</span>
        <span className="field-value">{value}</span>
      </span>
      <span className="slider">
        <span className="track" />
        {band && (
          <span
            className="track-band"
            style={{
              left: `${pct(band.from)}%`,
              right: `${100 - pct(band.to)}%`,
            }}
          />
        )}
        <span className="track-fill" style={{ width: `${pct(current)}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </span>
    </label>
  );
}

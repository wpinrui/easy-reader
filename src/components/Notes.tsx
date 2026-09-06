export function Notes({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <aside className="notes">
      <div className="notes-head">
        <span className="eyebrow">Notes</span>
        <button type="button" className="quiet" onClick={onClose}>
          N
        </button>
      </div>
      <textarea
        className="notes-body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write as you read."
        aria-label="Notes"
      />
    </aside>
  );
}

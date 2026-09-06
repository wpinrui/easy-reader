import { MAX_PASTE_LENGTH } from "../lib/share";

export function Editor({
  draft,
  onDraft,
  onRead,
  onCancel,
}: {
  draft: string;
  onDraft: (value: string) => void;
  onRead: () => void;
  onCancel: (() => void) | null;
}) {
  const over = draft.length > MAX_PASTE_LENGTH;

  return (
    <section className="editor">
      <textarea
        // biome-ignore lint/a11y/noAutofocus: the box exists only to be typed in
        autoFocus
        className="paste"
        value={draft}
        onChange={(e) => onDraft(e.target.value)}
        placeholder="Anything you paste here becomes readable."
        aria-label="Text to read"
      />
      <div className="editor-foot">
        <span className={`count${over ? " over" : ""}`}>
          {draft.length.toLocaleString()} of {MAX_PASTE_LENGTH.toLocaleString()}
        </span>
        <div className="editor-actions">
          {onCancel && (
            <button type="button" className="quiet" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="solid"
            onClick={onRead}
            disabled={draft.trim() === "" || over}
          >
            Read it
          </button>
        </div>
      </div>
    </section>
  );
}

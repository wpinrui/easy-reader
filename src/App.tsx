import { type CSSProperties, useEffect, useState } from "react";
import { QrPanel } from "./components/QrPanel";
import { Reader } from "./components/Reader";
import { readHashText, shareUrl } from "./lib/codec";
import {
  loadPrefs,
  loadText,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  type Prefs,
  savePrefs,
  saveText,
} from "./lib/storage";

export function App() {
  const [text, setText] = useState(() => readHashText() ?? loadText());
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  useEffect(() => {
    savePrefs(prefs);
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs]);

  useEffect(() => {
    if (text) saveText(text);
  }, [text]);

  function open(next: string) {
    setText(next);
    setEditing(false);
    setSharing(false);
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo(0, 0);
  }

  function setFontSize(delta: number) {
    setPrefs((p) => ({
      ...p,
      fontSize: Math.min(
        MAX_FONT_SIZE,
        Math.max(MIN_FONT_SIZE, p.fontSize + delta),
      ),
    }));
  }

  const showEditor = editing || !text;

  return (
    <div
      className="app"
      style={{ "--reader-size": `${prefs.fontSize}px` } as CSSProperties}
    >
      <header className="bar">
        <h1>easy-reader</h1>
        <div className="controls">
          <button
            type="button"
            onClick={() => setFontSize(-2)}
            disabled={prefs.fontSize <= MIN_FONT_SIZE}
            aria-label="Smaller text"
          >
            A-
          </button>
          <span className="caption">{prefs.fontSize}px</span>
          <button
            type="button"
            onClick={() => setFontSize(2)}
            disabled={prefs.fontSize >= MAX_FONT_SIZE}
            aria-label="Larger text"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() =>
              setPrefs((p) => ({
                ...p,
                theme: p.theme === "dark" ? "light" : "dark",
              }))
            }
          >
            {prefs.theme === "dark" ? "Light" : "Dark"}
          </button>
          {text && !showEditor && (
            <>
              <button type="button" onClick={() => setSharing((s) => !s)}>
                Share
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(text);
                  setEditing(true);
                }}
              >
                New text
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {showEditor ? (
          <section className="editor">
            {editing ? (
              <>
                <textarea
                  // biome-ignore lint/a11y/noAutofocus: the box exists only to be typed in
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Paste or type here. GitHub-flavoured markdown works."
                  aria-label="Text to read"
                />
                <div className="controls">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => open(draft)}
                    disabled={draft.trim() === ""}
                  >
                    Read it
                  </button>
                  {text && (
                    <button type="button" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                className="primary big"
                onClick={() => setEditing(true)}
              >
                Paste text to read
              </button>
            )}
          </section>
        ) : (
          <>
            {sharing && <QrPanel url={shareUrl(text)} />}
            <Reader text={text} />
          </>
        )}
      </main>
    </div>
  );
}

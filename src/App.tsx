import { type CSSProperties, useEffect, useState } from "react";
import { QrPanel } from "./components/QrPanel";
import { Reader } from "./components/Reader";
import { readLegacyHashText } from "./lib/codec";
import { fetchText, idFromUrl, publishText, urlForId } from "./lib/share";
import {
  DEFAULT_PREFS,
  loadPrefs,
  loadText,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  type Prefs,
  savePrefs,
  saveText,
} from "./lib/storage";

export function App() {
  const [text, setText] = useState(() => readLegacyHashText() ?? "");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(() => idFromUrl() !== null);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    savePrefs(prefs);
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs]);

  // A link's id wins over whatever this device read last.
  useEffect(() => {
    const id = idFromUrl();
    if (!id) {
      setText((current) => current || loadText());
      return;
    }
    fetchText(id)
      .then((remote) => {
        if (remote) {
          setText(remote);
          setShareUrl(urlForId(id));
        } else {
          setStatus("That link has no text behind it.");
        }
      })
      .catch(() => setStatus("Could not load that link."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (text) saveText(text);
  }, [text]);

  function open(next: string) {
    setText(next);
    setEditing(false);
    setShareUrl("");
    setStatus("");
    window.history.replaceState(null, "", "/");
    window.scrollTo(0, 0);
  }

  async function share() {
    if (shareUrl) {
      setShareUrl("");
      return;
    }
    setStatus("Making a link...");
    try {
      const id = await publishText(text);
      setShareUrl(urlForId(id));
      window.history.replaceState(null, "", `/${id}`);
      setStatus("");
    } catch {
      setStatus("Could not save this text. Try again.");
    }
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

  const showEditor = editing || (!text && !loading);

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
              <button type="button" onClick={share}>
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
        {status && <p className="status caption">{status}</p>}
        {loading && <p className="status caption">Loading...</p>}
        {showEditor ? (
          <section className="editor">
            {editing ? (
              <>
                <textarea
                  // biome-ignore lint/a11y/noAutofocus: the box exists only to be typed in
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Paste your text"
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
            {shareUrl && <QrPanel url={shareUrl} />}
            {text && <Reader text={text} />}
          </>
        )}
      </main>
    </div>
  );
}

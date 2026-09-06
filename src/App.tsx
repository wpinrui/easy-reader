import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { Controls } from "./components/Controls";
import { Editor } from "./components/Editor";
import { Notes } from "./components/Notes";
import { Reader } from "./components/Reader";
import { SharePanel } from "./components/SharePanel";
import { readLegacyHashText } from "./lib/codec";
import { fetchText, idFromUrl, publishText, urlForId } from "./lib/share";
import {
  DEFAULT_PREFS,
  loadNotes,
  loadPrefs,
  loadText,
  type Prefs,
  saveNotes,
  savePrefs,
  saveText,
} from "./lib/storage";

const FACE_VAR = {
  serif: "var(--font-serif)",
  sans: "var(--font-sans)",
  hyper: "var(--font-hyper)",
};

export function App() {
  const [text, setText] = useState(() => readLegacyHashText() ?? "");
  const [docId, setDocId] = useState("local");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [chromeHidden, setChromeHidden] = useState(false);
  const [loading, setLoading] = useState(() => idFromUrl() !== null);
  const [status, setStatus] = useState("");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => setPrefs(loadPrefs()), []);

  useEffect(() => {
    savePrefs(prefs);
    document.documentElement.dataset.ground = prefs.ground;
  }, [prefs]);

  // A link's id wins over whatever this device read last.
  useEffect(() => {
    const id = idFromUrl();
    if (!id) {
      setText((current) => current || loadText());
      setNotes(loadNotes("local"));
      return;
    }
    fetchText(id)
      .then((remote) => {
        if (remote) {
          setText(remote);
          setDocId(id);
          setNotes(loadNotes(id));
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

  useEffect(() => {
    if (notes) saveNotes(docId, notes);
  }, [docId, notes]);

  const toggleNotes = useCallback(() => setNotesOpen((open) => !open), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLTextAreaElement;
      if (e.key === "Escape") {
        setPanelOpen(false);
        setShareUrl("");
        return;
      }
      if (!typing && e.key.toLowerCase() === "n") toggleNotes();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleNotes]);

  function set<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function open(next: string) {
    setText(next);
    setDocId("local");
    setNotes(loadNotes("local"));
    setEditing(false);
    setShareUrl("");
    setStatus("");
    window.history.replaceState(null, "", "/");
    window.scrollTo(0, 0);
  }

  async function share() {
    setPanelOpen(false);
    if (docId !== "local") {
      setShareUrl(urlForId(docId));
      return;
    }
    setStatus("Making a link...");
    try {
      const id = await publishText(text);
      if (notes) saveNotes(id, notes);
      setDocId(id);
      setShareUrl(urlForId(id));
      window.history.replaceState(null, "", `/${id}`);
      setStatus("");
    } catch {
      setStatus("Could not save this text. Try again.");
    }
  }

  const style = {
    "--reader-face": FACE_VAR[prefs.face],
    "--reader-size": `${prefs.size}px`,
    "--reader-measure": `${prefs.measure}ch`,
    "--reader-leading": String(prefs.leading),
    "--reader-tracking": `${prefs.tracking}em`,
    "--reader-align": prefs.justify ? "justify" : "left",
    "--reader-hyphens": prefs.hyphenate ? "auto" : "manual",
  } as CSSProperties;

  if (loading) {
    return (
      <div className="app" style={style}>
        <p className="status">Loading...</p>
      </div>
    );
  }

  if (editing || !text) {
    return (
      <div className="app" style={style}>
        {status && <p className="status">{status}</p>}
        {editing ? (
          <Editor
            draft={draft}
            onDraft={setDraft}
            onRead={() => open(draft)}
            onCancel={text ? () => setEditing(false) : null}
          />
        ) : (
          <section className="empty">
            <p className="empty-line">
              Anything you paste here becomes readable.
            </p>
            <button
              type="button"
              className="solid big"
              onClick={() => {
                setDraft("");
                setEditing(true);
              }}
            >
              Paste text
            </button>
          </section>
        )}
      </div>
    );
  }

  return (
    <div
      className={`app reading${notesOpen ? " with-notes" : ""}${
        prefs.lineFocus ? " line-focus" : ""
      }`}
      style={style}
    >
      {status && <p className="status">{status}</p>}

      <div className="page">
        {/* Double-clicking the page hides the chrome. Single clicks are left
            alone so selecting and scrolling never move it. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the same toggle is on the puck */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users have the puck and Escape */}
        <div
          className="page-surface"
          onDoubleClick={() => setChromeHidden((h) => !h)}
        >
          <Reader text={text} />
        </div>
        {notesOpen && (
          <Notes
            value={notes}
            onChange={setNotes}
            onClose={() => setNotesOpen(false)}
          />
        )}
      </div>

      {!chromeHidden && (
        <div className="puck">
          <button
            type="button"
            className={panelOpen ? "on" : ""}
            onClick={() => setPanelOpen((o) => !o)}
          >
            <span className="aa">Aa</span>
            <span className="puck-value">{prefs.size} px</span>
          </button>
          <button type="button" onClick={toggleNotes}>
            Notes
          </button>
          <button type="button" onClick={share}>
            Share
          </button>
          <span className="puck-rule" />
          {(["paper", "cream", "white", "dark"] as const).map((g) => (
            <button
              key={g}
              type="button"
              className={`dot swatch-${g}${prefs.ground === g ? " on" : ""}`}
              onClick={() => set("ground", g)}
              aria-label={g}
              title={g}
            />
          ))}
          <span className="puck-rule" />
          <button type="button" onClick={() => setEditing(true)}>
            New
          </button>
        </div>
      )}

      {panelOpen && (
        <>
          <button
            type="button"
            className="scrim"
            onClick={() => setPanelOpen(false)}
            aria-label="Close controls"
          />
          <div className="panel-wrap">
            <Controls prefs={prefs} set={set} />
          </div>
        </>
      )}

      {shareUrl && (
        <SharePanel url={shareUrl} onClose={() => setShareUrl("")} />
      )}
    </div>
  );
}

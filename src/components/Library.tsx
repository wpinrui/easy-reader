import { useEffect, useState } from "react";
import { signIn, signOutUser } from "../lib/firebase";
import { deleteText, listMine, type SharedText } from "../lib/share";

function ago(date: Date | null): string {
  if (!date) return "never";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "a month ago" : `${months} months ago`;
}

function on(date: Date | null): string {
  return date
    ? date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "unknown";
}

export function Library({
  email,
  onClose,
}: {
  email: string | null;
  onClose: () => void;
}) {
  const [texts, setTexts] = useState<SharedText[] | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState("");

  useEffect(() => {
    if (!email) {
      setTexts(null);
      return;
    }
    listMine()
      .then(setTexts)
      .catch(() => setError("Could not load your texts."));
  }, [email]);

  async function remove(id: string) {
    setConfirming("");
    try {
      await deleteText(id);
      setTexts((current) => (current ?? []).filter((t) => t.id !== id));
    } catch {
      setError("Could not delete that text.");
    }
  }

  return (
    <section className="library">
      <header className="library-head">
        <div>
          <h1 className="library-title">Shared texts</h1>
          <p className="library-sub">
            {email
              ? "Least recently opened first, so what to clear out is at the top."
              : "Sign in to see the texts you have shared, from any device."}
          </p>
        </div>
        <div className="row-actions">
          {email && (
            <button type="button" className="quiet" onClick={signOutUser}>
              Sign out
            </button>
          )}
          <button type="button" className="quiet" onClick={onClose}>
            Close
          </button>
        </div>
      </header>

      {email && <p className="library-account">Signed in as {email}</p>}

      {!email && (
        <div className="library-signin">
          <button type="button" className="solid" onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      )}

      {error && <p className="status">{error}</p>}
      {email && !texts && !error && <p className="status">Loading...</p>}
      {texts?.length === 0 && (
        <p className="status">You have not shared anything yet.</p>
      )}

      <ul className="library-list">
        {texts?.map((t) => (
          <li key={t.id} className="row">
            <a className="row-main" href={`/${t.id}`}>
              <span className="row-title">{t.title}</span>
              <span className="row-meta">
                {t.wordCount.toLocaleString()} words, opened{" "}
                {ago(t.lastAccessedAt)}, created {on(t.createdAt)}
              </span>
            </a>
            {confirming === t.id ? (
              <span className="row-actions">
                <button
                  type="button"
                  className="danger"
                  onClick={() => remove(t.id)}
                >
                  Delete for good
                </button>
                <button
                  type="button"
                  className="quiet"
                  onClick={() => setConfirming("")}
                >
                  Keep
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="quiet"
                onClick={() => setConfirming(t.id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

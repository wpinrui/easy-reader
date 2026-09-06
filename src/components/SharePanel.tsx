import { useEffect, useState } from "react";

export function SharePanel({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let live = true;
    import("qrcode").then(({ toDataURL }) =>
      toDataURL(url, { margin: 1, width: 480 }).then((src) => {
        if (live) setQr(src);
      }),
    );
    return () => {
      live = false;
    };
  }, [url]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <button
        type="button"
        className="scrim"
        onClick={onClose}
        aria-label="Close share"
      />
      <div className="share panel">
        {qr && (
          <img className="qr" src={qr} alt="QR code linking to this text" />
        )}
        <p className="share-note">Scan to keep reading on your phone.</p>
        <button type="button" className="solid" onClick={copy}>
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </>
  );
}

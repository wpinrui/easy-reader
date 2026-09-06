import { useEffect, useState } from "react";
import { MAX_QR_URL_LENGTH, MAX_URL_LENGTH } from "../lib/codec";

/** Renders on a canvas-free data URL so the image scales with the layout. */
export function QrPanel({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (url.length > MAX_QR_URL_LENGTH) {
      setDataUrl("");
      return;
    }
    let live = true;
    import("qrcode").then(({ toDataURL }) =>
      toDataURL(url, { margin: 1, width: 320 }).then((src) => {
        if (live) setDataUrl(src);
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

  if (url.length > MAX_URL_LENGTH) {
    return (
      <div className="share">
        <p className="caption">
          This text is too long to fit in a link ({url.length} characters). It
          is still saved on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="share">
      {dataUrl ? (
        <img className="qr" src={dataUrl} alt="QR code linking to this text" />
      ) : (
        <p className="caption">
          Too long for a QR code, but the link below still works.
        </p>
      )}
      <button type="button" onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <p className="caption">Scan to keep reading on your phone.</p>
    </div>
  );
}

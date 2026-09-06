import { useEffect, useState } from "react";

export function QrPanel({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

  return (
    <div className="share">
      {dataUrl && (
        <img className="qr" src={dataUrl} alt="QR code linking to this text" />
      )}
      <code className="link">{url}</code>
      <button type="button" onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

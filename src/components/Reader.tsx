import { useMemo } from "react";
import { renderMarkdown } from "../lib/markdown";

export function Reader({ text }: { text: string }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  // Sanitised in renderMarkdown; markdown has to reach the DOM as HTML.
  return (
    <article
      className="reader"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised by DOMPurify
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

import DOMPurify from "dompurify";
import { Marked } from "marked";

const marked = new Marked({ gfm: true, breaks: true });

/** GitHub-flavoured markdown to sanitised HTML. Inline HTML the user pasted
    (<br>, <b>, tables) survives; scripts and event handlers do not. */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false });
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

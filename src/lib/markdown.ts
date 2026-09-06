import DOMPurify from "dompurify";
import { Marked } from "marked";

const marked = new Marked({ gfm: true, breaks: true });

/** Blocks that get no focus rail: a heading or a rule is not something you
    dwell on, and a rail beside each one would only add noise. */
const UNRAILED = /^(?:H[1-6]|HR)$/;

/**
 * Wraps every top-level block so it can carry a rail in the left margin. The
 * rail, not the text, is what line focus reacts to, which keeps the pointer out
 * of the reading column.
 */
function withRails(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const block of Array.from(doc.body.children)) {
    const wrap = doc.createElement("div");
    wrap.className = UNRAILED.test(block.tagName) ? "blk plain" : "blk";
    const rail = doc.createElement("span");
    rail.className = "rail";
    rail.setAttribute("aria-hidden", "true");
    block.replaceWith(wrap);
    wrap.append(rail, block);
  }
  return doc.body.innerHTML;
}

/** GitHub-flavoured markdown to sanitised HTML. Inline HTML the user pasted
    (<br>, <b>, tables) survives; scripts and event handlers do not. */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false });
  return withRails(DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }));
}

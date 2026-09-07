# easy-reader

Paste any text, read it in a layout tuned for reading, and carry it to your phone with a QR code.

Live at https://easy-reader-ivan.web.app/

## What it does

- **Readable by default.** A 55 to 70 character measure, 1.65 line height, a serif face, ragged-right text, and rem/ch sizing so a high-DPI or zoomed screen scales the whole block together.
- **GitHub-flavoured markdown**, including tables, task lists and inline HTML like `<br>`. Everything is sanitised with DOMPurify before it reaches the DOM.
- **Shareable links.** The text is compressed into the URL hash, so `https://easy-reader-ivan.web.app/#<payload>` opens it anywhere. Nothing is uploaded: the hash never leaves the browser.
- **QR code** for the same link, so you can carry the text from a laptop to a phone.
- **Remembers.** The last text and your preferences live in localStorage.

## Limits

10,000 characters of prose compress to roughly 400 URL characters (measured). Links are refused past 8,000 URL characters and the QR code is dropped past 1,200, where phone cameras stop reading it reliably. The text is still saved on the device either way.

## Development

```
yarn install
yarn dev
yarn build
```

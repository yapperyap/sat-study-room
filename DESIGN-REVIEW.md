# Web Interface Guidelines review — October 29, 2026

Reviewed `dist/index.html`, `dist/style.css`, `dist/app.js`, and the new legal page against the current Vercel Web Interface Guidelines.

Addressed:
- dist/index.html:1 — missing skip link; added keyboard-accessible jump to practice.
- dist/index.html:4 — answer elimination lacked accessible name; added label.
- dist/index.html:7 — dialogs lacked accessible titles; labeled each dialog.
- dist/index.html:8 — question ID input lacked autocomplete/name/spellcheck settings; added.
- dist/app.js:6 — theme selection lacked programmatic pressed state and document color-scheme; fixed.
- dist/app.js:19 — revisiting questions fetched the same JSON repeatedly; bounded 24-question cache.
- dist/app.js:19 — current question absent from URL; added shareable question ID and restore.
- dist/style.css:1 — modal scroll chaining, long-content overflow, and summary focus styles; fixed.
- dist/style.css:3 — added reduced-motion rules and long-list content visibility.

Preserved: official question text, existing topic filters, shuffle, optional elapsed timer, answer review, local progress, navigator, and system/light/dark modes.

Verification: JS syntax checks; browser checks of Focus/Unfocus, answer selection and rationale, dark theme, direct math ID lookup, and legal/contact page navigation. Focus view visually checked with fixed navigation and scrolling question area. Mobile wrapping rules reviewed; no mobile-device emulation performed.

Remaining limitations:
- Third-party question images and mathematical notation have not received a full accessibility audit. Source evidence was preserved, including existing alternative text and image dimensions.
- Written permission for online question-bank reproduction has not been provided. College Board's published terms restrict this use. Policy notices do not resolve that issue or guarantee legal compliance. Existing owner-only access is preserved.

## Appearance and scrolling update

- Added persisted border presets and arbitrary color picker; replaced continuous pastel strip with compact separated multicolor dashes. Independently approximates Bluebook; does not claim pixel identity or official test identification.
- Added locally stored custom fonts (IndexedDB + FontFace), built-in fallbacks, individual deletion with confirmation, complete data deletion, error handling and 10 MB input limit.
- Added question text slider 12–36 px with explicit 18 px default, preview, and reset.
- Added first-use dismissible informational notice, reopenable in Settings. Updated privacy disclosures for font storage and appearance settings.
- Split panes are independent scroll regions, keyboard focusable; small screens stack independently scrollable panes. New questions reset both scroll positions.
- Browser verified: custom font import and reload persistence; green/rainbow border switching; 36 px slider and built-in font selection; first-use notice. Left PageDown changed left scroll position while right remained at zero. Desktop checked; mobile rules reviewed without device emulation.

---
"amon-agent": patch
---

Fix external image rendering in markdown and enable proper file download

- Updated CSP `img-src` to allow `https:` and `http:` sources so external markdown images render correctly
- Updated CSP `connect-src` to allow external fetch requests for image downloads
- Added CORS bypass via `session.webRequest.onHeadersReceived` to prevent cross-origin fetch failures
- Added `will-download` handler to show a save dialog instead of silently downloading or opening a new window

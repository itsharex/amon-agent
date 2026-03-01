---
"amon-agent": patch
---

Open external links in system default browser instead of Electron window

- Added `setWindowOpenHandler` to intercept `window.open()` and redirect http/https links to the system browser via `shell.openExternal`
- Disabled Streamdown's built-in link safety modal (`linkSafety: { enabled: false }`) since links are now handled by the OS

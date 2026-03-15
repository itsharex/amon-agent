---
"amon-agent": patch
---

Add tool approval modes and in-chat permission requests.

- add `ask`, `auto-edit`, and `yolo` approval modes for sessions, plus a global default approval mode in settings
- gate tool execution through the main-process approval flow and surface pending approvals in the chat input area
- show tool-specific permission details, including diff previews for `Write` and `Edit` requests

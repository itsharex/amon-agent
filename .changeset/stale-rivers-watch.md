---
"amon-agent": patch
---

Add unit tests for main-process execution, persistence, and state bridging.

- cover `Bash` tool execution paths including abort, timeout, exit codes, and truncated output
- add tests for `Persistence`, `SessionStore`, `EventAdapter`, and push bridging behavior
- add `ConfigStore` tests for caching, deep merges, atomic writes, and API key resolution

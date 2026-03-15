---
"amon-agent": patch
---

Add unit test coverage for the built-in tool stack.

- cover `ToolRegistry` registration, validation, and error handling paths
- add file-system tool tests for `Read`, `Write`, `Edit`, and `Glob`
- add mocked tests for `Grep`, `WebFetch`, and `WebSearch` behaviors

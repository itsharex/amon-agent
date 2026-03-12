---
"amon-agent": patch
---

Fix token usage accounting and display for assistant responses.

- Align OpenAI Completions and Gemini token mapping with the current app behavior
- Fix assistant turn token usage display so merged responses show the intended request usage
- Fix context window usage to avoid flashing to zero while streaming and use total context occupancy when available

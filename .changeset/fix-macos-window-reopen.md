---
"amon-agent": patch
---

Fix macOS window lifecycle so reopening from the Dock no longer reinitializes the app or falls back to onboarding after the main window is closed.

- Keep IPC handlers registered until the app actually quits, so reopening the app window on macOS does not break `settings.get`, `session.list`, or push event delivery.
- Hide the main window on macOS when the close button is clicked instead of destroying it, so reopening from the Dock restores the existing window state without a full renderer reload.

修复 macOS 窗口生命周期问题，避免用户关闭主窗口后从 Dock 重新打开时应用被重新初始化，或错误回到 onboarding 页面。

- 将 IPC handler 的清理时机延后到应用真正退出时，避免在 macOS 重新打开窗口后 `settings.get`、`session.list` 和 push 事件失效。
- 在 macOS 下点击关闭按钮时隐藏主窗口而不是销毁窗口，这样从 Dock 重新打开时会恢复已有窗口状态，而不是重新加载 renderer。


<div align="center">
  <img src="./public/images/Logo.png" style="border-radius: 16px;" alt="Amon" width="64" />
  <h1>Amon Coworker</h1>
  <p>Your AI coworker running on your desktop</p>

  <a href="./README.zh-CN.md">中文</a> | English

  <br/>
  <br/>

  <a href="https://www.gnu.org/licenses/agpl-3.0"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3"></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-39-47848F?logo=electron&logoColor=white" alt="Electron"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://github.com/anthropics/claude-code"><img src="https://img.shields.io/badge/Claude-Agent%20SDK-CC785C?logo=anthropic&logoColor=white" alt="Claude"></a>
</div>

## About Amon

Amon is an intelligent AI coworker that runs locally on your desktop, built on the [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview). It doesn't just chat with you — it actually helps you get work done: writing code, executing commands, searching for information, and managing files.

## Feature Overview

Let's take a look at Amon's features through screenshots.

![Thinking / Tool Calls](./screenshots/img1.png)

Amon can think through your messages, execute tool calls, and complete your tasks.

![Plan Mode](./screenshots/img2.jpg)

Amon has a plan mode that creates a TODO task list first, then executes according to the plan.

![Dark Theme](./screenshots/img3.jpg)

Amon supports both dark and light theme modes.

![File Diff](./screenshots/img4.jpg)

Amon can display file modification diffs.

![Send Images](./screenshots/img5.png)

Amon supports sending image messages.

![Custom Multi-Provider](./screenshots/img6.png)

Amon allows you to add multiple API providers. Note: Currently only Claude API-compatible format APIs are supported.

![Agent Configuration](./screenshots/img7.png)

Amon lets you configure Agent execution permissions with different permission levels.

You can customize the system prompt.

If you have Claude Code installed with an API Key configured, you can enable `Claude Code Mode` for enhanced coding capabilities.

With Claude Code Mode enabled, Amon will use Claude Code's global settings and system prompts, and automatically load global Skills, etc.

Once enabled, you can use Amon as a visual client for Claude Code.

![Workspaces](./screenshots/img8.png)

Amon works on a per-workspace (folder) basis. You can set up multiple workspaces. Default workspace: `~/.amon/workspaces`

![Skills](./screenshots/img9.png)

Amon supports Agent Skills — you can install Skills to add specialized capabilities to Amon.

Several recommended skills are built in, including:
- PDF Tools — Text extraction, form filling, document merging
- Frontend Design — Create beautiful web interfaces and components
- Algorithmic Art — Generate creative artwork with p5.js
- MCP Builder — Develop MCP servers

## Getting Started

### Installation

Visit the [Releases](https://github.com/liruifengv/amon-agent/releases) page to download the installer for your platform.

#### Note for macOS Users

Since the app is not Apple-signed, macOS may block it from running. After downloading, run the following command in the terminal to remove the quarantine attribute:

```bash
xattr -cr /Applications/Amon.app
```

### Configuration

Amon offers two usage modes — choose based on your needs:

#### Option 1: Standalone Mode (Recommended for New Users)

After first launch, follow these steps to configure:

1. **Configure AI Provider**

   Go to `Settings` → `Providers`, create and enable the AI provider you want to use

2. **Create a Workspace**

   Go to `Settings` → `Workspaces`, create a new workspace and select a local folder as the project root

   Default workspace: `~/.amon/workspaces`

3. **Start Using**

   Return to the main screen, click `New Session`, select a workspace and start chatting

#### Option 2: Claude Code Mode (Recommended for Development)

If you have [Claude Code](https://github.com/anthropics/claude-code) installed with an API Key configured, you can enable Claude Code Mode for enhanced coding capabilities.

**How to enable**: `Settings` → `Agent` → Enable `Claude Code Mode`

**Mode Comparison**:

| Feature | Standalone Mode | Claude Code Mode |
|---------|----------------|-----------------|
| Prompts | Amon default prompts | Inherits Claude Code prompts |
| API Config | Manual configuration | Prioritizes Claude Code global config |
| Skills | Local Skills | Shares Claude Code installed Skills |
| Tool Permissions | Amon permission settings | Claude Code permission settings |
| Use Case | General chat and tasks | Code development and engineering tasks |

## Development Guide

### Prerequisites

- Node.js 18+ or Bun 1.0+
- macOS / Windows / Linux

### Development Commands

```bash
bun install            # Install dependencies
bun start              # Start dev server (with hot reload)
bun run lint           # Lint code
bun run typecheck      # Type check
```

### Build and Package

```bash
bun run download:binaries  # Download runtime binaries (bun, uv)
bun run package            # Create app package (no installer)
bun run make               # Create platform installers
```

### Project Structure

```
amon-agent/
├── src/
│   ├── main/           # Electron main process
│   │   ├── agent/      # Claude SDK integration
│   │   ├── store/      # State management and persistence
│   │   └── ipc/        # IPC communication handlers
│   ├── renderer/       # React renderer process
│   │   ├── components/ # UI components
│   │   └── store/      # Frontend state management
│   ├── preload/        # Preload scripts
│   └── shared/         # Shared types and utilities
├── resources/
│   ├── skills/         # Built-in Skills
│   ├── icons/          # App icons
│   └── [bun, uv]       # Runtime binaries
└── forge.config.ts     # Electron Forge configuration
```

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Core Frameworks**
- Electron — Cross-platform desktop apps
- React 19 — UI framework
- TypeScript — Type safety
- Claude Agent SDK — AI capabilities

**Frontend**
- Tailwind CSS + Shadcn/ui — UI design
- Zustand — State management
- Streamdown — Streaming Markdown rendering
- Motion — Animations

</td>
<td valign="top" width="50%">

**Build Tools**
- Vite — Lightning-fast builds
- Electron Forge — Packaging and distribution
- Bun — Runtime and package manager

**Data Processing**
- Zod — Runtime type validation
- Shiki — Code syntax highlighting

</td>
</tr>
</table>

## License

This project is open-sourced under the [AGPL-3.0](LICENSE) license.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/liruifengv">@liruifengv</a></sub>
</div>

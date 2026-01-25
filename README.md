
<div align="center">
  <img src="./public/images/Logo.png" style="border-radius: 16px;" alt="Amon" width="64" />
  <h1>Amon Coworker</h1>
  <p>你的桌面 AI 工作伙伴</p>
  <p>Your AI coworker running on your desktop</p>

  <a href="https://www.gnu.org/licenses/agpl-3.0"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3"></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-39-47848F?logo=electron&logoColor=white" alt="Electron"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://github.com/anthropics/claude-code"><img src="https://img.shields.io/badge/Claude-Agent%20SDK-CC785C?logo=anthropic&logoColor=white" alt="Claude"></a>
</div>

## 关于 Amon

Amon 是运行在本地的智能 AI Coworker，基于 [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) 构建。它不仅能与你对话，还能真正帮你完成工作：编写代码、执行命令、搜索信息、管理文件。


## 功能速览

我们来看看截图预览 Amon 的功能。

![思考/工具调用](./screenshots/img1.png)

Amon 可以根据你发送的消息，进行思考，执行工具调用，完成你的任务。

![计划模式](./screenshots/img2.jpg)

Amon 拥有计划模式，可以先创建任务 TODO，然后按计划执行。

![深色主题](./screenshots/img3.jpg)

Amon 拥有深色/浅色主题模式。

![文件修改 diff](./screenshots/img4.jpg)

Amon 可以展示文件修改 diff 内容。

![发送图片](./screenshots/img5.png)

Amon 支持发送图片消息。

![自定义多供应商](./screenshots/img6.png)

Amon 可以自定义添加多个 API 供应商。注意：目前只支持 Claude API 兼容格式的 API。

![智能体配置](./screenshots/img7.png)

Amon 可以设置 Agent 的执行权限，有不同级别的权限模式。

可以自定义系统提示词。

如果你已安装 Claude Code 并配置了 API Key，可以开启 `Claude Code 模式`以获得更强的代码能力。

开启 Claude Code 模式后，Amon 将使用 Claude Code 的全局设置，并使用 Claude Code 的系统提示词，会默认加载全局的 Skills 等等。

开启后，你可以把 Amon 当做 Claude Code 的一个可视化客户端来使用。

![工作空间](./screenshots/img8.png)

Amon 以工作空间（文件夹）为单位来进行工作，你可以设置多个工作空间。默认工作空间：`~/.amon/workspaces`

![Skills](./screenshots/img9.png)

Amon 支持 Agent Skills，你可以通过安装 Skills 为 Amon 添加专业能力。

目前内置了一些推荐技能，包括：
- PDF 工具 — 文本提取、表单填写、文档合并
- 前端设计 — 创建精美的 Web 界面和组件
- 算法艺术 — 使用 p5.js 生成创意艺术作品
- MCP 构建 — 开发 MCP 服务器


## 快速开始

### 安装

访问 [Releases](https://github.com/liruifengv/amon-agent/releases) 页面下载对应平台的安装包。

### 配置

Amon 提供两种使用模式，根据你的需求选择：

#### 方式一：独立模式（推荐新用户）

首次启动后，按以下步骤配置：

1. **配置 AI 供应商**

   进入 `设置` → `供应商`，创建并启用你要使用的 AI 供应商

2. **创建工作空间**

   进入 `设置` → `工作空间`，创建新工作空间并选择本地文件夹作为项目根目录

   默认工作空间：`~/.amon/workspaces`

3. **开始使用**

   返回主界面，点击 `新建会话`，选择工作空间即可开始对话

#### 方式二：Claude Code 模式（推荐代码开发）

如果你已安装 [Claude Code](https://github.com/anthropics/claude-code) 并配置了 API Key，可以开启 Claude Code 模式以获得更强的代码能力。

**开启方式**：`设置` → `Agent` → 启用 `Claude Code 模式`

**模式对比**：

| 特性 | 独立模式 | Claude Code 模式 |
|------|---------|-----------------|
| 提示词 | Amon 默认提示词 | 继承 Claude Code 提示词 |
| API 配置 | 手动配置 | 优先使用 Claude Code 全局配置 |
| Skills | 本地 Skills | 共享 Claude Code 已安装的 Skills |
| 工具权限 | Amon 权限设置 | Claude Code 权限设置 |
| 适用场景 | 通用对话和任务 | 代码开发和工程任务 |


## 开发指南

### 环境要求

- Node.js 18+ 或 Bun 1.0+
- macOS / Windows / Linux

### 开发命令

```bash
bun install            # 安装依赖
bun start              # 启动开发服务器（支持热重载）
bun run lint           # 代码检查
bun run typecheck      # 类型检查
```

### 构建和打包

```bash
bun run download:binaries  # 下载运行时二进制文件（bun、uv）
bun run package            # 创建应用包（不创建安装器）
bun run make               # 创建平台安装包
```

### 项目结构

```
amon-agent/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── agent/      # Claude SDK 集成
│   │   ├── store/      # 状态管理和持久化
│   │   └── ipc/        # IPC 通信处理
│   ├── renderer/       # React 渲染进程
│   │   ├── components/ # UI 组件
│   │   └── store/      # 前端状态管理
│   ├── preload/        # Preload 脚本
│   └── shared/         # 共享类型和工具
├── resources/
│   ├── skills/         # 内置 Skills
│   ├── icons/          # 应用图标
│   └── [bun, uv]       # 运行时二进制文件
└── forge.config.ts     # Electron Forge 配置
```

## 技术栈

<table>
<tr>
<td valign="top" width="50%">

**核心框架**
- Electron — 跨平台桌面应用
- React 19 — UI 框架
- TypeScript — 类型安全
- Claude Agent SDK — AI 能力

**前端技术**
- Tailwind CSS + Shadcn/ui — 界面设计
- Zustand — 状态管理
- Streamdown — Markdown 流式渲染
- Motion — 动画效果

</td>
<td valign="top" width="50%">

**构建工具**
- Vite — 极速构建
- Electron Forge — 打包分发
- Bun — 运行时和包管理

**数据处理**
- Zod — 运行时类型验证
- Shiki — 代码语法高亮

</td>
</tr>
</table>


## 开源协议

本项目采用 [AGPL-3.0](LICENSE) 协议开源。

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/liruifengv">@liruifengv</a></sub>
</div>

# Public Assets

> **注意**：在 Electron + Vite 项目中，不推荐使用 public 目录存放渲染进程使用的图片。
> 建议使用 `src/renderer/assets/` 并通过 import 引入，以确保打包后路径正确。

这个目录存放渲染进程使用的静态资源文件（图片、字体等）。

## ⚠️ Electron 打包限制

在 Electron Forge + Vite 项目中，`public` 目录的文件在打包后可能无法正确访问。

**推荐做法**：
- ✅ 将图片放在 `src/renderer/assets/images/`
- ✅ 使用 `import` 语法引入
- ❌ 避免使用 `public/` 目录存放图片

## 使用方式（不推荐）

如果确实需要使用 public 目录：

```tsx
// 在 React 组件中使用
<img src="/images/logo.png" alt="Logo" />

// 或者在 CSS 中使用
background-image: url('/images/bg.png');
```

## 推荐替代方案

使用 `src/renderer/assets/` 并 import：

```tsx
import logo from '@/renderer/assets/images/logo.png';

function App() {
  return <img src={logo} alt="Logo" />;
}
```

## 为什么不推荐 public 目录？

1. **打包问题**：Electron Forge 打包后，public 文件路径可能不正确
2. **没有优化**：public 文件不会被 Vite 优化处理
3. **没有类型检查**：import 方式有 TypeScript 支持


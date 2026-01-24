# Renderer Assets

这个目录存放需要通过 import 导入的资源文件。

## 使用方式

通过 ES6 import 语法导入，Vite 会处理这些资源（优化、添加 hash 等）：

```tsx
// 在 React 组件中使用
import logo from '@/renderer/assets/images/logo.png';

function App() {
  return <img src={logo} alt="Logo" />;
}
```

## 目录结构

```
src/renderer/assets/
├── images/       # 需要优化处理的图片
├── styles/       # 全局样式文件
└── fonts/        # 需要打包的字体
```

## 注意事项

- 必须通过 import 导入才能使用
- Vite 会优化并添加 hash 到文件名
- 适合需要优化的小图片（如组件图标）
- 可以使用别名 `@/renderer/assets/...`

## 两种方式的选择

**使用 `public/`：**
- 大尺寸图片、背景图
- 不需要优化的资源
- 需要固定 URL 的文件

**使用 `src/renderer/assets/`：**
- 组件内使用的小图标
- 需要优化和版本管理的资源
- TypeScript 类型检查的资源

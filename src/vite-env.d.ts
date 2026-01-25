/// <reference types="vite/client" />

// 声明 electronAPI 类型
import type { ElectronAPI } from './preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// 声明图片资源模块
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

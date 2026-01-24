import React from 'react';
import {
  FileText,
  Pencil,
  Edit,
  Terminal,
  Search,
  SearchCode,
  Globe,
  Settings,
} from 'lucide-react';

/**
 * Tool display configuration for permission UI components
 */
export interface ToolDisplayConfig {
  icon: React.ReactNode;
  name: string;
  color: string;
  bgColor: string;
}

/**
 * Configuration for Claude SDK tools
 */
export const TOOL_DISPLAY_CONFIG: Record<string, ToolDisplayConfig> = {
  Read: {
    icon: React.createElement(FileText, { className: 'w-4 h-4' }),
    name: '读取文件',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  Write: {
    icon: React.createElement(Pencil, { className: 'w-4 h-4' }),
    name: '写入文件',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  Edit: {
    icon: React.createElement(Edit, { className: 'w-4 h-4' }),
    name: '编辑文件',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  Bash: {
    icon: React.createElement(Terminal, { className: 'w-4 h-4' }),
    name: '执行命令',
    color: 'text-thinking',
    bgColor: 'bg-thinking/10',
  },
  Glob: {
    icon: React.createElement(Search, { className: 'w-4 h-4' }),
    name: '搜索文件',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  Grep: {
    icon: React.createElement(SearchCode, { className: 'w-4 h-4' }),
    name: '搜索内容',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  WebFetch: {
    icon: React.createElement(Globe, { className: 'w-4 h-4' }),
    name: '获取网页',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  WebSearch: {
    icon: React.createElement(Search, { className: 'w-4 h-4' }),
    name: '网络搜索',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
};

export const DEFAULT_TOOL_CONFIG: ToolDisplayConfig = {
  icon: React.createElement(Settings, { className: 'w-4 h-4' }),
  name: '未知工具',
  color: 'text-muted-foreground',
  bgColor: 'bg-muted',
};

/**
 * Get display config for a tool, falling back to default if not found
 */
export function getToolConfig(toolName: string): ToolDisplayConfig {
  return TOOL_DISPLAY_CONFIG[toolName] || { ...DEFAULT_TOOL_CONFIG, name: toolName };
}

/**
 * Get input summary for display based on tool type
 */
export function getToolInputSummary(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'Read':
    case 'Write':
    case 'Edit':
      return String(input.file_path || '');
    case 'Bash':
      return String(input.command || '');
    case 'Glob':
    case 'Grep':
      return String(input.pattern || '');
    case 'WebFetch':
      return String(input.url || '');
    case 'WebSearch':
      return String(input.query || '');
    default:
      return '';
  }
}

import React, { useState, useMemo } from 'react';
import { ToolCall } from '../../../types';
import {
  FileText,
  Pencil,
  Edit,
  Terminal,
  Search,
  SearchCode,
  Globe,
  Settings,
  ListTodo,
  ChevronRight,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { CodeBlockContent } from '../../ai-elements/code-block';
import type { BundledLanguage } from 'shiki';
import * as Diff from 'diff';

// 文件扩展名到语言的映射
const EXT_TO_LANG: Record<string, BundledLanguage> = {
  // JavaScript/TypeScript
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  mjs: 'javascript',
  cjs: 'javascript',
  // Web
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  vue: 'vue',
  svelte: 'svelte',
  // Data formats
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  // Programming languages
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  kt: 'kotlin',
  kts: 'kotlin',
  swift: 'swift',
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'c',
  hpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  lua: 'lua',
  r: 'r',
  // Shell
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  fish: 'fish',
  ps1: 'powershell',
  // Config
  md: 'markdown',
  mdx: 'mdx',
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  cmake: 'cmake',
  // Other
  sql: 'sql',
  graphql: 'graphql',
  gql: 'graphql',
  prisma: 'prisma',
  env: 'dotenv',
};

/**
 * 从文件路径获取语言类型
 */
function getLanguageFromPath(filePath: string): BundledLanguage {
  const fileName = filePath.split('/').pop() || '';
  const lowerFileName = fileName.toLowerCase();

  // 特殊文件名
  if (lowerFileName === 'dockerfile') return 'dockerfile';
  if (lowerFileName === 'makefile') return 'makefile';
  if (lowerFileName.startsWith('.env')) return 'dotenv';

  // 获取扩展名
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return EXT_TO_LANG[ext] || 'text';
}

export interface ToolCallBlockProps {
  toolCall: ToolCall;
}

// 工具图标映射
const TOOL_ICONS: Record<string, React.ReactNode> = {
  Read: <FileText className="w-4 h-4" />,
  Write: <Pencil className="w-4 h-4" />,
  Edit: <Edit className="w-4 h-4" />,
  Bash: <Terminal className="w-4 h-4" />,
  Glob: <Search className="w-4 h-4" />,
  Grep: <SearchCode className="w-4 h-4" />,
  WebFetch: <Globe className="w-4 h-4" />,
  WebSearch: <Search className="w-4 h-4" />,
  Task: <ListTodo className="w-4 h-4" />,
};

// 工具显示名称
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  Read: 'Read File',
  Write: 'Write File',
  Edit: 'Edit File',
  Bash: 'Run Command',
  Glob: 'Find Files',
  Grep: 'Search Content',
  WebFetch: 'Fetch URL',
  WebSearch: 'Web Search',
  Task: 'Run Task',
  TodoWrite: 'Update Todos',
};

/**
 * 获取输入参数摘要
 */
function getInputSummary(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'Read':
    case 'Write':
    case 'Edit':
      return String(input.file_path || '');
    case 'Bash': {
      const cmd = String(input.command || '');
      return cmd.length > 50 ? cmd.slice(0, 50) + '...' : cmd;
    }
    case 'Glob':
    case 'Grep':
      return String(input.pattern || '');
    case 'WebFetch':
      return String(input.url || '');
    case 'WebSearch':
      return String(input.query || '');
    case 'Task':
      return String(input.description || '');
    default:
      return '';
  }
}

/**
 * 代码内容展示组件
 */
const CodeContent: React.FC<{
  label: string;
  code: string;
  language: BundledLanguage;
  labelColor?: string;
}> = ({ label, code, language, labelColor = 'text-muted-foreground' }) => (
  <div className="px-3 py-2">
    <div className={`text-xs font-medium mb-1 ${labelColor}`}>{label}</div>
    <div className="rounded-md border border-border overflow-hidden max-h-60 overflow-y-auto">
      <CodeBlockContent code={code} language={language} showLineNumbers={false} />
    </div>
  </div>
);

/**
 * 渲染 Write 工具的输入内容
 */
const WriteInputContent: React.FC<{ input: Record<string, unknown> }> = ({ input }) => {
  const filePath = String(input.file_path || '');
  const content = String(input.content || '');
  const language = useMemo(() => getLanguageFromPath(filePath), [filePath]);

  return (
    <>
      {/* 文件路径 */}
      <div className="px-3 py-2">
        <div className="text-xs font-medium text-muted-foreground mb-1">File Path</div>
        <div className="text-xs font-mono bg-black/5 dark:bg-white/10 text-foreground rounded px-2 py-1">
          {filePath}
        </div>
      </div>
      {/* 写入内容 */}
      <div className="border-t border-inherit">
        <CodeContent label="Content" code={content} language={language} />
      </div>
    </>
  );
};

/**
 * Diff 展示组件
 */
const DiffView: React.FC<{ oldStr: string; newStr: string }> = ({ oldStr, newStr }) => {
  const diffResult = useMemo(() => Diff.diffLines(oldStr, newStr), [oldStr, newStr]);

  return (
    <div className="font-mono text-xs overflow-x-auto">
      {diffResult.map((part, index) => {
        const lines = part.value.split('\n');
        // 移除最后一个空行（split 产生的）
        if (lines[lines.length - 1] === '') {
          lines.pop();
        }

        return lines.map((line, lineIndex) => {
          if (part.added) {
            return (
              <div
                key={`${index}-${lineIndex}`}
                className="bg-green-500/20 text-green-700 dark:text-green-400 border-l-2 border-green-500 pl-2 pr-2 py-0.5"
              >
                <span className="select-none opacity-50 mr-2">+</span>
                {line || ' '}
              </div>
            );
          }
          if (part.removed) {
            return (
              <div
                key={`${index}-${lineIndex}`}
                className="bg-red-500/20 text-red-700 dark:text-red-400 border-l-2 border-red-500 pl-2 pr-2 py-0.5"
              >
                <span className="select-none opacity-50 mr-2">-</span>
                {line || ' '}
              </div>
            );
          }
          return (
            <div
              key={`${index}-${lineIndex}`}
              className="text-muted-foreground pl-2 pr-2 py-0.5 border-l-2 border-transparent"
            >
              <span className="select-none opacity-50 mr-2"> </span>
              {line || ' '}
            </div>
          );
        });
      })}
    </div>
  );
};

/**
 * 渲染 Edit 工具的输入内容
 */
const EditInputContent: React.FC<{ input: Record<string, unknown> }> = ({ input }) => {
  const filePath = String(input.file_path || '');
  const oldString = String(input.old_string || '');
  const newString = String(input.new_string || '');

  return (
    <>
      {/* 文件路径 */}
      <div className="px-3 py-2">
        <div className="text-xs font-medium text-muted-foreground mb-1">File Path</div>
        <div className="text-xs font-mono bg-black/5 dark:bg-white/10 text-foreground rounded px-2 py-1">
          {filePath}
        </div>
      </div>
      {/* Diff 展示 */}
      <div className="border-t border-inherit">
        <div className="px-3 py-2">
          <div className="text-xs font-medium text-muted-foreground mb-1">Changes</div>
          <div className="rounded-md border border-border overflow-hidden max-h-60 overflow-y-auto bg-black/5 dark:bg-white/5">
            <DiffView oldStr={oldString} newStr={newString} />
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * 默认输入内容展示（JSON 格式）
 */
const DefaultInputContent: React.FC<{ input: Record<string, unknown> }> = ({ input }) => (
  <div className="px-3 py-2">
    <div className="text-xs font-medium text-muted-foreground mb-1">Input</div>
    <div className="rounded-md border border-border overflow-hidden max-h-40 overflow-y-auto">
      <CodeBlockContent code={JSON.stringify(input, null, 2)} language="json" showLineNumbers={false} />
    </div>
  </div>
);

const ToolCallBlock: React.FC<ToolCallBlockProps> = ({ toolCall }) => {
  // Write 和 Edit 工具始终展开
  const isStandaloneTool = toolCall.name === 'Write' || toolCall.name === 'Edit';
  const [isExpanded, setIsExpanded] = useState(isStandaloneTool);

  const icon = TOOL_ICONS[toolCall.name] || <Settings className="w-4 h-4" />;
  const displayName = TOOL_DISPLAY_NAMES[toolCall.name] || toolCall.name;
  const inputSummary = getInputSummary(toolCall.name, toolCall.input);
  const status = toolCall.status || 'pending';

  // 状态图标和样式
  const statusIcon = {
    pending: <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />,
    running: <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />,
    completed: <Check className="w-3.5 h-3.5 text-green-500" />,
    error: <X className="w-3.5 h-3.5 text-red-500" />,
  }[status];

  // 根据工具类型渲染不同的输入内容
  const renderInputContent = () => {
    switch (toolCall.name) {
      case 'Write':
        return <WriteInputContent input={toolCall.input} />;
      case 'Edit':
        return <EditInputContent input={toolCall.input} />;
      default:
        return <DefaultInputContent input={toolCall.input} />;
    }
  };

  return (
    <div className={`rounded-lg border overflow-hidden ${toolCall.isError ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted'}`}>
      {/* 头部 - 可点击折叠 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground"
      >
        {/* 折叠图标 */}
        <ChevronRight className={`w-3 h-3 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />

        {/* 工具图标 */}
        <span className="shrink-0">{icon}</span>

        {/* 工具名称 */}
        <span className="font-medium text-sm shrink-0">{displayName}</span>

        {/* 输入摘要 */}
        {inputSummary && (
          <span className="text-xs opacity-70 truncate flex-1 font-mono">
            {inputSummary}
          </span>
        )}

        {/* 状态图标 */}
        <span className="shrink-0 ml-auto">{statusIcon}</span>
      </button>

      {/* 展开的详情 */}
      {isExpanded && (
        <div className="border-t border-inherit">
          {/* 输入参数 - 根据工具类型显示不同内容 */}
          {renderInputContent()}

          {/* 输出结果 */}
          {toolCall.output && (
            <div className="px-3 py-2 border-t border-inherit">
              <div className={`text-xs font-medium mb-1 ${toolCall.isError ? 'text-red-500' : 'text-muted-foreground'}`}>
                {toolCall.isError ? 'Error' : 'Output'}
              </div>
              <pre className={`text-xs font-mono rounded p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-60 overflow-y-auto ${
                toolCall.isError
                  ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                  : 'bg-black/5 dark:bg-white/10 text-foreground'
              }`}>
                {toolCall.output}
              </pre>
            </div>
          )}

          {/* 运行中状态提示 */}
          {(status === 'running' || status === 'pending') && !toolCall.output && (
            <div className="px-3 py-2 border-t border-inherit">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {status === 'running' ? 'Executing...' : 'Waiting...'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCallBlock;

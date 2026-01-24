import React, { useState } from 'react';
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

const ToolCallBlock: React.FC<ToolCallBlockProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          {/* 输入参数 */}
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-muted-foreground mb-1">Input</div>
            <pre className="text-xs font-mono bg-black/5 dark:bg-white/10 text-foreground rounded p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>

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

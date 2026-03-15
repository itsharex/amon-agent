import path from 'node:path';
import { resolveToCwd } from '../tools/utils/path-utils';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function toDisplayPath(filePath: string, cwd: string): string {
  const absolutePath = resolveToCwd(filePath, cwd);
  const relative = path.relative(cwd, absolutePath);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return relative || '.';
  }
  return absolutePath;
}

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

export function buildPermissionSummary(toolName: string, input: unknown, cwd: string): string {
  const args = isRecord(input) ? input : {};

  switch (toolName) {
    case 'Read':
    case 'Write':
    case 'Edit':
      return `${toolName} ${toDisplayPath(String(args.file_path ?? ''), cwd)}`.trim();

    case 'Glob': {
      const searchPath = typeof args.path === 'string' ? ` in ${toDisplayPath(args.path, cwd)}` : '';
      return `Glob ${String(args.pattern ?? '')}${searchPath}`.trim();
    }

    case 'Grep': {
      const searchPath = typeof args.path === 'string' ? ` in ${toDisplayPath(args.path, cwd)}` : '';
      return `Grep ${String(args.pattern ?? '')}${searchPath}`.trim();
    }

    case 'Bash':
      return `Bash ${truncate(String(args.command ?? ''))}`.trim();

    case 'WebFetch':
      return `WebFetch ${truncate(String(args.url ?? ''))}`.trim();

    case 'WebSearch':
      return `WebSearch ${truncate(String(args.query ?? ''))}`.trim();

    default:
      return toolName;
  }
}

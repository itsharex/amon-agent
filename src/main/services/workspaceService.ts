import { promises as fs } from 'fs';
import path from 'path';
import { FileInfo } from '../../shared/types';
import { createLogger } from '../store/logger';

const log = createLogger('WorkspaceService');

// 忽略的目录和文件
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  '.idea',
  '.vscode',
  '__pycache__',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'out',
  '.cache',
  'coverage',
  '.DS_Store',
  'Thumbs.db',
]);

const IGNORE_EXTENSIONS = new Set([
  '.lock',
  '.log',
]);

/**
 * 递归列出工作空间中的文件
 */
async function walkDirectory(
  dir: string,
  basePath: string,
  files: FileInfo[],
  limit: number,
  query?: string
): Promise<void> {
  if (files.length >= limit) return;

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (files.length >= limit) return;

      const name = entry.name;

      // 跳过隐藏文件（以 . 开头，除了一些特定配置文件）
      if (name.startsWith('.') && !name.startsWith('.env')) {
        continue;
      }

      // 跳过忽略的目录
      if (IGNORE_DIRS.has(name)) {
        continue;
      }

      const fullPath = path.join(dir, name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        // 递归进入子目录
        await walkDirectory(fullPath, basePath, files, limit, query);
      } else if (entry.isFile()) {
        const ext = path.extname(name).toLowerCase();

        // 跳过忽略的扩展名
        if (IGNORE_EXTENSIONS.has(ext)) {
          continue;
        }

        // 如果有查询字符串，进行模糊匹配
        if (query) {
          const lowerPath = relativePath.toLowerCase();
          const lowerQuery = query.toLowerCase();

          // 支持简单的模糊匹配：路径包含查询字符串的任意部分
          if (!lowerPath.includes(lowerQuery)) {
            continue;
          }
        }

        files.push({
          path: relativePath,
          name,
          extension: ext || undefined,
        });
      }
    }
  } catch (error) {
    // 忽略无法访问的目录
    log.debug('Cannot access directory', { dir, error: String(error) });
  }
}

/**
 * 列出工作空间中的文件
 * @param workspacePath 工作空间路径
 * @param query 可选的查询字符串，用于过滤文件
 * @param limit 返回的最大文件数量
 */
export async function listFiles(
  workspacePath: string,
  query?: string,
  limit = 50
): Promise<FileInfo[]> {
  try {
    // 检查工作空间是否存在
    const stat = await fs.stat(workspacePath);
    if (!stat.isDirectory()) {
      log.warn('Workspace path is not a directory', { workspacePath });
      return [];
    }

    const files: FileInfo[] = [];
    await walkDirectory(workspacePath, workspacePath, files, limit, query);

    // 按路径排序
    files.sort((a, b) => a.path.localeCompare(b.path));

    log.debug('Listed workspace files', {
      workspacePath,
      query,
      count: files.length,
    });

    return files;
  } catch (error) {
    log.error('Failed to list workspace files', {
      workspacePath,
      error: String(error),
    });
    return [];
  }
}

/**
 * 验证路径是否存在
 * @param workspacePath 工作空间路径
 * @param paths 要验证的相对路径列表
 * @returns 存在的路径列表
 */
export async function validatePaths(
  workspacePath: string,
  paths: string[]
): Promise<string[]> {
  const validPaths: string[] = [];

  for (const relativePath of paths) {
    try {
      const fullPath = path.join(workspacePath, relativePath);
      await fs.access(fullPath);
      validPaths.push(relativePath);
    } catch {
      // 路径不存在，跳过
    }
  }

  return validPaths;
}

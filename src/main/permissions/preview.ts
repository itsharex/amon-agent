import { readFile as fsReadFile } from 'node:fs/promises';
import {
  fuzzyFindText,
  generateDiffString,
  normalizeToLF,
  stripBom,
} from '../tools/utils/edit-diff';
import { resolveToCwd } from '../tools/utils/path-utils';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toBooleanValue(value: unknown): boolean {
  return value === true;
}

async function readNormalizedFile(filePath: string, cwd: string): Promise<string | null> {
  if (!filePath) {
    return null;
  }

  try {
    const absolutePath = resolveToCwd(filePath, cwd);
    const rawContent = await fsReadFile(absolutePath, 'utf-8');
    const { text } = stripBom(rawContent);
    return normalizeToLF(text);
  } catch {
    return null;
  }
}

async function buildWriteDiffPreview(args: Record<string, unknown>, cwd: string): Promise<string | undefined> {
  const filePath = toStringValue(args.file_path);
  const newContent = normalizeToLF(toStringValue(args.content));
  const oldContent = await readNormalizedFile(filePath, cwd);
  const diff = generateDiffString(oldContent ?? '', newContent).diff;
  return diff || undefined;
}

async function buildEditDiffPreview(args: Record<string, unknown>, cwd: string): Promise<string | undefined> {
  const filePath = toStringValue(args.file_path);
  const oldString = normalizeToLF(toStringValue(args.old_string));
  const newString = normalizeToLF(toStringValue(args.new_string));
  const replaceAll = toBooleanValue(args.replace_all);

  const currentContent = await readNormalizedFile(filePath, cwd);
  if (currentContent === null) {
    const fallbackDiff = generateDiffString(oldString, newString).diff;
    return fallbackDiff || undefined;
  }

  if (replaceAll) {
    if (!oldString) {
      return undefined;
    }

    const nextContent = currentContent.includes(oldString)
      ? currentContent.split(oldString).join(newString)
      : currentContent;
    const diff = generateDiffString(currentContent, nextContent).diff;
    return diff || undefined;
  }

  const matchResult = fuzzyFindText(currentContent, oldString);
  if (!matchResult.found) {
    const fallbackDiff = generateDiffString(oldString, newString).diff;
    return fallbackDiff || undefined;
  }

  const baseContent = matchResult.contentForReplacement;
  const nextContent =
    baseContent.slice(0, matchResult.index) +
    newString +
    baseContent.slice(matchResult.index + matchResult.matchLength);
  const diff = generateDiffString(baseContent, nextContent).diff;
  return diff || undefined;
}

export async function buildPermissionDiffPreview(
  toolName: string,
  input: unknown,
  cwd: string,
): Promise<string | undefined> {
  if (!isRecord(input)) {
    return undefined;
  }

  switch (toolName) {
    case 'Write':
      return buildWriteDiffPreview(input, cwd);
    case 'Edit':
      return buildEditDiffPreview(input, cwd);
    default:
      return undefined;
  }
}

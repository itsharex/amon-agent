import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { editTool } from '@/main/tools/edit-tool';
import { globTool } from '@/main/tools/glob-tool';
import { readTool } from '@/main/tools/read-tool';
import type { ToolContext } from '@/main/tools/types';
import { writeTool } from '@/main/tools/write-tool';

let tempDir: string;

function createContext(overrides: { cwd?: string; aborted?: boolean } = {}): ToolContext {
  const controller = new AbortController();
  if (overrides.aborted) {
    controller.abort();
  }

  return {
    cwd: overrides.cwd ?? tempDir,
    signal: controller.signal,
  };
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'amon-tools-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('writeTool', () => {
  it('creates parent directories and writes files', async () => {
    const result = await writeTool.execute(
      {
        file_path: 'nested/output.txt',
        content: 'hello tool tests',
      },
      createContext(),
    );

    const content = await readFile(join(tempDir, 'nested/output.txt'), 'utf-8');

    expect(result).toEqual({
      output: 'Successfully wrote 16 bytes to nested/output.txt',
      isError: false,
    });
    expect(content).toBe('hello tool tests');
  });

  it('returns an abort error before writing', async () => {
    const result = await writeTool.execute(
      {
        file_path: 'aborted.txt',
        content: 'should not exist',
      },
      createContext({ aborted: true }),
    );

    expect(result).toEqual({ output: 'Operation aborted', isError: true });
  });
});

describe('readTool', () => {
  it('reads a slice of a text file and advertises the next offset', async () => {
    await writeFile(join(tempDir, 'notes.txt'), 'line1\nline2\nline3\nline4', 'utf-8');

    const result = await readTool.execute(
      {
        file_path: 'notes.txt',
        offset: 2,
        limit: 2,
      },
      createContext(),
    );

    expect(result.isError).toBe(false);
    expect(result.output).toContain('line2\nline3');
    expect(result.output).toContain('[1 more lines in file. Use offset=4 to continue.]');
  });

  it('returns an error when the offset is past the end of the file', async () => {
    await writeFile(join(tempDir, 'short.txt'), 'line1\nline2', 'utf-8');

    const result = await readTool.execute(
      {
        file_path: 'short.txt',
        offset: 5,
      },
      createContext(),
    );

    expect(result).toEqual({
      output: 'Offset 5 is beyond end of file (2 lines total)',
      isError: true,
    });
  });

  it('summarizes image reads without dumping binary output', async () => {
    await writeFile(join(tempDir, 'image.png'), Buffer.from([0, 1, 2, 3]));

    const result = await readTool.execute(
      {
        file_path: 'image.png',
      },
      createContext(),
    );

    expect(result.isError).toBe(false);
    expect(result.output).toContain('Read image file [image/png], base64 length:');
  });

  it('returns a guidance message when the first line exceeds the byte limit', async () => {
    await writeFile(join(tempDir, 'huge.txt'), `${'a'.repeat(52_000)}\nsmall line`, 'utf-8');

    const result = await readTool.execute(
      {
        file_path: 'huge.txt',
      },
      createContext(),
    );

    expect(result.isError).toBe(false);
    expect(result.output).toContain('Line 1 is');
    expect(result.output).toContain('exceeds');
    expect(result.output).toContain("Use bash: sed -n '1p' huge.txt | head -c");
  });
});

describe('editTool', () => {
  it('replaces text and preserves CRLF line endings', async () => {
    const filePath = join(tempDir, 'crlf.txt');
    await writeFile(filePath, 'first\r\nsecond\r\n', 'utf-8');

    const result = await editTool.execute(
      {
        file_path: 'crlf.txt',
        old_string: 'second',
        new_string: 'updated',
        replace_all: false,
      },
      createContext(),
    );

    const updated = await readFile(filePath, 'utf-8');

    expect(result.isError).toBe(false);
    expect(result.output).toContain('Successfully replaced text in crlf.txt.');
    expect(updated).toBe('first\r\nupdated\r\n');
  });

  it('rejects ambiguous single replacements', async () => {
    await writeFile(join(tempDir, 'duplicate.txt'), 'hello\nhello\n', 'utf-8');

    const result = await editTool.execute(
      {
        file_path: 'duplicate.txt',
        old_string: 'hello',
        new_string: 'bye',
        replace_all: false,
      },
      createContext(),
    );

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Found 2 occurrences of the text');
    expect(result.output).toContain('must be unique');
  });

  it('replaces all occurrences when replace_all is enabled', async () => {
    const filePath = join(tempDir, 'all.txt');
    await writeFile(filePath, 'alpha\nbeta\nalpha\n', 'utf-8');

    const result = await editTool.execute(
      {
        file_path: 'all.txt',
        old_string: 'alpha',
        new_string: 'omega',
        replace_all: true,
      },
      createContext(),
    );

    const updated = await readFile(filePath, 'utf-8');

    expect(result.isError).toBe(false);
    expect(result.output).toContain('Successfully replaced all occurrences in all.txt.');
    expect(updated).toBe('omega\nbeta\nomega\n');
  });
});

describe('globTool', () => {
  it('finds matching files and ignores node_modules and .git', async () => {
    await mkdir(join(tempDir, 'src'), { recursive: true });
    await mkdir(join(tempDir, 'node_modules/pkg'), { recursive: true });
    await mkdir(join(tempDir, '.git/hooks'), { recursive: true });

    await writeFile(join(tempDir, 'src/index.ts'), 'export const ok = true;\n', 'utf-8');
    await writeFile(join(tempDir, 'node_modules/pkg/hidden.ts'), 'skip\n', 'utf-8');
    await writeFile(join(tempDir, '.git/hooks/hidden.ts'), 'skip\n', 'utf-8');

    const result = await globTool.execute(
      {
        pattern: '**/*.ts',
      },
      createContext(),
    );

    expect(result.isError).toBe(false);
    expect(result.output).toContain('src/index.ts');
    expect(result.output).not.toContain('node_modules/pkg/hidden.ts');
    expect(result.output).not.toContain('.git/hooks/hidden.ts');
  });

  it('returns an error for missing search paths', async () => {
    const result = await globTool.execute(
      {
        pattern: '**/*.ts',
        path: 'missing-dir',
      },
      createContext(),
    );

    expect(result.isError).toBe(true);
    expect(result.output).toContain(`Path not found: ${join(tempDir, 'missing-dir')}`);
  });
});

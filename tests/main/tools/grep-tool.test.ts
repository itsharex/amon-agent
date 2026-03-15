import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToolContext } from '@/main/tools/types';

const { spawnMock, spawnSyncMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
  spawnSyncMock: vi.fn(),
}));

vi.mock('child_process', () => ({
  spawn: spawnMock,
  spawnSync: spawnSyncMock,
}));

import { grepTool } from '@/main/tools/grep-tool';

type FakeChild = EventEmitter & {
  stdout: PassThrough;
  stderr: PassThrough;
  killed: boolean;
  pid: number;
  kill: () => boolean;
};

let tempDir: string;

function createContext(): ToolContext {
  return {
    cwd: tempDir,
    signal: new AbortController().signal,
  };
}

function createFakeChild(run: (child: FakeChild) => void): FakeChild {
  const child = new EventEmitter() as FakeChild;
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.killed = false;
  child.pid = 123;
  child.kill = vi.fn(() => {
    child.killed = true;
    setImmediate(() => child.emit('close', null));
    return true;
  });

  setImmediate(() => run(child));
  return child;
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'amon-grep-'));
  spawnMock.mockReset();
  spawnSyncMock.mockReset();
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('grepTool', () => {
  it('returns an error when ripgrep is unavailable', async () => {
    spawnSyncMock.mockReturnValue({ status: 1, stdout: '' });

    const result = await grepTool.execute({ pattern: 'needle' }, createContext());

    expect(result).toEqual({
      output: 'ripgrep (rg) is not available. Please install ripgrep to use the grep tool.',
      isError: true,
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('formats matches with relative paths and honors include globs', async () => {
    const filePath = join(tempDir, 'src/app.ts');
    await mkdir(join(tempDir, 'src'), { recursive: true });
    await writeFile(filePath, 'alpha\nneedle here\nomega\n', 'utf-8');

    spawnSyncMock.mockReturnValue({ status: 0, stdout: '/usr/bin/rg\n' });
    spawnMock.mockImplementation((_command: string, args: string[]) =>
      createFakeChild((child) => {
        expect(args).toEqual(expect.arrayContaining([
          '--json',
          '--line-number',
          '--color=never',
          '--hidden',
          '--glob',
          '*.ts',
          'needle',
          tempDir,
        ]));

        child.stdout.write(JSON.stringify({
          type: 'match',
          data: {
            path: { text: filePath },
            line_number: 2,
          },
        }) + '\n');
        child.stdout.end();
        setImmediate(() => child.emit('close', 0));
      }) as never,
    );

    const result = await grepTool.execute(
      {
        pattern: 'needle',
        include: '*.ts',
      },
      createContext(),
    );

    expect(result.isError).toBe(false);
    expect(result.output).toContain('src/app.ts:2: needle here');
  });

  it('truncates long lines and appends a notice', async () => {
    const longLine = `needle ${'x'.repeat(600)}`;
    const filePath = join(tempDir, 'long.txt');
    await writeFile(filePath, `prefix\n${longLine}\nsuffix\n`, 'utf-8');

    spawnSyncMock.mockReturnValue({ status: 0, stdout: '/usr/bin/rg\n' });
    spawnMock.mockImplementation(() =>
      createFakeChild((child) => {
        child.stdout.write(JSON.stringify({
          type: 'match',
          data: {
            path: { text: filePath },
            line_number: 2,
          },
        }) + '\n');
        child.stdout.end();
        setImmediate(() => child.emit('close', 0));
      }) as never,
    );

    const result = await grepTool.execute({ pattern: 'needle' }, createContext());

    expect(result.isError).toBe(false);
    expect(result.output).toContain('long.txt:2: needle');
    expect(result.output).toContain('... [truncated]');
    expect(result.output).toContain('Some lines truncated to 500 chars.');
  });
});

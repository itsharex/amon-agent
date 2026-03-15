import { EventEmitter } from 'node:events';
import { rm } from 'node:fs/promises';
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToolContext } from '@/main/tools/types';

const { spawnMock, buildEnhancedPathMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
  buildEnhancedPathMock: vi.fn(() => '/mocked/bin'),
}));

vi.mock('child_process', () => ({
  spawn: spawnMock,
}));

vi.mock('@/main/runtime/bundledPaths', () => ({
  buildEnhancedPath: buildEnhancedPathMock,
}));

import { bashTool } from '@/main/tools/bash-tool';

type FakeChild = EventEmitter & {
  stdout: PassThrough;
  stderr: PassThrough;
  pid: number;
};

function createContext(
  signal: AbortSignal = new AbortController().signal,
  cwd: string = process.cwd(),
): ToolContext {
  return { cwd, signal };
}

function createFakeChild(run: (child: FakeChild) => void): FakeChild {
  const child = new EventEmitter() as FakeChild;
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.pid = 4321;

  setImmediate(() => run(child));
  return child;
}

let cleanupPaths: string[] = [];

beforeEach(() => {
  spawnMock.mockReset();
  buildEnhancedPathMock.mockClear();
  cleanupPaths = [];
});

afterEach(async () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  await Promise.all(cleanupPaths.map((filePath) => rm(filePath, { force: true })));
});

describe('bashTool', () => {
  it('returns an error when the working directory does not exist', async () => {
    const result = await bashTool.execute(
      { command: 'pwd' },
      createContext(new AbortController().signal, '/tmp/amon-missing-cwd'),
    );

    expect(result.isError).toBe(true);
    expect(result.output).toContain('Working directory does not exist: /tmp/amon-missing-cwd');
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('passes the enhanced PATH to spawned processes', async () => {
    spawnMock.mockImplementation((_shell: string, _args: string[], options: { env: NodeJS.ProcessEnv }) =>
      createFakeChild((child) => {
        expect(options.env.PATH).toBe('/mocked/bin');
        child.stdout.write('ok');
        child.stdout.end();
        child.stderr.end();
        child.emit('close', 0);
      }) as never,
    );

    const result = await bashTool.execute({ command: 'echo ok' }, createContext());

    expect(buildEnhancedPathMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ output: 'ok', isError: false });
  });

  it('includes exit codes for failed commands', async () => {
    spawnMock.mockImplementation(() =>
      createFakeChild((child) => {
        child.stdout.write('boom');
        child.stdout.end();
        child.stderr.end();
        child.emit('close', 2);
      }) as never,
    );

    const result = await bashTool.execute({ command: 'exit 2' }, createContext());

    expect(result.isError).toBe(true);
    expect(result.output).toContain('boom');
    expect(result.output).toContain('Command exited with code 2');
  });

  it('returns a timeout error when the command exceeds the configured timeout', async () => {
    vi.useFakeTimers();

    let activeChild: FakeChild | null = null;
    spawnMock.mockImplementation(() => {
      activeChild = createFakeChild(() => {
        // Keep process open until killProcessTree forces close.
      });
      return activeChild as never;
    });

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(((pid: number) => {
      expect(Math.abs(pid)).toBe(4321);
      activeChild?.emit('close', null);
      return true;
    }) as typeof process.kill);

    const resultPromise = bashTool.execute(
      { command: 'sleep 10', timeout: 1 },
      createContext(),
    );

    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;

    expect(killSpy).toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Command timed out after 1 seconds');
  });

  it('returns an abort error when the signal is cancelled', async () => {
    const controller = new AbortController();

    let activeChild: FakeChild | null = null;
    spawnMock.mockImplementation(() => {
      activeChild = createFakeChild(() => {
        // Wait for abort to close the process.
      });
      return activeChild as never;
    });

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(((pid: number) => {
      expect(Math.abs(pid)).toBe(4321);
      activeChild?.emit('close', null);
      return true;
    }) as typeof process.kill);

    const resultPromise = bashTool.execute(
      { command: 'long-running' },
      createContext(controller.signal),
    );
    controller.abort();
    const result = await resultPromise;

    expect(killSpy).toHaveBeenCalled();
    expect(result).toEqual({ output: 'Command aborted', isError: true });
  });

  it('truncates oversized output and points to the saved temp file', async () => {
    const largeOutput = Array.from({ length: 2500 }, (_, index) => `line-${index}-${'x'.repeat(30)}`).join('\n');

    spawnMock.mockImplementation(() =>
      createFakeChild((child) => {
        child.stdout.write(largeOutput);
        child.stdout.end();
        child.stderr.end();
        child.emit('close', 0);
      }) as never,
    );

    const result = await bashTool.execute({ command: 'generate-large-output' }, createContext());

    expect(result.isError).toBe(false);
    expect(result.output).toContain('Full output: ');
    expect(result.output).toContain('[Showing lines ');

    const match = result.output.match(/Full output: ([^\]]+)/);
    expect(match?.[1]).toBeTruthy();
    if (match?.[1]) {
      cleanupPaths.push(match[1]);
    }
  });
});

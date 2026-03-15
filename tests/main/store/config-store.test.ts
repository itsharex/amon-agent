import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@shared/schemas';

vi.mock('@/main/store/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    withSession: vi.fn(),
  }),
}));

import { ConfigStore } from '@/main/store/config-store';

let tempDir: string;
let settingsPath: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'amon-config-'));
  settingsPath = join(tempDir, 'settings.json');
});

afterEach(async () => {
  vi.restoreAllMocks();
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  await rm(tempDir, { recursive: true, force: true });
});

describe('ConfigStore', () => {
  it('returns defaults when the settings file is missing or invalid', async () => {
    const missingStore = new ConfigStore(settingsPath);
    expect(await missingStore.getSettings()).toEqual(DEFAULT_SETTINGS);

    await writeFile(settingsPath, '{invalid', 'utf-8');

    const invalidStore = new ConfigStore(settingsPath);
    expect(await invalidStore.getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('caches settings after the first successful read', async () => {
    await writeFile(settingsPath, JSON.stringify({ theme: 'dark' }), 'utf-8');
    const store = new ConfigStore(settingsPath);

    const first = await store.getSettings();
    await writeFile(settingsPath, JSON.stringify({ theme: 'light' }), 'utf-8');
    const second = await store.getSettings();

    expect(first.theme).toBe('dark');
    expect(second.theme).toBe('dark');
  });

  it('deep merges updates and writes the validated result atomically', async () => {
    await writeFile(
      settingsPath,
      JSON.stringify({
        theme: 'dark',
        agent: {
          providerConfigs: [{ id: 'openai', name: 'OpenAI', apiKey: 'settings-key' }],
          maxTurns: 50,
        },
        skills: {
          extraDirs: ['.claude', '.custom'],
          disabledSkills: ['legacy'],
          initialized: false,
        },
      }),
      'utf-8',
    );

    const store = new ConfigStore(settingsPath);
    const updated = await store.updateSettings({
      agent: { maxTurns: 99 },
      skills: { initialized: true },
    });

    expect(updated.theme).toBe('dark');
    expect(updated.agent.maxTurns).toBe(99);
    expect(updated.agent.providerConfigs).toEqual([
      expect.objectContaining({
        id: 'openai',
        name: 'OpenAI',
        apiKey: 'settings-key',
      }),
    ]);
    expect(updated.skills).toEqual({
      extraDirs: ['.claude', '.custom'],
      disabledSkills: ['legacy'],
      initialized: true,
    });

    const saved = JSON.parse(await readFile(settingsPath, 'utf-8'));
    expect(saved.agent.maxTurns).toBe(99);
    expect(saved.skills.initialized).toBe(true);
    expect(saved.agent.providerConfigs).toHaveLength(1);
    expect(await readFile(settingsPath, 'utf-8')).not.toContain('.tmp');
  });

  it('prefers provider config api keys and falls back to environment variables', async () => {
    await writeFile(
      settingsPath,
      JSON.stringify({
        agent: {
          providerConfigs: [{ id: 'openai', name: 'OpenAI', apiKey: 'settings-key' }],
        },
      }),
      'utf-8',
    );

    const store = new ConfigStore(settingsPath);
    await store.getSettings();

    process.env.OPENAI_API_KEY = 'env-openai';
    process.env.ANTHROPIC_API_KEY = 'env-anthropic';

    expect(store.getApiKey('openai')).toBe('settings-key');
    expect(store.getApiKey('anthropic')).toBe('env-anthropic');
    expect(store.getApiKey('unknown')).toBeUndefined();
  });
});

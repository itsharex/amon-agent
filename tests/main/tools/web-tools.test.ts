import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToolContext } from '@/main/tools/types';

const { ExaMock, exaSearchMock } = vi.hoisted(() => {
  const exaSearchMock = vi.fn();
  const ExaMock = vi.fn(function MockExa() {
    return {
      search: exaSearchMock,
    };
  });

  return { ExaMock, exaSearchMock };
});

vi.mock('exa-js', () => ({
  default: ExaMock,
}));

import { webFetchTool } from '@/main/tools/web-fetch-tool';
import { createWebSearchTool } from '@/main/tools/web-search-tool';

function createContext(overrides: { aborted?: boolean } = {}): ToolContext {
  const controller = new AbortController();
  if (overrides.aborted) {
    controller.abort();
  }

  return {
    cwd: process.cwd(),
    signal: controller.signal,
  };
}

beforeEach(() => {
  exaSearchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('webFetchTool', () => {
  it('rejects invalid URLs before making a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await webFetchTool.execute(
      {
        url: 'ftp://example.com/file.txt',
        format: 'text',
      },
      createContext(),
    );

    expect(result).toEqual({
      output: 'URL must start with http:// or https://',
      isError: true,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('extracts plain text from HTML responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        '<html><body><h1>Title</h1><script>ignored()</script><p>Hello world</p></body></html>',
        {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=utf-8',
          },
        },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await webFetchTool.execute(
      {
        url: 'https://example.com/page',
        format: 'text',
      },
      createContext(),
    );

    expect(result.isError).toBe(false);
    expect(result.output).toContain('https://example.com/page');
    expect(result.output).toContain('Title Hello world');
    expect(result.output).not.toContain('ignored()');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/page',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining('text/plain'),
        }),
      }),
    );
  });

  it('retries cloudflare challenge responses with an honest user agent', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response('', {
          status: 403,
          headers: {
            'cf-mitigated': 'challenge',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response('plain text result', {
          status: 200,
          headers: {
            'content-type': 'text/plain',
          },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await webFetchTool.execute(
      {
        url: 'https://example.com/protected',
        format: 'text',
      },
      createContext(),
    );

    expect(result.isError).toBe(false);
    expect(result.output).toContain('plain text result');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(expect.objectContaining({
      headers: expect.objectContaining({
        'User-Agent': 'amon-agent',
      }),
    }));
  });
});

describe('createWebSearchTool', () => {
  it('returns an error when the Exa API key is missing', async () => {
    const tool = createWebSearchTool({
      getSettings: vi.fn().mockResolvedValue({ agent: {} }),
    });

    const result = await tool.execute(
      {
        query: 'amon agent',
        type: 'auto',
        numResults: 3,
      },
      createContext(),
    );

    expect(result).toEqual({
      output: 'Exa API Key not configured. Please add it in Settings > Agent.',
      isError: true,
    });
  });

  it('formats Exa search results', async () => {
    exaSearchMock.mockResolvedValue({
      results: [
        { title: 'Amon Agent', url: 'https://example.com/amon' },
        { title: '', url: 'https://example.com/empty-title' },
      ],
    });

    const tool = createWebSearchTool({
      getSettings: vi.fn().mockResolvedValue({ agent: { exaApiKey: 'exa-key' } }),
    });

    const result = await tool.execute(
      {
        query: 'amon agent',
        type: 'keyword',
        numResults: 2,
      },
      createContext(),
    );

    expect(ExaMock).toHaveBeenCalledWith('exa-key');
    expect(exaSearchMock).toHaveBeenCalledWith('amon agent', {
      type: 'keyword',
      numResults: 2,
    });
    expect(result.isError).toBe(false);
    expect(result.output).toContain('1. Amon Agent');
    expect(result.output).toContain('2. (no title)');
  });
});

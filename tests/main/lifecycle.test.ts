import { describe, expect, it, vi } from 'vitest';
import { handleBeforeQuit, handleWindowAllClosed, shouldHideMainWindowOnClose } from '@/main/lifecycle';

describe('shouldHideMainWindowOnClose', () => {
  it('hides the main window on darwin when the app is not quitting', () => {
    expect(
      shouldHideMainWindowOnClose({
        platform: 'darwin',
        isQuitting: false,
      }),
    ).toBe(true);
  });

  it('allows the main window to close on darwin during app quit', () => {
    expect(
      shouldHideMainWindowOnClose({
        platform: 'darwin',
        isQuitting: true,
      }),
    ).toBe(false);
  });

  it('allows the main window to close on non-darwin platforms', () => {
    expect(
      shouldHideMainWindowOnClose({
        platform: 'linux',
        isQuitting: false,
      }),
    ).toBe(false);
  });
});

describe('handleWindowAllClosed', () => {
  it('keeps IPC handlers intact on darwin when only windows are closed', () => {
    const quit = vi.fn();
    const removeIpcHandlers = vi.fn();

    handleWindowAllClosed({
      platform: 'darwin',
      quit,
      removeIpcHandlers,
    });

    expect(removeIpcHandlers).not.toHaveBeenCalled();
    expect(quit).not.toHaveBeenCalled();
  });

  it('cleans up IPC handlers and quits on non-darwin platforms', () => {
    const quit = vi.fn();
    const removeIpcHandlers = vi.fn();

    handleWindowAllClosed({
      platform: 'linux',
      quit,
      removeIpcHandlers,
    });

    expect(removeIpcHandlers).toHaveBeenCalledTimes(1);
    expect(quit).toHaveBeenCalledTimes(1);
  });
});

describe('handleBeforeQuit', () => {
  it('always removes IPC handlers during real app shutdown', () => {
    const removeIpcHandlers = vi.fn();

    handleBeforeQuit(removeIpcHandlers);

    expect(removeIpcHandlers).toHaveBeenCalledTimes(1);
  });
});

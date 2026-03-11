export interface WindowAllClosedDependencies {
  platform: NodeJS.Platform;
  quit: () => void;
  removeIpcHandlers: () => void;
}

export interface MainWindowCloseDependencies {
  platform: NodeJS.Platform;
  isQuitting: boolean;
}

export function shouldHideMainWindowOnClose({
  platform,
  isQuitting,
}: MainWindowCloseDependencies): boolean {
  return platform === 'darwin' && !isQuitting;
}

export function handleWindowAllClosed({
  platform,
  quit,
  removeIpcHandlers,
}: WindowAllClosedDependencies): void {
  if (platform !== 'darwin') {
    removeIpcHandlers();
    quit();
  }
}

export function handleBeforeQuit(removeIpcHandlers: () => void): void {
  removeIpcHandlers();
}

import type { AssistantMessage, Usage } from '../types';

export function getUsageTotalInputTokens(usage: Usage): number {
  return usage.input + usage.cacheRead + usage.cacheWrite;
}

export function getUsageContextTokens(usage: Usage): number {
  if (usage.totalTokens > 0) {
    return usage.totalTokens;
  }

  return getUsageTotalInputTokens(usage) + usage.output;
}

export function hasUsageData(usage: Usage | null | undefined): usage is Usage {
  return Boolean(
    usage
      && (
        usage.input > 0
        || usage.output > 0
        || usage.cacheRead > 0
        || usage.cacheWrite > 0
        || usage.totalTokens > 0
      ),
  );
}

export function getAssistantTurnUsage(messages: AssistantMessage[]): Usage | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].usage) {
      return messages[i].usage;
    }
  }

  return null;
}

export function getLatestAssistantUsageWithData(messages: AssistantMessage[]): Usage | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (hasUsageData(messages[i].usage)) {
      return messages[i].usage;
    }
  }

  return null;
}

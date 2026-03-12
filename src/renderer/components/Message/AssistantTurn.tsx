import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AssistantMessage as AssistantMessageType } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { useSessionStore } from '../../store/sessionStore';
import { getAssistantTurnUsage } from '../../lib/usage';
import AssistantMessage from './AssistantMessage';
import TokenUsage from './TokenUsage';

export interface AssistantTurnProps {
  messages: AssistantMessageType[];
  isLastTurn: boolean;
}

function formatTimestamp(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Renders all assistant messages within a single agent turn as one visual block,
 * with a single combined footer (token usage + timestamp).
 */
const AssistantTurn: React.FC<AssistantTurnProps> = ({ messages, isLastTurn }) => {
  const { i18n } = useTranslation();
  const { currentSessionId } = useSessionStore();
  const isStreaming = useChatStore((state) => state.isSessionLoading(currentSessionId));
  const isActivelyStreaming = isLastTurn && isStreaming;

  const turnUsage = useMemo(() => getAssistantTurnUsage(messages), [messages]);

  const lastMessage = messages[messages.length - 1];
  const showTokenUsage = !isActivelyStreaming && turnUsage !== null;
  const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';

  return (
    <div className="flex w-full min-w-0 flex-col items-start">
      <div className="w-full min-w-0 space-y-2">
        {messages.map((msg, i) => {
          const isLastInTurn = i === messages.length - 1;
          // Only the last message of the last (active) turn is non-historical
          const defaultCollapsed = !(isLastTurn && isLastInTurn && isActivelyStreaming);

          return (
            <AssistantMessage
              key={`assistant-${msg.timestamp}-${i}`}
              message={msg}
              defaultCollapsed={defaultCollapsed}
              sessionId={currentSessionId}
              isStreaming={isLastInTurn && isActivelyStreaming}
            />
          );
        })}

        {/* Single footer for the entire turn */}
        <div className="mt-1 flex w-full min-w-0 flex-col gap-1 items-start pl-1">
          {showTokenUsage && turnUsage && <TokenUsage usage={turnUsage} />}
          <div className="text-[11px] text-muted-foreground">
            {formatTimestamp(lastMessage.timestamp, locale)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantTurn;

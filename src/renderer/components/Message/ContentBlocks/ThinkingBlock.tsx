import React, { useState } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { cjk } from '@streamdown/cjk';

export interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
  /** Whether the block should be collapsed by default (for completed or historical thinking blocks) */
  defaultCollapsed?: boolean;
}

const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content, isStreaming, defaultCollapsed = false }) => {
  const { t } = useTranslation('message');
  // Allow manual collapse/expand even during streaming
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);

  if (!content) return null;

  const previewLength = 100;
  const previewText = content.slice(0, previewLength);

  return (
    <div className="mb-3 w-full min-w-0 max-w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex min-w-0 max-w-full items-center gap-2 text-sm text-thinking-foreground transition-colors hover:text-thinking"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        <span className="flex min-w-0 items-center gap-1.5">
          <Lightbulb className="w-4 h-4" />
          {t('thinking')}
          {isStreaming && (
            <span className="inline-flex">
              <span className="animate-pulse">...</span>
            </span>
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 pl-6 border-l-2 border-thinking-border">
          <div className="text-sm text-muted-foreground markdown-content thinking-content min-w-0 max-w-full break-words [overflow-wrap:anywhere]">
            <Streamdown plugins={{ code, math, cjk }}>{content}</Streamdown>
          </div>
        </div>
      )}

      {!isExpanded && content && (
        <div className="mt-1 max-w-full truncate pl-6 text-xs text-muted-foreground">
          {previewText}...
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;

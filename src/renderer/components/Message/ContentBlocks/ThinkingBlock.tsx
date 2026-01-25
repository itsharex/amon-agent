import React, { useState } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { cjk } from '@streamdown/cjk';

export interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
  /** Whether the block should be collapsed by default (for historical messages) */
  defaultCollapsed?: boolean;
}

const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content, isStreaming, defaultCollapsed = false }) => {
  // When streaming, always expand; otherwise use defaultCollapsed setting
  const [isExpanded, setIsExpanded] = useState(isStreaming ? true : !defaultCollapsed);

  if (!content) return null;

  const previewLength = 100;
  const previewText = content.slice(0, previewLength);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-thinking-foreground hover:text-thinking transition-colors"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        <span className="flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4" />
          Thinking
          {isStreaming && (
            <span className="inline-flex">
              <span className="animate-pulse">...</span>
            </span>
          )}
        </span>
      </button>

      {(isExpanded || isStreaming) && (
        <div className="mt-2 pl-6 border-l-2 border-thinking-border">
          <div className="text-sm text-muted-foreground markdown-content thinking-content">
            <Streamdown plugins={{ code, math, cjk }}>{content}</Streamdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse ml-0.5" />
            )}
          </div>
        </div>
      )}

      {!isExpanded && !isStreaming && content && (
        <div className="mt-1 pl-6 text-xs text-muted-foreground truncate max-w-md">
          {previewText}...
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;

import React, { useState } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';

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
  const shouldTruncate = content.length > previewLength && !isStreaming;
  const displayText = isExpanded || isStreaming ? content : content.slice(0, previewLength);

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
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {displayText}
            {shouldTruncate && !isExpanded && '...'}
          </div>
        </div>
      )}

      {!isExpanded && !isStreaming && content && (
        <div className="mt-1 pl-6 text-xs text-muted-foreground truncate max-w-md">
          {content.slice(0, 60)}...
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;

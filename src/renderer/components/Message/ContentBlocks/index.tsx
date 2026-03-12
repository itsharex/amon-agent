import React from 'react';
import type { TextContent, ThinkingContent, ToolCall } from '../../../types';
import TextBlock from './TextBlock';
import ThinkingBlock from './ThinkingBlock';
import ToolCallBlock from './ToolCallBlock';

type ContentItem = TextContent | ThinkingContent | ToolCall;

export interface ContentBlockRendererProps {
  block: ContentItem;
  isStreaming?: boolean;
  isLastBlock?: boolean;
  defaultCollapsed?: boolean;
  sessionId: string | null;
}

/**
 * 内容块渲染器 - 根据类型分发到对应组件
 */
const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
  block,
  isStreaming,
  isLastBlock,
  defaultCollapsed = false,
  sessionId,
}) => {
  const isActiveBlock = Boolean(isStreaming && isLastBlock);

  switch (block.type) {
    case 'text':
      return (
        <TextBlock
          content={block.text}
          isStreaming={isStreaming && isLastBlock}
        />
      );

    case 'thinking':
      return (
        <ThinkingBlock
          key={isActiveBlock ? 'thinking-active' : 'thinking-complete'}
          content={block.thinking}
          isStreaming={isActiveBlock}
          defaultCollapsed={defaultCollapsed || !isActiveBlock}
        />
      );

    case 'toolCall':
      return (
        <ToolCallBlock
          key={`${block.id}-${Object.keys(block.arguments ?? {}).length > 0 ? 'ready' : 'pending'}`}
          toolCall={block}
          sessionId={sessionId}
        />
      );

    default:
      return null;
  }
};

export default ContentBlockRenderer;

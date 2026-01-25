import React, { useMemo } from 'react';
import { Message, MessageContentBlock } from '../../types';
import ContentBlockRenderer from './ContentBlocks';
import ToolGroup from './ToolGroup';
import TodoList, { TodoItem } from './TodoList';
import { Shimmer } from '../ai-elements/shimmer';

export interface AssistantMessageProps {
  message: Message;
  /** Whether tool groups and thinking blocks should be collapsed by default */
  defaultCollapsed?: boolean;
}

/**
 * 分组后的内容块类型
 */
type GroupedBlock =
  | { type: 'single'; block: MessageContentBlock; index: number }
  | { type: 'tool_group'; blocks: MessageContentBlock[] };

/**
 * 将内容块分组：连续的 tool_call 归为一组（Write/Edit 除外）
 */
function groupContentBlocks(blocks: MessageContentBlock[]): GroupedBlock[] {
  const groups: GroupedBlock[] = [];
  let currentToolGroup: MessageContentBlock[] = [];

  // 需要单独展示的工具
  const standaloneTools = ['TodoWrite', 'Write', 'Edit'];

  blocks.forEach((block, index) => {
    // 跳过需要单独展示的工具
    if (block.type === 'tool_call' && standaloneTools.includes(block.toolCall.name)) {
      // 先处理累积的工具组
      if (currentToolGroup.length > 0) {
        groups.push({ type: 'tool_group', blocks: [...currentToolGroup] });
        currentToolGroup = [];
      }
      // Write/Edit 作为单独 block，TodoWrite 完全跳过（由 extractLatestTodos 处理）
      if (block.toolCall.name !== 'TodoWrite') {
        groups.push({ type: 'single', block, index });
      }
      return;
    }

    if (block.type === 'tool_call') {
      currentToolGroup.push(block);
    } else {
      // 如果有累积的工具调用组，先添加
      if (currentToolGroup.length > 0) {
        groups.push({ type: 'tool_group', blocks: [...currentToolGroup] });
        currentToolGroup = [];
      }
      groups.push({ type: 'single', block, index });
    }
  });

  // 处理末尾的工具调用组
  if (currentToolGroup.length > 0) {
    groups.push({ type: 'tool_group', blocks: currentToolGroup });
  }

  return groups;
}

/**
 * 提取最新的 TodoWrite 调用中的 todos
 */
function extractLatestTodos(blocks: MessageContentBlock[]): TodoItem[] | null {
  // 从后往前找最新的 TodoWrite
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (block.type === 'tool_call' && block.toolCall.name === 'TodoWrite') {
      const input = block.toolCall.input as { todos?: TodoItem[] };
      return input.todos || null;
    }
  }
  return null;
}

/**
 * 助手消息组件
 */
const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, defaultCollapsed = false }) => {
  const { contentBlocks, isStreaming } = message;

  // 分组内容块
  const groupedBlocks = useMemo(() => {
    if (!contentBlocks) return [];
    return groupContentBlocks(contentBlocks);
  }, [contentBlocks]);

  // 提取 todos
  const latestTodos = useMemo(() => {
    if (!contentBlocks) return null;
    return extractLatestTodos(contentBlocks);
  }, [contentBlocks]);

  const hasContent = contentBlocks && contentBlocks.length > 0;
  const totalBlocks = contentBlocks?.length || 0;

  return (
    <div className="text-[15px] leading-relaxed w-full text-foreground">
      {hasContent ? (
        groupedBlocks.map((group, groupIndex) => {
          if (group.type === 'tool_group') {
            return (
              <ToolGroup
                key={`tool-group-${groupIndex}`}
                blocks={group.blocks}
                isStreaming={isStreaming}
                defaultCollapsed={defaultCollapsed}
              />
            );
          }

          return (
            <ContentBlockRenderer
              key={`block-${group.index}`}
              block={group.block}
              isStreaming={isStreaming}
              isLastBlock={group.index === totalBlocks - 1}
              defaultCollapsed={defaultCollapsed}
            />
          );
        })
      ) : isStreaming ? (
        // 正在加载，没有内容时显示加载动画
        <LoadingIndicator />
      ) : null}

      {/* TODO 列表 - 恒定显示在底部 */}
      {latestTodos && latestTodos.length > 0 && (
        <div className="mt-3">
          <TodoList todos={latestTodos} />
        </div>
      )}

      {/* 统一的流式指示器 - 显示在消息最底部，只有当有内容时才显示 */}
      {isStreaming && hasContent && (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary/80 animate-pulse">
            工作中...
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * 加载动画组件 - 思考中状态
 */
const LoadingIndicator: React.FC = () => (
  <div className="flex items-center gap-2">
    <span className="inline-block w-2 h-2 bg-thinking rounded-full animate-pulse" />
    <span className="text-sm font-medium text-thinking-foreground animate-pulse">
      思考中...
    </span>
  </div>
);

export default AssistantMessage;

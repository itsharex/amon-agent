import React, { memo } from 'react';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import { cjk } from '@streamdown/cjk';

export interface TextBlockProps {
  content: string;
  isStreaming?: boolean;
}

const TextBlock: React.FC<TextBlockProps> = memo(({ content, isStreaming }) => {
  return (
    <div className="markdown-content">
      <Streamdown plugins={{ code, mermaid, math, cjk }}>{content}</Streamdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse ml-0.5" />
      )}
    </div>
  );
});

TextBlock.displayName = 'TextBlock';

export default TextBlock;

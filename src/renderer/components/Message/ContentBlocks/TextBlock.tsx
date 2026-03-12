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

const TextBlock: React.FC<TextBlockProps> = memo(({ content }) => {
  return (
    <div className="markdown-content min-w-0 max-w-full break-words [overflow-wrap:anywhere]">
      <Streamdown plugins={{ code, mermaid, math, cjk }} linkSafety={{ enabled: false }}>{content}</Streamdown>
    </div>
  );
});

TextBlock.displayName = 'TextBlock';

export default TextBlock;

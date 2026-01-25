import React, { useState } from 'react';
import { Message } from '../../types';

export interface UserMessageProps {
  message: Message;
}

/**
 * 用户消息组件
 */
const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <div className="px-4 py-3 bg-user-bubble text-user-bubble-foreground rounded-2xl rounded-br-md text-[15px] leading-relaxed overflow-hidden">
      {/* 图片预览 */}
      {message.images && message.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {message.images.map(img => (
            <img
              key={img.id}
              src={`data:${img.mimeType};base64,${img.base64Data}`}
              alt={img.filename}
              onClick={() => setExpandedImage(`data:${img.mimeType};base64,${img.base64Data}`)}
              className="max-w-48 max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
            />
          ))}
        </div>
      )}

      {/* 文本内容 */}
      {message.content && (
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      )}

      {/* 图片放大查看模态框 */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="放大查看"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default UserMessage;

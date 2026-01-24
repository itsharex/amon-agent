import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

const SystemPromptEditor: React.FC = () => {
  const { formData, setAgentFormData } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(formData.agent.systemPrompt);

  const handleSave = () => {
    setAgentFormData({ systemPrompt: value });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(formData.agent.systemPrompt);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setValue(formData.agent.systemPrompt);
    setIsEditing(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          系统提示词
        </label>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-xs text-primary hover:text-primary/80"
          >
            编辑
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={6}
            className="
              w-full px-3 py-2
              bg-muted
              border border-border
              rounded-lg text-sm
              text-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              resize-none
            "
            placeholder="输入系统提示词..."
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
            {formData.agent.systemPrompt || '未设置'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemPromptEditor;

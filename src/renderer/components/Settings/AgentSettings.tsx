import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import SystemPromptEditor from './SystemPromptEditor';
import type { PermissionMode } from '../../types';
import { Shield, FileEdit, XCircle, ShieldOff, Terminal } from 'lucide-react';

const PERMISSION_MODES: { value: PermissionMode; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'default', label: '默认', description: '工具调用需要审批', icon: <Shield className="w-6 h-6" /> },
  { value: 'acceptEdits', label: '自动编辑', description: '自动批准文件编辑', icon: <FileEdit className="w-6 h-6" /> },
  { value: 'dontAsk', label: '不询问', description: '拒绝未允许的工具', icon: <XCircle className="w-6 h-6" /> },
  { value: 'bypassPermissions', label: '绕过权限', description: '绕过所有权限检查', icon: <ShieldOff className="w-6 h-6" /> },
];

interface AgentSettingsProps {
  onNavigateToProvider?: () => void;
}

const AgentSettings: React.FC<AgentSettingsProps> = ({ onNavigateToProvider }) => {
  const { formData, setAgentFormData, clearSaveError } = useSettingsStore();

  // 获取当前激活的 Provider
  const providers = formData.agent.providers || [];
  const activeProvider = providers.find(p => p.id === formData.agent.activeProviderId);

  return (
    <div className="space-y-6">
      {/* 当前供应商 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>当前供应商：</span>
          {activeProvider ? (
            <span className="text-primary font-medium">{activeProvider.name}</span>
          ) : (
            <span className="text-warning">未配置</span>
          )}
        </div>
        <button
          onClick={onNavigateToProvider}
          className="text-xs text-primary hover:text-primary/80"
        >
          更改
        </button>
      </div>

      {/* 权限模式 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          权限模式
        </label>
        <div className="grid grid-cols-4 gap-3">
          {PERMISSION_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => {
                clearSaveError();
                setAgentFormData({ permissionMode: mode.value });
              }}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-150
                ${(formData.agent.permissionMode || 'default') === mode.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'}
              `}
            >
              {mode.icon}
              <span className="text-sm font-medium">{mode.label}</span>
              <span className="text-xs text-center opacity-70">{mode.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 系统提示词 */}
      <SystemPromptEditor />

      {/* Claude Code 模式 */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Claude Code 模式</h3>
            <p className="text-xs text-muted-foreground">
              开启后继承 Claude Code 配置和系统提示词
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            clearSaveError();
            setAgentFormData({ claudeCodeMode: !formData.agent.claudeCodeMode });
          }}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${formData.agent.claudeCodeMode
              ? 'bg-primary'
              : 'bg-muted-foreground/30'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${formData.agent.claudeCodeMode ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

export default AgentSettings;

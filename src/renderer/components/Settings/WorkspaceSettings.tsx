import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Folder, Star, Trash2, Edit2, FolderOpen, Plus, Check, X, Home } from 'lucide-react';
import type { Workspace } from '../../types';
import { DEFAULT_WORKSPACE_PATH } from '../../../shared/constants';
import { formatPathWithTilde, getPathName } from '../../utils/path';

const WorkspaceSettings: React.FC = () => {
  const { formData, setFormData } = useSettingsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const workspaces = formData.workspaces || [];

  const handleAddWorkspace = async () => {
    const result = await window.electronAPI.dialog.selectFolder();
    if (result.success && result.path) {
      // 检查是否已存在相同路径的工作空间
      if (workspaces.some(w => w.path === result.path)) {
        return; // 已存在，不重复添加
      }
      // 提取目录最后一级作为名称
      const name = getPathName(result.path) || 'workspace';
      const newWorkspace: Workspace = {
        id: crypto.randomUUID(),
        name,
        path: result.path,
        isDefault: workspaces.length === 0, // 第一个工作空间设为默认
      };
      setFormData({ workspaces: [...workspaces, newWorkspace] });
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = workspaces.map(w => ({
      ...w,
      isDefault: w.id === id,
    }));
    setFormData({ workspaces: updated });
  };

  // 设置系统默认工作空间为默认（清除所有用户工作空间的默认标记）
  const handleSetSystemDefault = () => {
    const updated = workspaces.map(w => ({
      ...w,
      isDefault: false,
    }));
    setFormData({ workspaces: updated });
  };

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    const { confirmed } = await window.electronAPI.dialog.confirm({
      title: '确认删除',
      message: `确定要删除工作空间 "${workspace.name}" 吗？`,
    });

    if (!confirmed) return;

    const filtered = workspaces.filter(w => w.id !== workspace.id);
    // 如果删除的是默认工作空间，将第一个设为默认
    if (filtered.length > 0 && !filtered.some(w => w.isDefault)) {
      filtered[0].isDefault = true;
    }
    setFormData({ workspaces: filtered });
  };

  const handleStartRename = (workspace: Workspace) => {
    setEditingId(workspace.id);
    setEditingName(workspace.name);
  };

  const handleSaveRename = () => {
    if (editingId && editingName.trim()) {
      const updated = workspaces.map(w =>
        w.id === editingId ? { ...w, name: editingName.trim() } : w
      );
      setFormData({ workspaces: updated });
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleOpenInFinder = async (path: string) => {
    await window.electronAPI.shell.openPath(path);
  };

  // 检查是否有用户设置的默认工作空间
  const hasUserDefault = workspaces.some(w => w.isDefault);

  return (
    <div className="space-y-6">
      {/* 系统默认工作空间 */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          系统默认工作空间
        </label>
        <div className="flex items-center gap-3 p-3 bg-muted
                        rounded-lg border border-border">
          <div className="flex-shrink-0">
            <Home className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                默认目录
              </span>
              {!hasUserDefault && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs
                               bg-warning/20 text-warning
                               rounded">
                  <Star className="w-3 h-3" />
                  默认
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {DEFAULT_WORKSPACE_PATH}
            </p>
          </div>
          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            {hasUserDefault && (
              <button
                onClick={handleSetSystemDefault}
                className="p-1.5 text-muted-foreground hover:text-warning
                           hover:bg-warning/10 rounded
                           transition-colors"
                title="设为默认"
              >
                <Star className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleOpenInFinder(DEFAULT_WORKSPACE_PATH)}
              className="p-1.5 text-muted-foreground hover:text-info
                         hover:bg-info/10 rounded
                         transition-colors"
              title="打开目录"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          如果没有设置默认工作空间，新建会话将使用此目录
        </p>
      </div>

      {/* 用户工作空间列表 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            已保存的工作空间
          </label>
          <button
            onClick={handleAddWorkspace}
            className="flex items-center gap-2 px-3 py-1.5 text-sm
                       bg-primary text-primary-foreground rounded-lg
                       hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
            <Folder className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无保存的工作空间</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="flex items-center gap-3 p-3 bg-muted
                           rounded-lg border border-border
                           hover:border-border transition-colors"
              >
                {/* 图标 */}
                <div className="flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>

                {/* 名称和路径 */}
                <div className="flex-1 min-w-0">
                  {editingId === workspace.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 text-sm bg-background
                                   border border-primary rounded outline-none"
                      />
                      <button
                        onClick={handleSaveRename}
                        className="p-1 text-success hover:bg-success/10 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 text-muted-foreground hover:bg-accent rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {workspace.name}
                        </span>
                        {workspace.isDefault && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs
                                         bg-warning/20 text-warning
                                         rounded">
                            <Star className="w-3 h-3" />
                            默认
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {formatPathWithTilde(workspace.path)}
                      </p>
                    </>
                  )}
                </div>

                {/* 操作按钮 */}
                {editingId !== workspace.id && (
                  <div className="flex items-center gap-1">
                    {!workspace.isDefault && (
                      <button
                        onClick={() => handleSetDefault(workspace.id)}
                        className="p-1.5 text-muted-foreground hover:text-warning
                                   hover:bg-warning/10 rounded
                                   transition-colors"
                        title="设为默认"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenInFinder(workspace.path)}
                      className="p-1.5 text-muted-foreground hover:text-info
                                 hover:bg-info/10 rounded
                                 transition-colors"
                      title="打开目录"
                    >
                      <Folder className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStartRename(workspace)}
                      className="p-1.5 text-muted-foreground hover:text-primary
                                 hover:bg-primary/10 rounded
                                 transition-colors"
                      title="重命名"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkspace(workspace)}
                      className="p-1.5 text-muted-foreground hover:text-destructive
                                 hover:bg-destructive/10 rounded
                                 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 说明文字 */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>工作空间用于指定 Agent 执行命令时的工作目录。</p>
        <p>新建会话时将使用默认工作空间。</p>
      </div>
    </div>
  );
};

export default WorkspaceSettings;

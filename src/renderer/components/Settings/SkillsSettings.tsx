import React, { useEffect, useState } from 'react';
import { Sparkles, FolderOpen, RefreshCw, ChevronDown, ChevronRight, AlertCircle, Home, Folder, Download, Check, X, Trash2 } from 'lucide-react';
import type { SkillsLoadResult, Skill, WorkspaceSkills, RecommendedSkill, Workspace, SkillInstallTarget } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { formatPathWithTilde } from '../../utils/path';

type TabType = 'installed' | 'recommended';

// 安装目标选择对话框
interface InstallDialogProps {
  skill: RecommendedSkill;
  workspaces: Workspace[];
  onInstall: (target: SkillInstallTarget, workspacePath?: string) => void;
  onClose: () => void;
}

const InstallDialog: React.FC<InstallDialogProps> = ({ skill, workspaces, onInstall, onClose }) => {
  const [selectedTarget, setSelectedTarget] = useState<'system' | string>('system');

  const handleInstall = () => {
    if (selectedTarget === 'system') {
      onInstall('system');
    } else {
      onInstall('workspace', selectedTarget);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-medium text-foreground">
            安装 {skill.metadata.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            安装位置
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border
                       bg-background text-foreground
                       focus:ring-2 focus:ring-primary focus:border-primary
                       outline-none transition-colors"
          >
            <option value="system">系统级 (~/.claude/skills)</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.path}>
                {ws.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            {selectedTarget === 'system'
              ? '系统级 Skills 对所有会话可用'
              : '工作空间 Skills 仅在该工作空间内可用'}
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-muted-foreground
                       hover:bg-accent rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 text-sm text-primary-foreground
                       bg-primary rounded-lg
                       hover:bg-primary/90 transition-colors
                       flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            安装
          </button>
        </div>
      </div>
    </div>
  );
};

const SkillsSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('installed');
  const [skillsData, setSkillsData] = useState<SkillsLoadResult | null>(null);
  const [recommendedSkills, setRecommendedSkills] = useState<RecommendedSkill[]>([]);
  const [isLoadingInstalled, setIsLoadingInstalled] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['system']));
  const [installDialog, setInstallDialog] = useState<RecommendedSkill | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [uninstalling, setUninstalling] = useState<string | null>(null);

  const { settings } = useSettingsStore();
  const workspaces = settings?.workspaces || [];

  // 加载已安装的 skills
  const loadInstalledSkills = async () => {
    setIsLoadingInstalled(true);
    try {
      const installed = await window.electronAPI.skills.load();
      setSkillsData(installed);
      const sections = new Set<string>();
      if (installed.systemSkills.length > 0) sections.add('system');
      installed.workspaceSkills.forEach(ws => {
        if (ws.skills.length > 0) sections.add(ws.workspacePath);
      });
      setExpandedSections(sections);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoadingInstalled(false);
    }
  };

  // 加载推荐的 skills（异步，不阻塞）
  const loadRecommendedSkills = async () => {
    setIsLoadingRecommended(true);
    try {
      const recommended = await window.electronAPI.skills.listRecommended();
      setRecommendedSkills(recommended);
    } catch (err) {
      console.error('Failed to load recommended skills:', err);
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  // 刷新所有
  const refreshAll = async () => {
    setError(null);
    await Promise.all([loadInstalledSkills(), loadRecommendedSkills()]);
  };

  useEffect(() => {
    // 先加载已安装的
    loadInstalledSkills();
    // 异步加载推荐的
    loadRecommendedSkills();
  }, []);

  const handleInstall = async (skill: RecommendedSkill, target: SkillInstallTarget, workspacePath?: string) => {
    setInstallDialog(null);
    setInstalling(skill.id);
    try {
      const result = await window.electronAPI.skills.install(skill.id, target, workspacePath);
      if (result.success) {
        // 重新加载列表
        await refreshAll();
      } else {
        setError(result.error || '安装失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '安装失败');
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (skill: Skill) => {
    // 确认卸载
    const confirmed = await window.electronAPI.dialog.confirm({
      title: '卸载 Skill',
      message: `确定要卸载 ${skill.metadata.name} 吗？`,
      detail: '此操作将删除该 Skill 的所有文件。',
    });

    if (!confirmed.confirmed) return;

    setUninstalling(skill.id);
    try {
      const result = await window.electronAPI.skills.uninstall(skill.path);
      if (result.success) {
        await refreshAll();
      } else {
        setError(result.error || '卸载失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '卸载失败');
    } finally {
      setUninstalling(null);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleOpenSkillFolder = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    await window.electronAPI.shell.openPath(path);
  };

  const renderSkillCard = (skill: Skill) => (
    <div
      key={skill.id}
      className="flex flex-col p-4 rounded-xl
                 border-2 border-border
                 text-muted-foreground
                 transition-all duration-150 h-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                        bg-primary/10 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="font-medium text-sm text-foreground truncate flex-1">
          {skill.metadata.name}
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
        {skill.metadata.description}
      </p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <button
          onClick={(e) => handleOpenSkillFolder(e, skill.path)}
          className="text-xs text-muted-foreground truncate flex items-center gap-1
                     hover:text-primary transition-colors"
          title="打开文件夹"
        >
          <FolderOpen className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{formatPathWithTilde(skill.path)}</span>
        </button>
        <button
          onClick={() => handleUninstall(skill)}
          disabled={uninstalling === skill.id}
          className="flex items-center gap-1 px-2 py-1 text-xs
                     text-destructive hover:bg-destructive/10
                     rounded transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          title="卸载"
        >
          {uninstalling === skill.id ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );

  const renderRecommendedCard = (skill: RecommendedSkill) => (
    <div
      key={skill.id}
      className="flex flex-col p-4 rounded-xl
                 border-2 border-border
                 text-muted-foreground
                 transition-all duration-150 h-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                        bg-primary/10 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="font-medium text-sm text-foreground truncate flex-1">
          {skill.metadata.name}
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
        {skill.metadata.description}
      </p>
      <div className="mt-3 pt-3 border-t border-border">
        {skill.installed ? (
          <div className="flex items-center gap-2 text-xs text-success">
            <Check className="w-4 h-4" />
            <span>
              已安装到{skill.installedAt === 'system' ? '系统' : skill.installedWorkspace}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setInstallDialog(skill)}
            disabled={installing === skill.id}
            className="flex items-center gap-2 px-3 py-1.5 text-xs
                       text-primary-foreground bg-primary rounded-lg
                       hover:bg-primary/90 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {installing === skill.id ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                安装中...
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                安装
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  const renderSection = (
    title: string,
    sectionId: string,
    skills: Skill[],
    icon: React.ReactNode,
    subtitle?: string,
    skillsPath?: string
  ) => {
    const isExpanded = expandedSections.has(sectionId);

    const handleOpenFolder = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (skillsPath) {
        await window.electronAPI.shell.openPath(skillsPath);
      }
    };

    return (
      <div key={sectionId}>
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex items-center gap-3 p-3 rounded-lg
                     hover:bg-accent transition-colors"
        >
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          {icon}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {title}
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-muted
                             text-muted-foreground rounded">
                {skills.length}
              </span>
            </div>
            {subtitle && skills.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span>{subtitle}</span>
                {skillsPath && (
                  <span
                    onClick={handleOpenFolder}
                    className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
                    title="打开文件夹"
                  >
                    <Folder className="w-3 h-3" />
                  </span>
                )}
              </p>
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-3 ml-7">
            {skills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground
                              bg-muted rounded-lg">
                <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无 Skills</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.map(renderSkillCard)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-6 h-6 text-destructive mb-3" />
        <p className="text-sm text-destructive mb-4">{error}</p>
        <button
          onClick={refreshAll}
          className="flex items-center gap-2 px-4 py-2 text-sm
                     bg-primary text-primary-foreground rounded-lg
                     hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      </div>
    );
  }

  const totalInstalledSkills = (skillsData?.systemSkills.length || 0) +
    (skillsData?.workspaceSkills.reduce((acc, ws) => acc + ws.skills.length, 0) || 0);

  return (
    <div className="space-y-6">
      {/* 说明 */}
      <div>
        <p className="text-xs text-muted-foreground">
          Skills 是包含 SKILL.md 文件的文件夹，用于扩展 Claude 的能力。
          系统级 Skills 位于 ~/.claude/skills，工作空间 Skills 位于各工作空间的 .claude/skills 目录。
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab('installed')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === 'installed'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <FolderOpen className="w-4 h-4" />
          已安装 ({totalInstalledSkills})
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === 'recommended'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Download className="w-4 h-4" />
          推荐 ({recommendedSkills.length})
        </button>
      </div>

      {/* 已安装 Tab */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          {/* Skills 列表 */}
          {isLoadingInstalled ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <div className="space-y-4">
            {renderSection(
              '系统 Skills',
              'system',
              skillsData?.systemSkills || [],
              <Home className="w-5 h-5 text-muted-foreground" />,
              '~/.claude/skills',
              '~/.claude/skills'
            )}

            {skillsData?.workspaceSkills.map((ws: WorkspaceSkills) =>
              renderSection(
                ws.workspaceName,
                ws.workspacePath,
                ws.skills,
                <FolderOpen className="w-5 h-5 text-primary" />,
                `${formatPathWithTilde(ws.workspacePath)}/.claude/skills`,
                `${ws.workspacePath}/.claude/skills`
              )
            )}
            </div>
          )}
        </div>
      )}

      {/* 推荐 Tab */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          {/* 头部 */}
          <p className="text-sm text-muted-foreground">
            官方推荐的 Skills，点击安装按钮添加到您的系统或工作空间
          </p>

          {/* 推荐 Skills 网格 */}
          {isLoadingRecommended ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">从网络加载中...</p>
            </div>
          ) : recommendedSkills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground
                            bg-muted rounded-lg">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无推荐的 Skills</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendedSkills.map(renderRecommendedCard)}
            </div>
          )}
        </div>
      )}

      {/* 安装对话框 */}
      {installDialog && (
        <InstallDialog
          skill={installDialog}
          workspaces={workspaces}
          onInstall={(target, workspacePath) => handleInstall(installDialog, target, workspacePath)}
          onClose={() => setInstallDialog(null)}
        />
      )}
    </div>
  );
};

export default SkillsSettings;

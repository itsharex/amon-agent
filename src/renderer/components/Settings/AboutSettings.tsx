import React, { useEffect, useState } from 'react';
import { FolderOpen, ExternalLink, Github, FileText } from 'lucide-react';
import LogoImage from '@/renderer/assets/images/Logo.png';

const AboutSettings: React.FC = () => {
  const [version, setVersion] = useState('0.0.0');

  useEffect(() => {
    // 获取应用版本号
    window.electronAPI.app.getVersion().then((result) => {
      if (result.success) {
        setVersion(result.version);
      }
    });
  }, []);

  const handleOpenConfigDir = () => {
    window.electronAPI.shell.openConfigDir();
  };

  const handleOpenGithub = () => {
    window.electronAPI.shell.openExternal('https://github.com/liruifengv/amon-agent');
  };

  const handleOpenLicense = () => {
    window.electronAPI.shell.openExternal('https://github.com/liruifengv/amon-agent/blob/main/LICENSE');
  };

  const handleOpenDocs = () => {
    window.electronAPI.shell.openExternal('https://github.com/liruifengv/amon-agent#readme');
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden flex items-center justify-center">
          <img src={LogoImage} alt="Amon Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Amon
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          版本 {version}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          你的桌面 AI 工作伙伴
        </p>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3">
          关于 Amon
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Amon 是运行在本地的智能 AI Coworker，基于 Claude Agent SDK 构建。它不仅能与你对话，还能真正帮你完成工作：编写代码、执行命令、搜索信息、管理文件。
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="text-foreground">真正的工作伙伴</strong> — 能执行任务、操作文件、运行代码的智能助手，而非简单的对话机器人</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="text-foreground">本地优先</strong> — 数据存储在本地，保护隐私和安全</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="text-foreground">可扩展</strong> — 通过 Skills 系统扩展功能，适应不同工作场景</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="text-foreground">可视化界面</strong> — 为 Claude Code 提供友好的图形界面体验</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3">
          快捷键
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">Cmd/Ctrl + ,</kbd> 打开设置</li>
          <li>• <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">Cmd/Ctrl + Enter</kbd> 发送消息</li>
          <li>• <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">Cmd/Ctrl + N</kbd> 新建会话</li>
        </ul>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3">
          链接
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleOpenGithub}
            className="w-full inline-flex items-center justify-between px-3 py-2 text-sm text-foreground bg-background hover:bg-accent rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub 仓库
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleOpenDocs}
            className="w-full inline-flex items-center justify-between px-3 py-2 text-sm text-foreground bg-background hover:bg-accent rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              使用文档
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleOpenLicense}
            className="w-full inline-flex items-center justify-between px-3 py-2 text-sm text-foreground bg-background hover:bg-accent rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              开源协议 (AGPL-3.0)
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3">
          数据目录
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          会话记录和设置文件存储在本地配置目录中。
        </p>
        <button
          onClick={handleOpenConfigDir}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          打开配置目录
        </button>
      </div>
    </div>
  );
};

export default AboutSettings;

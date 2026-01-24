import React from 'react';
import { useSettingsStore, applyTheme } from '../../store/settingsStore';
import { Sun, Moon, Monitor } from 'lucide-react';

const THEMES = [
  {
    id: 'light' as const,
    name: 'Light',
    icon: <Sun className="w-6 h-6" />,
  },
  {
    id: 'dark' as const,
    name: 'Dark',
    icon: <Moon className="w-6 h-6" />,
  },
  {
    id: 'system' as const,
    name: 'System',
    icon: <Monitor className="w-6 h-6" />,
  },
];

const GeneralSettings: React.FC = () => {
  const { formData, setFormData, saveTheme } = useSettingsStore();

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    applyTheme(theme);
    setFormData({ theme });

    // 立即保存主题设置（不影响其他未保存的设置）
    await saveTheme(theme);
  };

  return (
    <div className="space-y-6">
      {/* 主题设置 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer
                border-2 transition-all duration-150
                ${formData.theme === theme.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'}
              `}
            >
              {theme.icon}
              <span className="text-sm font-medium">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;

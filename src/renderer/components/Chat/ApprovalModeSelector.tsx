import React from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ApprovalMode } from '../../types';
import { useSessionStore } from '../../store/sessionStore';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const OPTIONS: ApprovalMode[] = ['ask', 'auto-edit', 'yolo'];

interface ApprovalModeSelectorProps {
  sessionId: string;
  approvalMode: ApprovalMode;
}

function getLabelKey(mode: ApprovalMode): string {
  switch (mode) {
    case 'ask':
      return 'permissionMode.ask';
    case 'auto-edit':
      return 'permissionMode.autoEdit';
    case 'yolo':
      return 'permissionMode.yolo';
  }
}

function getDescriptionKey(mode: ApprovalMode): string {
  switch (mode) {
    case 'ask':
      return 'permissionMode.askDesc';
    case 'auto-edit':
      return 'permissionMode.autoEditDesc';
    case 'yolo':
      return 'permissionMode.yoloDesc';
  }
}

export const ApprovalModeSelector: React.FC<ApprovalModeSelectorProps> = ({
  sessionId,
  approvalMode,
}) => {
  const { t } = useTranslation('chat');
  const { setApprovalMode } = useSessionStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="no-drag h-8 gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>{t(getLabelKey(approvalMode))}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t('permissionMode.currentSessionMode')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={approvalMode}
          onValueChange={(value) => setApprovalMode(sessionId, value as ApprovalMode)}
        >
          {OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              className="flex flex-col items-start gap-0.5"
            >
              <span>{t(getLabelKey(option))}</span>
              <span className="pr-4 text-xs text-muted-foreground">
                {t(getDescriptionKey(option))}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

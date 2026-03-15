import React, { useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePermissionStore } from '../../store/permissionStore';
import type { PermissionRequest } from '../../types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Button } from '../ui/button';

const EMPTY_PENDING: never[] = [];
const MAX_DETAIL_LENGTH = 600;

interface PermissionRequestBannerProps {
  sessionId: string;
}

interface DetailField {
  label: string;
  value: string;
  kind?: 'text' | 'code';
}

function truncateDetail(value: string, maxLength = MAX_DETAIL_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 20)}\n...(${value.length - maxLength + 20} more chars)`;
}

function normalizeValue(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function buildDetailFields(request: PermissionRequest, t: (key: string) => string): DetailField[] {
  const args = request.args && typeof request.args === 'object'
    ? request.args as Record<string, unknown>
    : {};

  const addField = (
    fields: DetailField[],
    label: string,
    value: unknown,
    kind: DetailField['kind'] = 'text',
  ) => {
    const normalized = normalizeValue(value);
    if (!normalized) {
      return;
    }

    fields.push({
      label,
      value: truncateDetail(normalized),
      kind,
    });
  };

  const fields: DetailField[] = [];

  addField(fields, t('tool'), request.toolName);

  switch (request.toolName) {
    case 'Read':
      addField(fields, t('path'), args.file_path);
      addField(fields, t('offset'), args.offset);
      addField(fields, t('limit'), args.limit);
      break;

    case 'Write':
      addField(fields, t('path'), args.file_path);
      break;

    case 'Edit':
      addField(fields, t('path'), args.file_path);
      addField(fields, t('replaceAll'), args.replace_all);
      break;

    case 'Glob':
      addField(fields, t('pattern'), args.pattern);
      addField(fields, t('path'), args.path);
      break;

    case 'Grep':
      addField(fields, t('pattern'), args.pattern);
      addField(fields, t('path'), args.path);
      addField(fields, t('include'), args.include);
      break;

    case 'Bash':
      addField(fields, t('command'), args.command, 'code');
      addField(fields, t('timeout'), args.timeout);
      break;

    case 'WebFetch':
      addField(fields, t('url'), args.url);
      addField(fields, t('format'), args.format);
      addField(fields, t('timeout'), args.timeout);
      break;

    case 'WebSearch':
      addField(fields, t('query'), args.query);
      break;

    default:
      addField(fields, t('parameters'), request.args, 'code');
      break;
  }

  return fields;
}

const DiffPreview: React.FC<{ diff: string }> = ({ diff }) => {
  const lines = diff.split('\n');

  return (
    <div className="max-h-56 overflow-auto rounded-md border border-border bg-muted/40">
      <div className="font-mono text-xs">
        {lines.map((line, index) => {
          const prefix = line[0] ?? ' ';

          if (prefix === '+') {
            return (
              <div key={`${index}-${line}`} className="flex bg-green-500/15">
                <span className="w-10 shrink-0 select-none px-2 py-1 text-right text-green-700 dark:text-green-300">
                  +
                </span>
                <span className="flex-1 break-words px-2 py-1 text-green-800 dark:text-green-200">
                  {line.slice(1) || ' '}
                </span>
              </div>
            );
          }

          if (prefix === '-') {
            return (
              <div key={`${index}-${line}`} className="flex bg-red-500/15">
                <span className="w-10 shrink-0 select-none px-2 py-1 text-right text-red-700 dark:text-red-300">
                  -
                </span>
                <span className="flex-1 break-words px-2 py-1 text-red-800 dark:text-red-200">
                  {line.slice(1) || ' '}
                </span>
              </div>
            );
          }

          return (
            <div key={`${index}-${line}`} className="flex">
              <span className="w-10 shrink-0 select-none px-2 py-1 text-right text-muted-foreground/70">
                {prefix === ' ' ? ' ' : ''}
              </span>
              <span className="flex-1 break-words px-2 py-1 text-foreground/80">
                {prefix === ' ' ? line.slice(1) || ' ' : line || ' '}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PermissionRequestBanner: React.FC<PermissionRequestBannerProps> = ({ sessionId }) => {
  const { t } = useTranslation('permission');
  const pendingRequests = usePermissionStore((state) => state.pendingBySession[sessionId] ?? EMPTY_PENDING);
  const respond = usePermissionStore((state) => state.respond);
  const respondingIds = usePermissionStore((state) => state.respondingIds);
  const [isExpanded, setIsExpanded] = useState(false);

  const request = pendingRequests[0] ?? null;

  useEffect(() => {
    setIsExpanded(false);
  }, [request?.id]);

  if (!request) {
    return null;
  }

  const responding = respondingIds[request.id] ?? false;
  const detailFields = buildDetailFields(request, t);
  const hasDetails = Boolean(request.diffPreview) || detailFields.length > 0;

  return (
    <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-amber-500/20 p-1.5 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">
              {t('permissionRequest')}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {request.summary}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={responding}
              onClick={() => void respond(request.id, 'reject')}
            >
              {responding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('deny')}
            </Button>
            <Button
              size="sm"
              disabled={responding}
              onClick={() => void respond(request.id, 'approve')}
            >
              {responding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('allow')}
            </Button>
          </div>
        </div>
        {hasDetails && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="flex justify-end">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
                  <span>{isExpanded ? t('hideDetails') : t('viewDetailParams')}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2 w-full space-y-3">
              {request.diffPreview && (
                <div className="w-full space-y-1">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t('changes')}
                  </div>
                  <div className="w-full">
                    <DiffPreview diff={request.diffPreview} />
                  </div>
                </div>
              )}
              {detailFields.length > 0 && (
                <div className="w-full space-y-2 rounded-lg border border-border/60 bg-background/70 p-3">
                  {detailFields.map((field) => (
                    <div key={`${field.label}-${field.value.slice(0, 24)}`} className="space-y-1">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {field.label}
                      </div>
                      {field.kind === 'code' ? (
                        <pre className="w-full max-h-36 overflow-auto rounded-md bg-muted px-2.5 py-2 text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                          {field.value}
                        </pre>
                      ) : (
                        <div className="w-full text-sm text-foreground break-words">
                          {field.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
};

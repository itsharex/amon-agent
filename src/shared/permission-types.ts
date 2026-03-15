import { z } from 'zod';

export const ApprovalModeSchema = z.enum(['ask', 'auto-edit', 'yolo']);
export type ApprovalMode = z.infer<typeof ApprovalModeSchema>;

export type PermissionDecision = 'approve' | 'reject';

export interface PermissionRequest {
  id: string;
  sessionId: string;
  toolCallId: string;
  toolName: string;
  args: unknown;
  summary: string;
  diffPreview?: string;
  mode: ApprovalMode;
  createdAt: number;
}

export interface PermissionResolved {
  requestId: string;
  sessionId: string;
  toolCallId: string;
  decision: PermissionDecision;
}

export interface PermissionRequestToolUpdate {
  type: 'permission_request';
  request: PermissionRequest;
}

export interface PermissionResolvedToolUpdate {
  type: 'permission_resolved';
  requestId: string;
  decision: PermissionDecision;
}

export type PermissionToolUpdate =
  | PermissionRequestToolUpdate
  | PermissionResolvedToolUpdate;

export function isPermissionToolUpdate(value: unknown): value is PermissionToolUpdate {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const type = (value as { type?: unknown }).type;
  return type === 'permission_request' || type === 'permission_resolved';
}

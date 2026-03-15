import { nanoid } from 'nanoid';
import type { PermissionRequest, PermissionToolUpdate } from '@shared/permission-types';
import type { SessionStore } from '../store/session-store';
import type { Tool, ToolContext, ToolResult } from '../tools/types';
import { buildPermissionDiffPreview } from './preview';
import { buildPermissionSummary } from './summary';
import { evaluatePermissionPolicy } from './policy';
import {
  ApprovalService,
  PermissionCancelledError,
  PermissionRejectedError,
} from './approval-service';

export interface PermissionedToolExecutionContext extends ToolContext {
  sessionId: string;
  toolCallId: string;
  mode: NonNullable<PermissionRequest['mode']>;
  onPermissionUpdate?: (update: PermissionToolUpdate) => void;
}

export class PermissionedToolExecutor {
  constructor(
    private readonly sessionStore: SessionStore,
    private readonly approvalService: ApprovalService,
  ) {}

  async execute<TInput>(
    tool: Tool<TInput>,
    input: TInput,
    context: PermissionedToolExecutionContext,
  ): Promise<ToolResult> {
    const session = this.sessionStore.getSession(context.sessionId);
    const mode = session?.approvalMode ?? context.mode;

    const policyDecision = evaluatePermissionPolicy({
      mode,
      toolName: tool.name,
      toolInput: input,
      cwd: context.cwd,
    });

    if (policyDecision === 'ask') {
      const request: PermissionRequest = {
        id: nanoid(),
        sessionId: context.sessionId,
        toolCallId: context.toolCallId,
        toolName: tool.name,
        args: input,
        summary: buildPermissionSummary(tool.name, input, context.cwd),
        diffPreview: await buildPermissionDiffPreview(tool.name, input, context.cwd),
        mode,
        createdAt: Date.now(),
      };

      context.onPermissionUpdate?.({
        type: 'permission_request',
        request,
      });

      try {
        await this.approvalService.requestApproval(request);
      } catch (error) {
        context.onPermissionUpdate?.({
          type: 'permission_resolved',
          requestId: request.id,
          decision: 'reject',
        });

        if (error instanceof PermissionRejectedError || error instanceof PermissionCancelledError) {
          return {
            output: error.message,
            isError: true,
          };
        }

        return {
          output: String(error),
          isError: true,
        };
      }

      context.onPermissionUpdate?.({
        type: 'permission_resolved',
        requestId: request.id,
        decision: 'approve',
      });
    }

    return tool.execute(input, context);
  }
}

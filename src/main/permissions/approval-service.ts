import type { PermissionDecision, PermissionRequest } from '@shared/permission-types';

interface PendingPermission {
  request: PermissionRequest;
  resolve: () => void;
  reject: (error: Error) => void;
}

export class PermissionRejectedError extends Error {
  constructor(message = 'Tool execution rejected by user.') {
    super(message);
    this.name = 'PermissionRejectedError';
  }
}

export class PermissionCancelledError extends Error {
  constructor(message = 'Permission request cancelled.') {
    super(message);
    this.name = 'PermissionCancelledError';
  }
}

export class ApprovalService {
  private pending = new Map<string, PendingPermission>();

  async requestApproval(request: PermissionRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pending.set(request.id, {
        request,
        resolve: () => {
          this.pending.delete(request.id);
          resolve();
        },
        reject: (error) => {
          this.pending.delete(request.id);
          reject(error);
        },
      });
    });
  }

  respond(requestId: string, decision: PermissionDecision): PermissionRequest | null {
    const pending = this.pending.get(requestId);
    if (!pending) {
      return null;
    }

    if (decision === 'approve') {
      pending.resolve();
    } else {
      pending.reject(new PermissionRejectedError());
    }

    return pending.request;
  }

  rejectAllForSession(sessionId: string): PermissionRequest[] {
    const rejected: PermissionRequest[] = [];

    for (const [requestId, pending] of this.pending.entries()) {
      if (pending.request.sessionId !== sessionId) {
        continue;
      }

      this.pending.delete(requestId);
      pending.reject(new PermissionCancelledError());
      rejected.push(pending.request);
    }

    return rejected;
  }

  listPendingForSession(sessionId: string): PermissionRequest[] {
    return Array.from(this.pending.values())
      .map((item) => item.request)
      .filter((request) => request.sessionId === sessionId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
}

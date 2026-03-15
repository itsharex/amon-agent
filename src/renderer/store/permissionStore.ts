import { create } from 'zustand';
import type { PermissionRequest } from '../types';

const EMPTY_REQUESTS: PermissionRequest[] = [];

interface PermissionState {
  pendingBySession: Record<string, PermissionRequest[]>;
  respondingIds: Record<string, boolean>;
  getPendingRequests: (sessionId: string | null) => PermissionRequest[];
  addRequest: (request: PermissionRequest) => void;
  resolveRequest: (sessionId: string, requestId: string) => void;
  respond: (requestId: string, decision: 'approve' | 'reject') => Promise<void>;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  pendingBySession: {},
  respondingIds: {},

  getPendingRequests: (sessionId) => {
    if (!sessionId) {
      return EMPTY_REQUESTS;
    }

    return get().pendingBySession[sessionId] ?? EMPTY_REQUESTS;
  },

  addRequest: (request) => set((state) => ({
    pendingBySession: {
      ...state.pendingBySession,
      [request.sessionId]: [
        ...(state.pendingBySession[request.sessionId] ?? EMPTY_REQUESTS).filter((item) => item.id !== request.id),
        request,
      ],
    },
  })),

  resolveRequest: (sessionId, requestId) => set((state) => ({
    pendingBySession: {
      ...state.pendingBySession,
      [sessionId]: (state.pendingBySession[sessionId] ?? EMPTY_REQUESTS).filter((request) => request.id !== requestId),
    },
    respondingIds: {
      ...state.respondingIds,
      [requestId]: false,
    },
  })),

  respond: async (requestId, decision) => {
    set((state) => ({
      respondingIds: {
        ...state.respondingIds,
        [requestId]: true,
      },
    }));

    try {
      const result = await window.ipc.permission.respond(requestId, decision) as { success?: boolean };
      if (!result?.success) {
        set((state) => ({
          respondingIds: {
            ...state.respondingIds,
            [requestId]: false,
          },
        }));
      }
    } catch (error) {
      set((state) => ({
        respondingIds: {
          ...state.respondingIds,
          [requestId]: false,
        },
      }));
      throw error;
    }
  },
}));

if (typeof window !== 'undefined' && window.push) {
  window.push.on('push:permissionRequested', (request) => {
    usePermissionStore.getState().addRequest(request);
  });

  window.push.on('push:permissionResolved', ({ sessionId, requestId }) => {
    usePermissionStore.getState().resolveRequest(sessionId, requestId);
  });
}

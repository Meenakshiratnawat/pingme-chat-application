// stores/pendingRequests.js
import { create } from "zustand";

export const usePendingRequestsStore = create((set, get) => ({
  pendingRequests: [],

  addRequest: (request) => {
    const current = get().pendingRequests;
    // Avoid duplicates
    const exists = current.some((r) => r.senderId === request.senderId);
    if (!exists) {
      set({ pendingRequests: [...current, request] });
    }
  },

  removeRequest: (senderId) => {
    set({
      pendingRequests: get().pendingRequests.filter((r) => r.senderId !== senderId),
    });
  },

  clearRequests: () => set({ pendingRequests: [] }),
}));
import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // State
  isOpen: false,
  pendingAction: null,

  // Actions
  handleOpenModal: (action) => {
    set({ pendingAction: () => action, isOpen: true });
  },

  handleCloseModal: () => {
    set({ pendingAction: null, isOpen: false });
  },

  handleConfirmAction: () => {
    const { pendingAction } = useUIStore.getState();
    if (pendingAction) {
      pendingAction();
    }
    set({ pendingAction: null, isOpen: false });
  }
}));

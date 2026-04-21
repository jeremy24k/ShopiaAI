import { create } from 'zustand';

export const useDemoStore = create((set, get) => ({
  demoQuestionsUsed: parseInt(localStorage.getItem('sophia_demo_count') || '0'),
  demoQuestionLimit: 1,
  showDemoLimitModal: false,

  incrementDemoUsage: () => {
    const newCount = get().demoQuestionsUsed + 1;
    localStorage.setItem('sophia_demo_count', String(newCount));
    set({ demoQuestionsUsed: newCount });
  },

  resetDemoCount: () => {
    localStorage.setItem('sophia_demo_count', '0');
    set({ demoQuestionsUsed: 0 });
  },

  setShowDemoLimitModal: (show) => {
    set({ showDemoLimitModal: show });
  },

  canUseDemo: () => {
    return get().demoQuestionsUsed < get().demoQuestionLimit;
  }
}));

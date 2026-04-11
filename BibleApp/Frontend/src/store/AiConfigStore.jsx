import { create } from 'zustand';
import Logger from '../utils/logger.js';

const log = Logger.create('AiConfigStore');

const BASE_URL = import.meta.env.VITE_API_URL;

const getDefaultMode = () => {
  const stored = localStorage.getItem('sophia_ai_mode');
  const validModes = ['personal_guide', 'quick_search', 'deep_study', 'pastoral_guide'];
  
  if (!stored || stored === 'quick_search' || !validModes.includes(stored)) {
    localStorage.setItem('sophia_ai_mode', 'personal_guide');
    return 'personal_guide';
  }
  
  return stored;
};

const getDefaultDoctrine = () => {
  const stored = localStorage.getItem('sophia_ai_doctrine');
  if (stored === 'evangelical') {
    localStorage.setItem('sophia_ai_doctrine', 'ecumenical');
    return 'ecumenical';
  }
  return stored || 'ecumenical';
};

export const useAiConfigStore = create((set, get) => ({
  modeId: getDefaultMode(),
  doctrineId: getDefaultDoctrine(),
  availableModes: [],
  availableDoctrines: [],
  aiCosts: {},
  loadingOptions: false,

  setModeId: (modeId) => {
    localStorage.setItem('sophia_ai_mode', modeId);
    set({ modeId });
  },

  setDoctrineId: (doctrineId) => {
    localStorage.setItem('sophia_ai_doctrine', doctrineId);
    set({ doctrineId });
  },

  loadAvailableOptions: async (language = 'es') => {
    set({ loadingOptions: true });

    try {
      const [modesResponse, doctrinesResponse, costsResponse] = await Promise.all([
        fetch(`${BASE_URL}/ai/modes?lang=${language}`),
        fetch(`${BASE_URL}/ai/perspectives?lang=${language}`),
        fetch(`${BASE_URL}/ai/costs`)
      ]);

      if (modesResponse.ok && doctrinesResponse.ok && costsResponse.ok) {
        const modes = await modesResponse.json();
        const doctrines = await doctrinesResponse.json();
        const costs = await costsResponse.json();

        set({
          availableModes: modes.data,
          availableDoctrines: doctrines.data,
          aiCosts: costs.data,
          loadingOptions: false
        });
      } else {
        set({ loadingOptions: false });
        log.error('Error al cargar opciones de AI');
      }
    } catch (error) {
      set({ loadingOptions: false });
      log.error('Error al cargar opciones:', error);
    }
  }
}));

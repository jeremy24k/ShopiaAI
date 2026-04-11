import { create } from 'zustand';
import Logger from '../utils/logger.js';

const log = Logger.create('StreamingStore');

let aiStoreRef = null;

export const setAiStoreRef = (store) => {
  aiStoreRef = store;
};

export const useStreamingStore = create((set, get) => ({
  loading: false,
  error: null,
  currentResponse: '',
  abortController: null,

  setLoading: (loading) => {
    set({ loading });
    if (aiStoreRef) aiStoreRef.setState({ loading });
  },

  setError: (error) => {
    set({ error });
    if (aiStoreRef) aiStoreRef.setState({ error });
  },

  setCurrentResponse: (response) => {
    set({ currentResponse: response });
    if (aiStoreRef) aiStoreRef.setState({ currentResponse: response });
  },

  clearResponse: () => {
    set({ loading: false, abortController: null });
    if (aiStoreRef) aiStoreRef.setState({ loading: false });
  },

  startStreaming: () => {
    const abortController = new AbortController();
    set({
      loading: true,
      error: null,
      currentResponse: '',
      abortController
    });
    if (aiStoreRef) aiStoreRef.setState({
      loading: true,
      error: null,
      currentResponse: ''
    });
    return abortController;
  },

  cancelStreaming: () => {
    const { abortController, loading } = get();

    if (abortController && loading) {
      abortController.abort();
      log.debug('Respuesta cancelada por el usuario');
      set({
        loading: false,
        abortController: null
      });
      if (aiStoreRef) aiStoreRef.setState({ loading: false });
      return true;
    }
    return false;
  },

  stopStreaming: () => {
    set({
      loading: false,
      abortController: null
    });
    if (aiStoreRef) aiStoreRef.setState({
      loading: false
    });
  },

  appendToResponse: (chunk) => {
    const newResponse = get().currentResponse + chunk;
    set({ currentResponse: newResponse });
    if (aiStoreRef) aiStoreRef.setState({ currentResponse: newResponse });
  }
}));

import { create } from 'zustand';
import Logger from '../utils/logger.js';
import { useBooksStore } from './BooksStore';
import { useAiConfigStore } from './AiConfigStore';
import { useStreamingStore } from './StreamingStore';
import { useConversationStore } from './ConversationStore';
import { useDemoStore } from './DemoStore';

const log = Logger.create('AiStore');
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAiStore = create((set, get) => ({
  ...useAiConfigStore.getState(),
  ...useStreamingStore.getState(),
  ...useConversationStore.getState(),
  ...useDemoStore.getState(),

  sendingMessage: null,
  creditErrorData: null,

  setSendingMessage: (msg) => set({ sendingMessage: msg }),
  setCreditErrorData: (data) => set({ creditErrorData: data }),

  setModeId: (modeId) => {
    localStorage.setItem('sophia_ai_mode', modeId);
    set({ modeId });
    useAiConfigStore.getState().setModeId(modeId);
  },

  setDoctrineId: (doctrineId) => {
    localStorage.setItem('sophia_ai_doctrine', doctrineId);
    set({ doctrineId });
    useAiConfigStore.getState().setDoctrineId(doctrineId);
  },

  loadAvailableOptions: async (language = 'es') => {
    await useAiConfigStore.getState().loadAvailableOptions(language);
    const configState = useAiConfigStore.getState();
    set({
      availableModes: configState.availableModes,
      availableDoctrines: configState.availableDoctrines,
      aiCosts: configState.aiCosts,
      loadingOptions: configState.loadingOptions
    });
  },

  setVerseToExplain: (verses) => {
    set({ verseToExplain: verses });
    useConversationStore.getState().setVerseToExplain(verses);
  },

  setUserId: (userId) => {
    set({ userId });
    useConversationStore.getState().setUserId(userId);
  },

  setLoading: (loading) => {
    set({ loading });
    useStreamingStore.getState().setLoading(loading);
  },

  setError: (error) => {
    set({ error });
    useStreamingStore.getState().setError(error);
  },

  cancelResponse: () => {
    const { messages, currentResponse } = get();
    const cancelled = useStreamingStore.getState().cancelStreaming();

    if (cancelled && currentResponse && currentResponse.trim().length > 50) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      const modeId = lastUserMessage?.modeId || 'personal_guide';
      const doctrineId = lastUserMessage?.doctrineId || 'ecumenical';
      useConversationStore.getState().addMessage('assistant', `${currentResponse}\n\n[Respuesta interrumpida]`, modeId, doctrineId, null);
      const convState = useConversationStore.getState();
      set({ messages: convState.messages });
    }
  },

  addMessage: async (role, content, modeId, doctrineId, verseContext = null) => {
    await useConversationStore.getState().addMessage(role, content, modeId, doctrineId, verseContext);
    const convState = useConversationStore.getState();
    set({ 
      messages: convState.messages, 
      currentConversationId: convState.currentConversationId 
    });
  },

  sendMessage: async (message, messageType = 'question', modeId = 'personal_guide', doctrineId = 'ecumenical', language = 'es') => {
    try {
      const streamingState = useStreamingStore.getState();
      if (streamingState.loading) return;

      const demoState = useDemoStore.getState();
      const userId = useConversationStore.getState().userId;
      const isDemoMode = !userId;

      if (isDemoMode && !demoState.canUseDemo()) {
        demoState.setShowDemoLimitModal(true);
        return;
      }

      streamingState.cancelStreaming();

      const abortController = streamingState.startStreaming();
      
      const verseContext = useConversationStore.getState().verseToExplain;
      set({
        sendingMessage: {
          role: 'user',
          content: message,
          modeId,
          doctrineId,
          verseContext: verseContext
        }
      });

      const conversationHistory = useConversationStore.getState().messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const verseContextPayload = verseContext?.length > 0 ? {
        verses: verseContext.map(v => ({
          verse: v.content,
          verseNumber: v.verseNumber,
          bookId: v.bookId,
          translation: v.translationValue,
          chapter: v.chapterNumber
        })),
        bookName: verseContext[0]?.bookName,
        chapter: verseContext[0]?.chapterNumber,
        translationValue: verseContext[0]?.translationValue,
        bookId: verseContext[0]?.bookId
      } : null;

      const globalTranslation = useBooksStore.getState().selectedTranslation?.value;

      const response = await fetch(`${BASE_URL}/ai/chat-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          messageType,
          verseContext: verseContextPayload,
          conversationHistory,
          modeId,
          doctrineId,
          language,
          userId,
          globalTranslation,
          isDemoMode
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        let errorType = 'Error en la solicitud';
        if (response.status === 401) {
          errorType = isDemoMode ? 'demo_auth_error' : 'authentication_required';
        } else if (response.status === 402) {
          errorType = 'insufficient_credits';
        } else if (response.status === 429) {
          errorType = 'too_many_requests';
        }

        if (response.status === 402) {
          const errorData = await response.json();
          set({
            sendingMessage: null,
            error: errorType,
            creditErrorData: errorData
          });
        } else {
          set({
            sendingMessage: null,
            error: errorType,
            currentResponse: ''
          });
        }
        streamingState.stopStreaming();
        return { error: errorType };
      }

      await useConversationStore.getState().addMessage('user', message, modeId, doctrineId, verseContext);
      const convStateAfterUser = useConversationStore.getState();
      set({ 
        sendingMessage: null,
        messages: convStateAfterUser.messages,
        currentConversationId: convStateAfterUser.currentConversationId
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          streamingState.appendToResponse(chunk);
        }

        const messagesState = useConversationStore.getState().messages;
        const isDuplicate = messagesState.some(m =>
          m.role === 'assistant' && m.content === fullResponse
        );

        if (!isDuplicate) {
          await useConversationStore.getState().addMessage('assistant', fullResponse, modeId, doctrineId, null);
          const finalState = useConversationStore.getState();
          streamingState.stopStreaming();
          set({ 
            messages: finalState.messages,
            currentConversationId: finalState.currentConversationId,
            currentResponse: ''
          });

          if (isDemoMode) {
            demoState.incrementDemoUsage();
          }
        } else {
          streamingState.stopStreaming();
          set({ currentResponse: '' });
        }

      } catch (readError) {
        if (readError.name === 'AbortError') {
          log.debug('Stream interrumpido por cancelación');
          streamingState.stopStreaming();
          set({ currentResponse: '' });
          return;
        }
        streamingState.stopStreaming();
        set({ currentResponse: '' });
        throw readError;
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        log.error('Error en sendMessage:', error);
        set({ 
          error: 'Error al procesar el mensaje',
          sendingMessage: null,
          currentResponse: ''
        });
        useStreamingStore.getState().stopStreaming();
      }
    }
  },

  createConversation: async () => {
    return await useConversationStore.getState().createConversation();
  },

  saveMessage: async (message, conversationId = null) => {
    return await useConversationStore.getState().saveMessage(message, conversationId);
  },

  loadConversations: async (reset = false) => {
    await useConversationStore.getState().loadConversations(reset);
    const state = useConversationStore.getState();
    set({
      conversations: state.conversations,
      loadingConversations: state.loadingConversations,
      loadingMore: state.loadingMore,
      hasMoreConversations: state.hasMoreConversations
    });
  },

  loadSingleConversation: async (conversationId) => {
    set({ loadingMessages: true });
    const result = await useConversationStore.getState().loadSingleConversation(conversationId);
    const state = useConversationStore.getState();
    set({
      messages: state.messages,
      currentConversationId: state.currentConversationId,
      verseToExplain: state.verseToExplain,
      loadingMessages: state.loadingMessages,
      modeId: result.restoredModeId || state.modeId,
      doctrineId: result.restoredDoctrineId || state.doctrineId
    });
    return result;
  },

  deleteConversation: async (conversationId) => {
    await useConversationStore.getState().deleteConversation(conversationId);
    const state = useConversationStore.getState();
    set({ conversations: state.conversations });
  },

  removeVerseFromContext: async (verseToRemove) => {
    await useConversationStore.getState().removeVerseFromContext(verseToRemove);
    const state = useConversationStore.getState();
    set({ verseToExplain: state.verseToExplain });
  },

  removeBookFromContext: async (params) => {
    await useConversationStore.getState().removeBookFromContext(params);
    const state = useConversationStore.getState();
    set({ verseToExplain: state.verseToExplain });
  },

  clearAllContext: async () => {
    await useConversationStore.getState().clearAllContext();
    set({ verseToExplain: [] });
  },

  explainVerse: async (verseData, type, modeId = 'personal_guide', doctrineId = 'evangelical', language = 'es') => {
    const verseToExplain = useConversationStore.getState().verseToExplain;

    const labels = {
      es: { historicalContext: 'Contexto Histórico', dailyApplication: 'Aplicación Diaria', simpleExplanation: 'Explicación Sencilla', relatedVerses: 'Versículos Relacionados', originalLanguage: 'Idioma Original', studyPlan: 'Guía de Estudio', for: 'para', verses: 'versículos seleccionados' },
      en: { historicalContext: 'Historical Context', dailyApplication: 'Daily Application', simpleExplanation: 'Simple Explanation', relatedVerses: 'Related Verses', originalLanguage: 'Original Language', studyPlan: 'Study Plan', for: 'for', verses: 'selected verses' }
    };

    const currentLabels = labels[language] || labels.en;
    const typeLabel = currentLabels[type] || type;

    const buildRangeStr = (verses) => {
      const grouped = {};
      for (const v of verses) {
        const book = v.bookName;
        const ch = v.chapterNumber;
        if (!grouped[book]) grouped[book] = {};
        if (!grouped[book][ch]) grouped[book][ch] = [];
        grouped[book][ch].push(Number(v.verseNumber));
      }

      const bookParts = [];
      for (const [book, chapters] of Object.entries(grouped)) {
        const chParts = [];
        for (const [ch, nums] of Object.entries(chapters)) {
          const sorted = [...new Set(nums)].sort((a, b) => a - b);
          const ranges = [];
          let start = sorted[0], end = sorted[0];
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === end + 1) {
              end = sorted[i];
            } else {
              ranges.push(start === end ? `${start}` : `${start}-${end}`);
              start = end = sorted[i];
            }
          }
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          chParts.push(`${ch}:${ranges.join(',')}`);
        }
        bookParts.push(`${book} ${chParts.join('; ')}`);
      }
      return bookParts.join('; ');
    };

    const contextStr = verseToExplain?.length > 0 ? buildRangeStr(verseToExplain) : currentLabels.verses;
    const userMessage = `${typeLabel} ${currentLabels.for} ${contextStr}`;

    await get().sendMessage(userMessage, 'button', modeId, doctrineId, language);
  },

  askQuestion: async (question, verseContext, modeId = 'personal_guide', doctrineId = 'evangelical', language = 'es') => {
    await get().sendMessage(question, 'question', modeId, doctrineId, language);
  },

  clearLocalConversation: () => {
    useConversationStore.getState().clearLocalConversation();
    useStreamingStore.getState().stopStreaming();
    const state = useConversationStore.getState();
    set({
      messages: [],
      currentResponse: '',
      currentConversationId: null,
      modeId: state.modeId,
      doctrineId: state.doctrineId,
      verseToExplain: [],
      loading: false,
      loadingMessages: false
    });
  }
}));

import { setAiStoreRef } from './StreamingStore';
setAiStoreRef(useAiStore);

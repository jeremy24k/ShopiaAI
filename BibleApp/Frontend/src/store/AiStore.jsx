import { create } from 'zustand';
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAiStore = create((set, get) => ({
  // State
  verseToExplain: [],
  loading: false,
  error: null,
  messages: [], // Historial unificado de mensajes [{role: 'user'|'assistant', content: string}]
  currentResponse: '', // Respuesta actual en streaming

  // Actions
  setVerseToExplain: (verses) => set({ verseToExplain: verses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], currentResponse: '' }),
  
  // Agregar mensaje al historial
  addMessage: (role, content) => set((state) => ({
    messages: [...state.messages, { role, content, timestamp: Date.now() }]
  })),

  // Función unificada para enviar mensajes (botones y preguntas)
  sendMessage: async (message, messageType = 'question') => {
    try {
      const { messages, addMessage, verseToExplain } = get();
      
      // Agregar mensaje al historial según el tipo
      if (messageType === 'button') {
        // Mensaje de botón: agregar como mensaje del sistema/asistente
        addMessage('assistant', message);
      } else {
        // Pregunta de usuario: agregar como mensaje del usuario
        addMessage('user', message);
      }
      
      set({ loading: true, error: null, currentResponse: '' });
      
      // Preparar historial para enviar al backend (últimos 10 mensajes para contexto)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      // Preparar contexto de versículos
      const verseContext = verseToExplain?.length > 0 ? {
        verses: verseToExplain.map(v => ({
          verse: v.content,
          verseNumber: v.verseNumber
        })),
        bookName: verseToExplain[0]?.bookName,
        chapter: verseToExplain[0]?.chapterNumber,
        translationValue: verseToExplain[0]?.translationValue,
        bookId: verseToExplain[0]?.bookId
      } : null;
      
      const response = await fetch(`${BASE_URL}/ai/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          messageType,
          verseContext,
          conversationHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      set({ loading: false });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        set({ currentResponse: fullResponse });
      }
      
      // Agregar respuesta completa al historial
      addMessage('assistant', fullResponse);
      set({ currentResponse: '' });
      
    } catch (error) {
      console.error('❌ Error en sendMessage:', error);
      set({ error: 'Error al procesar el mensaje', loading: false });
    }
  },

  // Funciones para compatibilidad con el frontend existente
  explainVerse: async (verseData, type) => {
    const { verseToExplain } = get();
    
    // Construir mensaje de botón en formato especial
    const buttonMessage = `Explicación solicitada: ${type} para ${verseToExplain?.map(v => `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`).join(', ') || 'versículo seleccionado'}`;
    
    // Usar la función unificada
    await get().sendMessage(buttonMessage, 'button');
  },

  askQuestion: async (question, verseContext) => {
    // Usar la función unificada
    await get().sendMessage(question, 'question');
  }
}));

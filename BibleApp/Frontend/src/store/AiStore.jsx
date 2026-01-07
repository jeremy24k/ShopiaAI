import { create } from 'zustand';
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAiStore = create((set, get) => ({
  // State
  explanation: '',
  verseToExplain: [],
  loading: false,
  error: null,
  messages: [], // Historial de mensajes [{role: 'user'|'assistant', content: string}]
  currentResponse: '', // Respuesta actual en streaming

  // Actions
  setExplanation: (explanation) => set({ explanation }),
  setVerseToExplain: (verses) => set({ verseToExplain: verses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], currentResponse: '', explanation: '' }),
  
  // Agregar mensaje al historial
  addMessage: (role, content) => set((state) => ({
    messages: [...state.messages, { role, content, timestamp: Date.now() }]
  })),

  explainVerse: async (verseData, type) => {
    try {
      set({ loading: true, error: null, explanation: '' });
      
      // Determinar si es un array (múltiples versículos) o un objeto (versículo único)
      const isMultiple = Array.isArray(verseData);
      
      // Construir el body según el tipo de datos
      let requestBody;
      if (isMultiple) {
        // Múltiples versículos: enviar array con todos los datos
        const firstVerse = verseData[0];
        requestBody = {
          verses: verseData.map(v => ({
            verse: v.content,
            verseNumber: v.verseNumber
          })),
          bookName: firstVerse.bookName,
          chapter: firstVerse.chapterNumber,
          type: type,
          translationValue: firstVerse.translationValue,
          bookId: firstVerse.bookId,
          isMultiple: true
        };
      } else {
        // Versículo único: mantener estructura original
        requestBody = {
          verse: verseData.content,
          bookName: verseData.bookName,
          chapter: verseData.chapterNumber,
          verseNumber: verseData.verseNumber,
          type: type,
          translationValue: verseData.translationValue,
          bookId: verseData.bookId,
          isMultiple: false
        };
      }
      
      const response = await fetch(`${BASE_URL}/ai/explain-verse-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      set({ loading: false }); // Change to streaming mode
      
      // Read text stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode chunk and add to explanation
        const chunk = decoder.decode(value, { stream: true });
        set((state) => ({ explanation: state.explanation + chunk }));
      }
      
    } catch (error) {
      console.error('❌ Error en streaming:', error);
      set({ error: 'Error al explicar el versículo', loading: false });
    }
  },

  // Función para preguntas libres tipo chat con historial
  askQuestion: async (question, verseContext) => {
    try {
      const { messages, addMessage } = get();
      
      // Agregar mensaje del usuario al historial
      addMessage('user', question);
      
      set({ loading: true, error: null, currentResponse: '' });
      
      // Preparar historial para enviar al backend (últimos 10 mensajes para contexto)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const response = await fetch(`${BASE_URL}/ai/ask-question-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          conversationHistory,
          verseContext: verseContext ? {
            verses: verseContext.map(v => ({
              verse: v.content,
              verseNumber: v.verseNumber
            })),
            bookName: verseContext[0]?.bookName,
            chapter: verseContext[0]?.chapterNumber,
            translationValue: verseContext[0]?.translationValue,
            bookId: verseContext[0]?.bookId
          } : null
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
      console.error('❌ Error en pregunta:', error);
      set({ error: 'Error al procesar la pregunta', loading: false });
    }
  }
}));

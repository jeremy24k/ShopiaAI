import { create } from 'zustand';
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAiStore = create((set) => ({
  // State
  explanation: '',
  verseToExplain: [],
  currentVerse: null,
  loading: false,
  error: null,

  // Actions
  setExplanation: (explanation) => set({ explanation }),
  setVerseToExplain: (verse) => set({ verseToExplain: verse }),
  setCurrentVerse: (verse) => set({ currentVerse: verse }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  explainVerse: async (verse, type) => {
    try {
      set({ loading: true, error: null, explanation: '' });
      
      const response = await fetch(`${BASE_URL}/ai/explain-verse-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verse: verse.content,
          bookName: verse.bookName,
          chapter: verse.chapterNumber,
          verseNumber: verse.verseNumber,
          type: type,
          translationValue: verse.translationValue,
          bookId: verse.bookId
        }),
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
  }
}));

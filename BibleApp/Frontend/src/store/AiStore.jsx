import { create } from 'zustand';
import supabase from '../supabase/supabase';
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAiStore = create((set, get) => ({
  // State
  verseToExplain: [],
  loading: false,
  error: null,
  messages: [], // Historial unificado de mensajes [{role: 'user'|'assistant', content: string}]
  currentResponse: '', // Respuesta actual en streaming
  currentConversationId: null, // ID de la conversación activa
  conversations: [], // Lista de conversaciones del usuario
  loadingConversations: false,
  userId: null,
  abortController: null,

  // Actions
  setVerseToExplain: (verses) => set({ verseToExplain: verses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], currentResponse: '' }),
  setCurrentConversationId: (conversationId) => set({ currentConversationId: conversationId }),
  setLoadingConversations: (loadingConversations) => set({ loadingConversations }),
  setConversations: (conversations) => set({ conversations }),
  setUserId: (userId) => set({ userId }),

  cancelResponse: () => {
    const { abortController, loading } = get();
    
    if (abortController && loading) {
      abortController.abort();
      console.log('⏹️ Respuesta cancelada por el usuario');
      
      // Si había una respuesta parcial, agregarla al historial
      const { currentResponse, messages } = get();
      if (currentResponse && currentResponse.trim().length > 0) {
        // Agregar la respuesta parcial como mensaje
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          // Encontrar el modeId y doctrineId del último mensaje
          const { modeId, doctrineId } = lastMessage;
          // Usar setTimeout para evitar problemas de estado
          setTimeout(() => {
            get().addMessage('assistant', `${currentResponse} [Respuesta interrumpida]`, modeId, doctrineId, null);
          }, 0);
        }
      }
      
      set({ 
        loading: false, 
        currentResponse: '',
        abortController: null 
      });
    }
  },

  // Agregar mensaje al historial
  addMessage: async (role, content, modeId, doctrineId, verseContext = null) => {
    const { currentConversationId, saveMessage, userId } = get();
    
    const message = { 
      id: crypto.randomUUID(), 
      role, 
      content, 
      modeId, 
      doctrineId, 
      verseContext, 
      timestamp: Date.now() 
    };
    
    // Agregar al estado local (siempre se hace)
    set((state) => ({
      messages: [...state.messages, message]
    }));
    
    // Solo guardar en DB si hay usuario autenticado
    if (userId) {
      // Si no hay conversación activa, crear una
      if (!currentConversationId) {
        await get().createConversation();
      }
      
      await saveMessage(message);
    } else {
      console.log('📝 Mensaje guardado solo en memoria (usuario no autenticado)');
    }
  },

  // Función unificada para enviar mensajes (CORREGIDA)
  sendMessage: async (message, messageType = 'question', modeId = 'personal', doctrineId = 'evangelical', language = 'es') => {
    try {
      const { messages, addMessage, verseToExplain, userId, cancelResponse } = get();
      
      // ⚠️ IMPORTANTE: Cancelar cualquier respuesta en curso antes de empezar nueva
      cancelResponse();
      
      // Agregar mensaje al historial según el tipo
      if (messageType === 'button') {
        await addMessage('assistant', message, modeId, doctrineId, null);
      } else {
        await addMessage('user', message, modeId, doctrineId, verseToExplain);
      }
      
      // Crear nuevo AbortController para esta request
      const abortController = new AbortController();
      set({ 
        loading: true, 
        error: null, 
        currentResponse: '',
        abortController 
      });
      
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
          conversationHistory,
          modeId,
          doctrineId,
          language
        }),
        signal: abortController.signal
      });

      console.log('🌍 Idioma enviado al backend:', language);
      console.log('🎯 Parámetros enviados:', { modeId, doctrineId, language });
      console.log('👤 Estado usuario:', userId ? 'Autenticado' : 'No autenticado');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          set({ currentResponse: fullResponse });
        }
        
        // ✅ SOLO si llegamos aquí (respuesta completa), agregar al historial
        await addMessage('assistant', fullResponse, modeId, doctrineId, null);
        
      } catch (readError) {
        // Verificar si fue cancelación
        if (readError.name === 'AbortError') {
          console.log('Stream interrumpido por cancelación');
          // La cancelResponse ya manejó todo, solo salir
          return;
        }
        throw readError;
      } finally {
        // ✅ SIEMPRE limpiar estos estados
        set({ 
          loading: false, 
          currentResponse: '',
          abortController: null 
        });
      }
      
    } catch (error) {
      // Solo mostrar error si no fue una cancelación
      if (error.name !== 'AbortError') {
        console.error('❌ Error en sendMessage:', error);
        set({ 
          error: 'Error al procesar el mensaje', 
          loading: false,
          abortController: null,
          currentResponse: ''
        });
      }
    }
  },

  // Manejo de conversaciones con la db (solo para usuarios autenticados)
  createConversation: async () => {
    const { userId } = get();
    
    if (!userId) {
      console.log('⚠️ No se crea conversación en DB (usuario no autenticado)');
      return null;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear conversación:', error);
      return null;
    }

    set({ currentConversationId: data.id });
    return data.id;
  },

  saveMessage: async (message) => {
    const { currentConversationId, userId } = get();
    
    if (!userId) {
      console.log('⚠️ No se guarda mensaje en DB (usuario no autenticado)');
      return;
    }
    
    if (!currentConversationId) {
      console.error('No hay conversationId para guardar mensaje');
      return;
    }

    await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: currentConversationId,
        role: message.role,
        content: message.content,
        mode_id: message.modeId,
        doctrine_id: message.doctrineId,
        verse_context: message.verseContext
      });
  },

  loadConversations: async () => {
    const { userId } = get();
    
    if (!userId) {
      console.log('📂 No se cargan conversaciones (usuario no autenticado)');
      set({ conversations: [] });
      return;
    }
    
    set({ loadingConversations: true });
    
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    set({ conversations: data || [], loadingConversations: false });
  },

  loadSingleConversation: async (conversationId) => {
    const { userId } = get();
    
    if (!userId) {
      console.log('📄 No se puede cargar conversación (usuario no autenticado)');
      return;
    }
    
    const { data } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    set({ 
      currentConversationId: conversationId,
      messages: data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        modeId: msg.mode_id,
        doctrineId: msg.doctrine_id,
        verseContext: msg.verse_context,
        timestamp: new Date(msg.created_at).getTime()
      }))
    });
  },

  deleteConversation: async (conversationId) => {
    const { userId } = get();
    
    if (!userId) {
      console.log('🗑️ No se puede eliminar conversación (usuario no autenticado)');
      return;
    }
    
    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    // Actualizar lista
    const { conversations } = get();
    set({ 
      conversations: conversations.filter(c => c.id !== conversationId)
    });
  },

  // Funciones para compatibilidad con el frontend existente
  explainVerse: async (verseData, type, modeId = 'personal', doctrineId = 'evangelical', language = 'es') => {
    const { verseToExplain } = get();
    
    // Construir mensaje de botón en formato especial
    const buttonMessage = `Explicación solicitada: ${type} para ${verseToExplain?.map(v => `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`).join(', ') || 'versículo seleccionado'}`;
    
    await get().sendMessage(buttonMessage, 'button', modeId, doctrineId, language);
  },

  askQuestion: async (question, verseContext, modeId = 'personal', doctrineId = 'evangelical', language = 'es') => {
    await get().sendMessage(question, 'question', modeId, doctrineId, language);
  },

  // Nueva función para limpiar conversación de memoria (sin usuario)
  clearLocalConversation: () => {
    set({ 
      messages: [], 
      currentResponse: '', 
      currentConversationId: null,
      verseToExplain: [],
      abortController: null, // ⚠️ También limpiar abortController
      loading: false // ⚠️ Asegurar que no quede en loading
    });
    console.log('🧹 Conversación local limpiada');
  }
}));
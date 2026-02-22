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
  loadingMessages: false, // Estado de carga para mensajes de conversación
  userId: null,
  abortController: null,

  // AI Mode and Doctrine state
  modeId: 'personal', // Modo actual seleccionado
  doctrineId: 'evangelical', // Doctrina actual seleccionada
  availableModes: [], // Modos disponibles desde la API
  availableDoctrines: [], // Doctrinas disponibles desde la API
  loadingOptions: false, // Estado de carga de opciones

  // Actions
  setVerseToExplain: (verses) => set({ verseToExplain: verses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], currentResponse: '' }),
  setCurrentConversationId: (conversationId) => set({ currentConversationId: conversationId }),
  setLoadingConversations: (loadingConversations) => set({ loadingConversations }),
  setConversations: (conversations) => set({ conversations }),
  setUserId: (userId) => set({ userId }),

  // Mode and Doctrine actions
  setModeId: (modeId) => set({ modeId }),
  setDoctrineId: (doctrineId) => set({ doctrineId }),

  // Cargar opciones disponibles desde la API
  loadAvailableOptions: async () => {
    set({ loadingOptions: true });

    try {
      const [modesResponse, doctrinesResponse] = await Promise.all([
        fetch(`${BASE_URL}/ai/modes`),
        fetch(`${BASE_URL}/ai/perspectives`)
      ]);

      if (modesResponse.ok && doctrinesResponse.ok) {
        const modes = await modesResponse.json();
        const doctrines = await doctrinesResponse.json();

        set({
          availableModes: modes.data,
          availableDoctrines: doctrines.data,
          loadingOptions: false
        });
      } else {
        console.error('Error al cargar opciones de AI');
        set({ loadingOptions: false });
      }
    } catch (error) {
      console.error('Error al cargar opciones:', error);
      set({ loadingOptions: false });
    }
  },

  cancelResponse: () => {
    const { abortController, loading, currentResponse, messages } = get();

    if (abortController && loading) {
      abortController.abort();
      console.log('⏹️ Respuesta cancelada por el usuario');

      // Obtener modeId y doctrineId del último mensaje de usuario
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      const modeId = lastUserMessage?.modeId || 'personal_guide';
      const doctrineId = lastUserMessage?.doctrineId || 'evangelical';

      // Solo agregar si hay contenido significativo
      if (currentResponse && currentResponse.trim().length > 50) {
        get().addMessage('assistant', `${currentResponse}\n\n[Respuesta interrumpida]`, modeId, doctrineId, null);
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
    // ✅ Obtener userId fresco del store cada vez
    let { currentConversationId, saveMessage, userId } = get();

    console.log('📨 addMessage llamado:', { role, userId, currentConversationId });

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

    // ✅ Volver a obtener userId por si se actualizó mientras tanto
    userId = get().userId;

    // Solo guardar en DB si hay usuario autenticado
    if (userId) {
      console.log('✅ Usuario autenticado, intentando guardar en DB');
      // ✅ ESPERAR a que se cree la conversación ANTES de guardar
      let conversationId = currentConversationId;
      if (!conversationId) {
        console.log('🔄 No hay conversationId, creando nueva conversación...');
        conversationId = await get().createConversation();
        console.log('✅ Conversación creada:', conversationId);
      }

      // ✅ Verificar que la conversación existe antes de guardar
      if (conversationId) {
        await saveMessage(message);
      } else {
        console.error('❌ No se pudo crear conversación, mensaje no guardado');
      }
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
          language,
          userId
        }),
        signal: abortController.signal
      });

      console.log('🌍 Idioma enviado al backend:', language);
      console.log('🎯 Parámetros enviados:', { modeId, doctrineId, language });
      console.log('👤 Estado usuario:', userId ? 'Autenticado' : 'No autenticado');
      
      if (!response.ok) {
        // Manejar error de créditos insuficientes
        if (response.status === 402) {
          const errorData = await response.json();
          set({ 
            error: 'insufficient_credits',
            loading: false,
            currentResponse: '',
            abortController: null 
          });
          return { 
            error: 'insufficient_credits', 
            data: errorData 
          };
        }
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

        // ✅ SOLO agregar si NO fue cancelado y NO está ya en messages
        const { messages: currentMessages } = get();
        const isDuplicate = currentMessages.some(m =>
          m.role === 'assistant' && m.content === fullResponse
        );

        if (!isDuplicate) {
          // ✅ Limpiar currentResponse ANTES de agregar para evitar duplicación visual
          set({ currentResponse: '' });
          await addMessage('assistant', fullResponse, modeId, doctrineId, null);
        }

      } catch (readError) {
        if (readError.name === 'AbortError') {
          console.log('Stream interrumpido por cancelación');
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

    console.log('🔨 createConversation llamado con userId:', userId);

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
      console.error('❌ Error al crear conversación:', error);
      return null;
    }

    console.log('✅ Conversación creada exitosamente:', data.id);
    set({ currentConversationId: data.id });

    return data.id;
  },

  saveMessage: async (message) => {
    const { currentConversationId, userId } = get();

    console.log('💬 saveMessage llamado con userId y conversationId:', { userId, currentConversationId });

    if (!userId) {
      console.log('⚠️ No se guarda mensaje en DB (usuario no autenticado)');
      return { success: false, error: 'No authenticated' };
    }

    if (!currentConversationId) {
      console.error('❌ No hay conversationId para guardar mensaje');
      return { success: false, error: 'No conversation ID' };
    }

    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: currentConversationId,
        role: message.role,
        content: message.content,
        mode_id: message.modeId,
        doctrine_id: message.doctrineId,
        verse_context: message.verseContext
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando mensaje:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Mensaje guardado exitosamente:', data.id);
    return { success: true, data };
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
    const { userId, abortController } = get();

    if (!userId) {
      console.log('📄 No se puede cargar conversación (usuario no autenticado)');
      return;
    }

    // ✅ Cancelar cualquier streaming activo
    if (abortController) {
      abortController.abort();
    }

    // ✅ Activar loading y limpiar estado antes de cargar
    set({
      loadingMessages: true,
      loading: false,
      currentResponse: '',
      abortController: null,
      error: null
    });

    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error cargando conversación:', error);
      set({ error: 'Error al cargar conversación', loadingMessages: false });
      return;
    }

    const lastMessage = data && data.length > 0 ? data[data.length - 1] : null;
    const restoredModeId = lastMessage?.mode_id || 'personal_guide';
    const restoredDoctrineId = lastMessage?.doctrine_id || 'evangelical';

    set({
      currentConversationId: conversationId,
      modeId: restoredModeId,
      doctrineId: restoredDoctrineId,
      verseToExplain: Array.from(
        new Map(
          data
            .flatMap(msg =>
              msg.verse_context && Array.isArray(msg.verse_context)
                ? msg.verse_context
                : []
            )
            .map(verse => [verse.verseKey, verse])
        ).values()
      ),
      messages: data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        modeId: msg.mode_id,
        doctrineId: msg.doctrine_id,
        verseContext: msg.verse_context,
        timestamp: new Date(msg.created_at).getTime()
      })),
      loadingMessages: false // ✅ Desactivar loading después de cargar
    });

    console.log('✅ Conversación cargada:', conversationId);
  },

  deleteConversation: async (conversationId) => {
    const { userId, conversations, currentConversationId } = get();

    if (!userId) {
      console.log('🗑️ No se puede eliminar conversación (usuario no autenticado)');
      return;
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('❌ Error eliminando conversación:', error);
      return;
    }

    // ✅ Usar get() para acceder a la función
    if (conversationId === currentConversationId) {
      get().clearLocalConversation();
    }

    set({
      conversations: conversations.filter(c => c.id !== conversationId)
    });

    console.log('✅ Conversación eliminada:', conversationId);
  },

  // Funciones para eliminar versículos del contexto de forma persistente
  removeVerseFromContext: async (verseToRemove) => {
    const { verseToExplain, currentConversationId } = get();

    const updatedVerses = verseToExplain.filter(v =>
      !(v.bookName === verseToRemove.bookName &&
        v.chapterNumber === verseToRemove.chapterNumber &&
        v.verseNumber === verseToRemove.verseNumber)
    );

    set({ verseToExplain: updatedVerses });

    if (currentConversationId) {
      await get().updateVerseContextInDB(updatedVerses);
    }
  },

  removeBookFromContext: async (bookName) => {
    const { verseToExplain, currentConversationId } = get();

    const updatedVerses = verseToExplain.filter(v => v.bookName !== bookName);
    set({ verseToExplain: updatedVerses });

    if (currentConversationId) {
      await get().updateVerseContextInDB(updatedVerses);
    }
  },

  clearAllContext: async () => {
    const { currentConversationId } = get();

    set({ verseToExplain: [] });

    if (currentConversationId) {
      await get().updateVerseContextInDB([]);
    }
  },

  updateVerseContextInDB: async (updatedVerses) => {
    const { currentConversationId, userId } = get();

    if (!userId) {
      console.warn('⚠️ No hay usuario autenticado');
      return;
    }

    if (!currentConversationId) {
      console.warn('⚠️ No hay conversación activa para actualizar');
      return;
    }

    // ✅ Validar que updatedVerses sea un array
    if (!Array.isArray(updatedVerses)) {
      console.error('❌ updatedVerses debe ser un array');
      return;
    }

    const { data: messages, error: fetchError } = await supabase
      .from('conversation_messages')
      .select('id, verse_context')
      .eq('conversation_id', currentConversationId);

    if (fetchError) {
      console.error('❌ Error al obtener mensajes:', fetchError);
      return;
    }

    if (!messages || messages.length === 0) {
      console.log('⚠️ No hay mensajes para actualizar');
      return;
    }

    const messagesToUpdate = messages.filter(msg =>
      msg.verse_context && Array.isArray(msg.verse_context) && msg.verse_context.length > 0
    );

    if (messagesToUpdate.length === 0) {
      console.log('⚠️ No hay mensajes con contexto de versículos');
      return;
    }

    const updates = messagesToUpdate.map(async (msg) => {
      const filteredContext = msg.verse_context.filter(verse =>
        updatedVerses.some(v =>
          v.bookName === verse.bookName &&
          v.chapterNumber === verse.chapterNumber &&
          v.verseNumber === verse.verseNumber
        )
      );

      const valueToSave = filteredContext.length > 0 ? filteredContext : null;

      const { data, error } = await supabase
        .from('conversation_messages')
        .update({ verse_context: valueToSave })
        .eq('id', msg.id)
        .select();

      return { data, error };
    });

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('❌ Errores en actualizaciones:', errors);
    } else {
      console.log('✅ Contexto actualizado exitosamente');
    }
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

  // Limpia la conversación local (mensajes, id, contexto). La URL es la fuente de verdad: al estar en /ai sin id, AI.jsx llama esto.
  clearLocalConversation: () => {
    set({
      messages: [],
      currentResponse: '',
      currentConversationId: null,
      modeId: 'personal',
      doctrineId: 'evangelical',
      verseToExplain: [],
      abortController: null,
      loading: false,
      loadingMessages: false
    });
    console.log('🧹 Conversación local limpiada');
  }
}));
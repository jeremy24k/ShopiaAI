import { create } from 'zustand';
import supabase from '../supabase/supabase';
import Logger from '../utils/logger.js';
import { useBooksStore } from './BooksStore';
const log = Logger.create('AiStore');
const BASE_URL = import.meta.env.VITE_API_URL;

export const useAiStore = create((set, get) => ({
  // State
  verseToExplain: [],
  loading: false,
  error: null,
  messages: [], // Historial unificado de mensajes [{role: 'user'|'assistant', content: string}]
  currentResponse: '', // Respuesta actual en streaming
  sendingMessage: null, // Mensaje temporal mientras se verifica créditos
  creditErrorData: null, // Datos del error de créditos insuficientes
  currentConversationId: null, // ID de la conversación activa
  conversations: [], // Lista de conversaciones del usuario
  loadingConversations: false,
  loadingMore: false, // Estado de carga para paginación
  hasMoreConversations: true, // Indica si hay más conversaciones por cargar
  conversationsPage: 0, // Página actual de conversaciones
  loadingMessages: false, // Estado de carga para mensajes de conversación
  userId: null,
  abortController: null,

  // AI Mode and Doctrine state
  modeId: localStorage.getItem('sophia_ai_mode') || 'personal_guide', // Modo actual seleccionado
  doctrineId: localStorage.getItem('sophia_ai_doctrine') || 'evangelical', // Doctrina actual seleccionada
  availableModes: [], // Modos disponibles desde la API
  availableDoctrines: [], // Doctrinas disponibles desde la API
  aiCosts: {}, // Costos de acciones de IA
  loadingOptions: false, // Estado de carga de opciones

  // Demo mode state
  demoQuestionsUsed: parseInt(localStorage.getItem('sophia_demo_count') || '0'),
  demoQuestionLimit: 3,
  showDemoLimitModal: false,

  // Actions
  setVerseToExplain: (verses) => set({ verseToExplain: verses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentConversationId: (conversationId) => set({ currentConversationId: conversationId }),
  setLoadingConversations: (loadingConversations) => set({ loadingConversations }),
  setConversations: (conversations) => set({ conversations }),
  setUserId: (userId) => set({ userId }),

  // Mode and Doctrine actions
  setModeId: (modeId) => {
    localStorage.setItem('sophia_ai_mode', modeId);
    set({ modeId });
  },
  setDoctrineId: (doctrineId) => {
    localStorage.setItem('sophia_ai_doctrine', doctrineId);
    set({ doctrineId });
  },

  // Cargar opciones disponibles desde la API
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

        log.debug(modes.data);  

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
  },

  cancelResponse: () => {
    const { abortController, loading, currentResponse, messages } = get();

    if (abortController && loading) {
      abortController.abort();
      log.debug('⏹️ Respuesta cancelada por el usuario');

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

    log.debug('📨 addMessage llamado:', { role, userId, currentConversationId });

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
      log.debug('✅ Usuario autenticado, intentando guardar en DB');
      // ✅ ESPERAR a que se cree la conversación ANTES de guardar
      let conversationId = currentConversationId;
      if (!conversationId) {
        log.debug('🔄 No hay conversationId, creando nueva conversación...');
        conversationId = await get().createConversation();
        log.debug('✅ Conversación creada:', conversationId);
      }

      // ✅ Verificar que la conversación existe antes de guardar
      if (conversationId) {
        await saveMessage(message, conversationId);
      } else {
        log.error('❌ No se pudo crear conversación, mensaje no guardado');
      }
    } else {
      log.debug('📝 Mensaje guardado solo en memoria (usuario no autenticado)');
    }
  },

  // Función unificada para enviar mensajes (CORREGIDA)
  sendMessage: async (message, messageType = 'question', modeId = 'personal_guide', doctrineId = 'evangelical', language = 'es') => {
    try {
      if (get().loading) return;

      const { messages, addMessage, verseToExplain, userId, cancelResponse, demoQuestionsUsed, demoQuestionLimit } = get();
      const isDemoMode = !userId;

      // Demo mode: check question limit
      if (isDemoMode && demoQuestionsUsed >= demoQuestionLimit) {
        set({ showDemoLimitModal: true });
        return;
      }

      cancelResponse();

      const abortController = new AbortController();
      set({
        loading: true,
        error: null,
        currentResponse: '',
        abortController,
        sendingMessage: {
          role: 'user',
          content: message,
          modeId,
          doctrineId,
          verseContext: verseToExplain
        }
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
          verseNumber: v.verseNumber,
          bookId: v.bookId,
          translation: v.translationValue,
          chapter: v.chapterNumber
        })),
        bookName: verseToExplain[0]?.bookName,
        chapter: verseToExplain[0]?.chapterNumber,
        translationValue: verseToExplain[0]?.translationValue,
        bookId: verseToExplain[0]?.bookId
      } : null;

      const globalTranslation = useBooksStore.getState().selectedTranslation?.value;

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
          userId,
          globalTranslation,
          isDemoMode
        }),
        signal: abortController.signal
      });

      log.debug('🌍 Idioma enviado al backend:', language);
      log.debug('🎯 Parámetros enviados:', { modeId, doctrineId, language, isDemoMode });
      log.debug('👤 Estado usuario:', userId ? 'Autenticado' : `Demo (${demoQuestionsUsed + 1}/${demoQuestionLimit})`);
      
      if (!response.ok) {
        // Demo mode: don't redirect to login on 401
        if (response.status === 401 && isDemoMode) {
          set({
            sendingMessage: null,
            error: 'demo_auth_error',
            loading: false,
            currentResponse: '',
            abortController: null
          });
          return { error: 'demo_auth_error' };
        }
        // Manejar error de autenticación requerida
        if (response.status === 401) {
          set({
            sendingMessage: null,
            error: 'authentication_required',
            loading: false,
            currentResponse: '',
            abortController: null
          });
          return { error: 'authentication_required' };
        }
        // Manejar error de créditos insuficientes
        if (response.status === 402) {
          const errorData = await response.json();

          // Eliminar mensaje temporal sin agregarlo al historial
          set({ 
            sendingMessage: null,
            error: 'insufficient_credits',
            creditErrorData: errorData, // Guardar datos del error
            loading: false,
            currentResponse: '',
            abortController: null 
          });
          return { 
            error: 'insufficient_credits', 
            data: errorData 
          };
        }
        if (response.status === 429) {
          set({
            error: 'too_many_requests',
            loading: false,
            currentResponse: '',
            abortController: null
          });
          return { error: 'too_many_requests' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Si la petición fue exitosa, agregar mensaje al historial
      await addMessage('user', message, modeId, doctrineId, verseToExplain);
      set({ sendingMessage: null }); // Limpiar mensaje temporal

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
          // ✅ Limpiar loading y currentResponse ANTES de agregar para evitar flash de loading
          set({ 
            loading: false,
            currentResponse: '',
            abortController: null
          });
          await addMessage('assistant', fullResponse, modeId, doctrineId, null);

          // ✅ Demo mode: increment question counter after successful response
          if (isDemoMode) {
            const newCount = get().demoQuestionsUsed + 1;
            localStorage.setItem('sophia_demo_count', String(newCount));
            set({ demoQuestionsUsed: newCount });
            log.debug(`🎮 Demo question ${newCount}/${demoQuestionLimit} used`);
          }
        }

      } catch (readError) {
        if (readError.name === 'AbortError') {
          log.debug('Stream interrumpido por cancelación');
          return;
        }
        throw readError;
      } finally {
        // ✅ SIEMPRE limpiar estos estados (por si hubo error o duplicado)
        set({
          loading: false,
          currentResponse: '',
          abortController: null
        });
      }

    } catch (error) {
      // Solo mostrar error si no fue una cancelación
      if (error.name !== 'AbortError') {
        log.error('❌ Error en sendMessage:', error);
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

    log.debug('🔨 createConversation llamado con userId:', userId);

    if (!userId) {
      log.debug('⚠️ No se crea conversación en DB (usuario no autenticado)');
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
      log.error('❌ Error al crear conversación:', error);
      return null;
    }

    log.debug('✅ Conversación creada exitosamente:', data.id);
    set({ currentConversationId: data.id });

    return data.id;
  },

  saveMessage: async (message, conversationId = null) => {
    const { currentConversationId, userId } = get();
    const finalConversationId = conversationId || currentConversationId;

    log.debug('💬 saveMessage llamado con userId y conversationId:', { userId, conversationId: finalConversationId });

    if (!userId) {
      log.debug('⚠️ No se guarda mensaje en DB (usuario no autenticado)');
      return { success: false, error: 'No authenticated' };
    }

    if (!finalConversationId) {
      log.error('❌ No hay conversationId para guardar mensaje');
      return { success: false, error: 'No conversation ID' };
    }

    // 🔍 DEBUGGING: Verificar sesión de Supabase
    const { data: { session } } = await supabase.auth.getSession();
    log.debug('🔐 Sesión de Supabase:', {
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      storeUserId: userId,
      match: session?.user?.id === userId
    });

    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: finalConversationId,
        role: message.role,
        content: message.content,
        mode_id: message.modeId,
        doctrine_id: message.doctrineId,
        verse_context: message.verseContext
      })
      .select()
      .single();

    if (error) {
      log.error('❌ Error guardando mensaje:', error);
      return { success: false, error: error.message };
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', finalConversationId);

    log.debug('✅ Mensaje guardado exitosamente:', data.id);
    return { success: true, data };
  },

  loadConversations: async (reset = false) => {
    const { userId, conversations, conversationsPage, hasMoreConversations, loadingConversations, loadingMore } = get();

    if (!userId) {
      log.debug('📂 No se cargan conversaciones (usuario no autenticado)');
      set({ conversations: [], hasMoreConversations: false });
      return;
    }

    // ✅ Prevenir llamadas concurrentes
    if (loadingConversations || loadingMore) {
      log.debug('⏸️ Ya hay una carga en progreso, ignorando llamada');
      return;
    }

    // Si es reset, reiniciar paginación
    if (reset) {
      set({ 
        loadingConversations: true, 
        conversationsPage: 0, 
        hasMoreConversations: true,
        conversations: [] 
      });
    } else {
      // Si no hay más conversaciones, no hacer nada
      if (!hasMoreConversations) {
        log.debug('📂 No hay más conversaciones por cargar');
        return;
      }
      set({ loadingMore: true });
    }

    const CONVERSATIONS_PER_PAGE = 20;
    const currentPage = reset ? 0 : conversationsPage;
    const from = currentPage * CONVERSATIONS_PER_PAGE;
    const to = from + CONVERSATIONS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (error) {
      log.error('❌ Error cargando conversaciones:', error);
      set({ loadingConversations: false, loadingMore: false });
      return;
    }

    const newConversations = data || [];
    const hasMore = newConversations.length === CONVERSATIONS_PER_PAGE;

    set({ 
      conversations: reset ? newConversations : [...conversations, ...newConversations],
      conversationsPage: currentPage + 1,
      hasMoreConversations: hasMore,
      loadingConversations: false,
      loadingMore: false
    });
  },

  loadSingleConversation: async (conversationId) => {
    const { userId, abortController } = get();

    if (!userId) {
      return { notFound: false }; // No redirigir; se reintentará cuando cargue el usuario
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

    // ✅ Verificar que la conversación existe en la tabla conversations (evita FK al guardar mensajes)
    const { data: convRow, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (convError || !convRow) {
      log.warn('📄 Conversación no encontrada o no pertenece al usuario:', conversationId);
      set({ loadingMessages: false, currentConversationId: null, messages: [] });
      return { notFound: true };
    }

    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      log.error('❌ Error cargando conversación:', error);
      set({ error: 'Error al cargar conversación', loadingMessages: false });
      return { notFound: false };
    }

    const lastMessage = data && data.length > 0 ? data[data.length - 1] : null;
    const restoredModeId = lastMessage?.mode_id || 'personal_guide';
    const restoredDoctrineId = lastMessage?.doctrine_id || 'evangelical';

    const verseContext = Array.from(
      new Map(
        data
          .flatMap(msg =>
            msg.verse_context && Array.isArray(msg.verse_context)
              ? msg.verse_context
              : []
          )
          .map(verse => [verse.verseKey, verse])
      ).values()
    );

    const messages = data.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      modeId: msg.mode_id,
      doctrineId: msg.doctrine_id,
      verseContext: msg.verse_context,
      timestamp: new Date(msg.created_at).getTime()
    }));

    set({
      currentConversationId: conversationId,
      modeId: restoredModeId,
      doctrineId: restoredDoctrineId,
      verseToExplain: verseContext,
      messages: messages,
      loadingMessages: false // ✅ Desactivar loading después de cargar
    });

    return { notFound: false };
  },

  deleteConversation: async (conversationId) => {
    const { userId, conversations, currentConversationId } = get();

    if (!userId) {
      log.debug('🗑️ No se puede eliminar conversación (usuario no autenticado)');
      return;
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      log.error('❌ Error eliminando conversación:', error);
      return;
    }

    // ✅ Usar get() para acceder a la función
    if (conversationId === currentConversationId) {
      get().clearLocalConversation();
    }

    // Filtrar conversación eliminada
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    set({ conversations: updatedConversations });

    log.debug('✅ Conversación eliminada:', conversationId);
  },

  // Funciones para eliminar versículos del contexto de forma persistente
  removeVerseFromContext: async (verseToRemove) => {
    const { verseToExplain, currentConversationId } = get();

    const updatedVerses = verseToExplain.filter(v =>
      !(v.bookName === verseToRemove.bookName &&
        v.chapterNumber === verseToRemove.chapterNumber &&
        v.verseNumber === verseToRemove.verseNumber &&
        v.translationValue === verseToRemove.translationValue)
    );

    set({ verseToExplain: updatedVerses });

    if (currentConversationId) {
      await get().updateVerseContextInDB(updatedVerses);
    }
  },

  removeBookFromContext: async ({ bookName, translationValue }) => {
    const { verseToExplain, currentConversationId } = get();

    const updatedVerses = verseToExplain.filter(v => 
        !(v.bookName === bookName && (v.translationValue || v.translation) === translationValue)
    );
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
      log.warn('⚠️ No hay usuario autenticado');
      return;
    }

    if (!currentConversationId) {
      log.warn('⚠️ No hay conversación activa para actualizar');
      return;
    }

    // ✅ Validar que updatedVerses sea un array
    if (!Array.isArray(updatedVerses)) {
      log.error('❌ updatedVerses debe ser un array');
      return;
    }

    const { data: messages, error: fetchError } = await supabase
      .from('conversation_messages')
      .select('id, verse_context')
      .eq('conversation_id', currentConversationId);

    if (fetchError) {
      log.error('❌ Error al obtener mensajes:', fetchError);
      return;
    }

    if (!messages || messages.length === 0) {
      log.debug('⚠️ No hay mensajes para actualizar');
      return;
    }

    const messagesToUpdate = messages.filter(msg =>
      msg.verse_context && Array.isArray(msg.verse_context) && msg.verse_context.length > 0
    );

    if (messagesToUpdate.length === 0) {
      log.debug('⚠️ No hay mensajes con contexto de versículos');
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
      log.error('❌ Errores en actualizaciones:', errors);
    } else {
      log.debug('✅ Contexto actualizado exitosamente');
    }
  },

  // Funciones para compatibilidad con el frontend existente
  explainVerse: async (verseData, type, modeId = 'personal_guide', doctrineId = 'evangelical', language = 'es') => {
    const { verseToExplain } = get();

    // Map labels based on language
    const labels = {
      es: {
        historicalContext: 'Contexto Histórico',
        dailyApplication: 'Aplicación Diaria',
        simpleExplanation: 'Explicación Sencilla',
        relatedVerses: 'Versículos Relacionados',
        originalLanguage: 'Idioma Original',
        studyPlan: 'Guía de Estudio',
        for: 'para',
        verses: 'versículos seleccionados'
      },
      en: {
        historicalContext: 'Historical Context',
        dailyApplication: 'Daily Application',
        simpleExplanation: 'Simple Explanation',
        relatedVerses: 'Related Verses',
        originalLanguage: 'Original Language',
        studyPlan: 'Study Plan',
        for: 'for',
        verses: 'selected verses'
      }
    };

    const currentLabels = labels[language] || labels.en;
    const typeLabel = currentLabels[type] || type;
    const forLabel = currentLabels.for;
    const versesLabel = currentLabels.verses;

    // Build a compact range string: "Proverbios 1:1-6; Ezequiel 1:1,3-8"
    const buildRangeStr = (verses) => {
      // Group by book → chapter → sorted verseNumbers
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
          // Collapse consecutive numbers into ranges
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

    const contextStr = verseToExplain?.length > 0
      ? buildRangeStr(verseToExplain)
      : versesLabel;

    const userMessage = `${typeLabel} ${forLabel} ${contextStr}`;

    // Send as 'user' and pass the button type
    await get().sendMessage(userMessage, 'button', modeId, doctrineId, language);
  },

  askQuestion: async (question, verseContext, modeId = 'personal_guide', doctrineId = 'evangelical', language = 'es') => {
    await get().sendMessage(question, 'question', modeId, doctrineId, language);
  },

  // Limpia la conversación local (mensajes, id, contexto). La URL es la fuente de verdad: al estar en /ai sin id, AI.jsx llama esto.
  clearLocalConversation: () => {
    set({
      messages: [],
      currentResponse: '',
      currentConversationId: null,
      modeId: localStorage.getItem('sophia_ai_mode') || 'personal_guide',
      doctrineId: localStorage.getItem('sophia_ai_doctrine') || 'evangelical',
      verseToExplain: [],
      abortController: null,
      loading: false,
      loadingMessages: false
    });
    log.debug('🧹 Conversación local limpiada');
  }
}));
import { create } from 'zustand';
import supabase from '../supabase/supabase';
import Logger from '../utils/logger.js';

const log = Logger.create('ConversationStore');

export const useConversationStore = create((set, get) => ({
  messages: [],
  currentConversationId: null,
  conversations: [],
  loadingConversations: false,
  loadingMore: false,
  hasMoreConversations: true,
  conversationsPage: 0,
  loadingMessages: false,
  userId: null,
  verseToExplain: [],

  setUserId: (userId) => set({ userId }),
  setCurrentConversationId: (conversationId) => set({ currentConversationId: conversationId }),
  setLoadingConversations: (loadingConversations) => set({ loadingConversations }),
  setConversations: (conversations) => set({ conversations }),
  setVerseToExplain: (verses) => set({ verseToExplain: verses }),

  addMessage: async (role, content, modeId, doctrineId, verseContext = null) => {
    let { currentConversationId, userId } = get();

    const message = {
      id: crypto.randomUUID(),
      role,
      content,
      modeId,
      doctrineId,
      verseContext,
      timestamp: Date.now()
    };

    set((state) => ({
      messages: [...state.messages, message]
    }));

    userId = get().userId;

    if (userId) {
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await get().createConversation();
      }

      if (conversationId) {
        await get().saveMessage(message, conversationId);
      }
    }
  },

  createConversation: async () => {
    const { userId } = get();

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      log.error('Error al crear conversación:', error);
      return null;
    }

    set({ currentConversationId: data.id });
    return data.id;
  },

  saveMessage: async (message, conversationId = null) => {
    const { currentConversationId, userId } = get();
    const finalConversationId = conversationId || currentConversationId;

    if (!userId || !finalConversationId) {
      return { success: false };
    }

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
      log.error('Error guardando mensaje:', error);
      return { success: false, error: error.message };
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', finalConversationId);

    return { success: true, data };
  },

  loadConversations: async (reset = false) => {
    const { userId, conversations, conversationsPage, hasMoreConversations, loadingConversations, loadingMore } = get();

    if (!userId) {
      set({ conversations: [], hasMoreConversations: false });
      return;
    }

    if (loadingConversations || loadingMore) {
      return;
    }

    if (reset) {
      set({ 
        loadingConversations: true, 
        conversationsPage: 0, 
        hasMoreConversations: true,
        conversations: [] 
      });
    } else {
      if (!hasMoreConversations) {
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
      log.error('Error cargando conversaciones:', error);
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
      return { notFound: false };
    }

    if (abortController) {
      abortController.abort();
    }

    set({
      loadingMessages: true,
      currentResponse: '',
      abortController: null,
      error: null
    });

    const { data: convRow, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (convError || !convRow) {
      log.warn('Conversación no encontrada:', conversationId);
      set({ loadingMessages: false, currentConversationId: null, messages: [] });
      return { notFound: true };
    }

    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      log.error('Error cargando conversación:', error);
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
      verseToExplain: verseContext,
      messages: messages,
      loadingMessages: false
    });

    return { notFound: false, restoredModeId, restoredDoctrineId };
  },

  deleteConversation: async (conversationId) => {
    const { userId, conversations, currentConversationId } = get();

    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      log.error('Error eliminando conversación:', error);
      return;
    }

    if (conversationId === currentConversationId) {
      get().clearLocalConversation();
    }

    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    set({ conversations: updatedConversations });
  },

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

    if (!userId || !currentConversationId) {
      return;
    }

    if (!Array.isArray(updatedVerses)) {
      return;
    }

    const { data: messages, error: fetchError } = await supabase
      .from('conversation_messages')
      .select('id, verse_context')
      .eq('conversation_id', currentConversationId);

    if (fetchError || !messages || messages.length === 0) {
      return;
    }

    const messagesToUpdate = messages.filter(msg =>
      msg.verse_context && Array.isArray(msg.verse_context) && msg.verse_context.length > 0
    );

    if (messagesToUpdate.length === 0) {
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

      return supabase
        .from('conversation_messages')
        .update({ verse_context: valueToSave })
        .eq('id', msg.id);
    });

    await Promise.all(updates);
  },

  clearLocalConversation: () => {
    const modeId = localStorage.getItem('sophia_ai_mode') || 'personal_guide';
    const doctrineId = localStorage.getItem('sophia_ai_doctrine') || 'ecumenical';

    set({
      messages: [],
      currentResponse: '',
      currentConversationId: null,
      modeId,
      doctrineId,
      verseToExplain: [],
      abortController: null,
      loading: false,
      loadingMessages: false
    });
  }
}));

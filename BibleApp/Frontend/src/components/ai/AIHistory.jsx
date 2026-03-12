import { useAiStore } from "../../store/AiStore";
import { useAuthStore } from "../../store/AuthStore";
import styles from '../../styles/AI.module.css';
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import Icon from "../ui/Icon";
import ConfirmationModal from "../ui/ConfirmationModal";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../ui/SkeletonLoader";
import { formatRelativeTime } from "../../utils/FormatTime";
import { Plus } from "lucide-react";

function AIHistory ({ currentConversationId, setShowHistorialSidebar, isVisible }) {
    // Individual selectors to prevent unnecessary re-renders
    const conversations = useAiStore(state => state.conversations);
    const loadConversations = useAiStore(state => state.loadConversations);
    const loadingConversations = useAiStore(state => state.loadingConversations);
    const loadingMore = useAiStore(state => state.loadingMore);
    const hasMoreConversations = useAiStore(state => state.hasMoreConversations);
    const deleteConversation = useAiStore(state => state.deleteConversation);
    const clearLocalConversation = useAiStore(state => state.clearLocalConversation);
    const user = useAuthStore(state => state.user);
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Refs
    const observerRef = useRef(null);
    const hasLoadedRef = useRef(false);

    // Estado para modal de confirmación
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);

    const handleConversation = (id) => {
        navigate(`/ai/${id}`, { replace: true });
    };

    const handleNewConversation = () => {
        clearLocalConversation();
        navigate(`/ai`, { replace: true });
        setShowHistorialSidebar(false);
    };

    const handleDeleteClick = (e, conversation) => {
        e.stopPropagation();
        setConversationToDelete(conversation);
        setShowConfirmation(true);
    };

    const executeDelete = () => {
        if (conversationToDelete) {
            deleteConversation(conversationToDelete.id);
        }
        setShowConfirmation(false);
        setConversationToDelete(null);
    };

    // Load conversations when sidebar opens, reset flag when it closes
    useEffect(() => {
        if (isVisible && user && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadConversations(true);
        }
        if (!isVisible) {
            hasLoadedRef.current = false;
        }
    }, [isVisible, user]);

    // Callback ref for IntersectionObserver - uses getState() for fresh values
    const sentinelRef = useCallback((node) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        if (!node) return;

        observerRef.current = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            const state = useAiStore.getState();
            if (!state.loadingMore && !state.loadingConversations && state.hasMoreConversations) {
                state.loadConversations(false);
            }
        }, { rootMargin: '100px', threshold: 0.1 });

        observerRef.current.observe(node);
    }, []);

    // Cleanup observer on unmount
    useEffect(() => {
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    return (
        <div className={styles.history_container}>
            <button 
                className={styles.new_conversation} 
                onClick={() => handleNewConversation()}
                title={t('ai_new_conversation_description')}
            >
                {t('ai_new_conversation')}
                <Icon icon={<Plus />} size="small" />
            </button>
            {loadingConversations ? (
                <SkeletonLoader 
                    variant="rectangular" 
                    width="100%"
                    height="100px" 
                    count={5} 
                    gap="8px"
                />
            ) : (
                <>
                    {conversations && conversations.length > 0 ? (
                        <>
                            {conversations.map(conv => {
                                const isActive = conv.id === currentConversationId;
                                
                                return (
                                    <div 
                                        key={conv.id}
                                        onClick={() => handleConversation(conv.id)}
                                        className={isActive 
                                            ? `${styles.conversation_item}` + ` ` + `conversation_item_active` 
                                            : styles.conversation_item
                                        }
                                    >
                                        <div className={styles.conversation_info}>
                                            <p className={styles.conversation_title}>{conv.title}</p>
                                            <p className={styles.conversation_date}>{formatRelativeTime(conv.updated_at, t)}</p>
                                        </div>
                                        <button 
                                            className={styles.deleteButton}
                                            title={t('ai_delete_conversation')}
                                            onClick={(e) => handleDeleteClick(e, conv)} 
                                        >
                                            <Icon icon={<Trash2 />} size="tiny" color="red"/>
                                        </button>
                                    </div>
                                );
                            })}
                            
                            {/* Elemento observador para scroll infinito */}
                            {hasMoreConversations && (
                                <div ref={sentinelRef} style={{ height: '20px', margin: '10px 0' }}>
                                    {loadingMore && (
                                        <SkeletonLoader 
                                            variant="rectangular" 
                                            width="100%"
                                            height="80px" 
                                            count={2} 
                                            gap="8px"
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p>{t('ai_no_conversations')}</p>
                    )}
                </>
            )}
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={executeDelete}
                title={t('ai_delete_conversation')}
                message={`${t('ai_delete_conversation_confirm')} "${conversationToDelete?.title}"?`}
                confirmText={t('confirm')}
                cancelText={t('cancel')}
                variant="danger"
            />
        </div>
    );
}

export default AIHistory;
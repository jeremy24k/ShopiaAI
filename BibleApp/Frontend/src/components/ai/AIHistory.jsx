import { useAiStore } from "../../store/AiStore";
import { useAuthStore } from "../../store/AuthStore";
import styles from '../../pages/AI.module.css';
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
    const { 
        conversations, 
        loadConversations, 
        loadingConversations,
        loadingMore,
        hasMoreConversations,
        deleteConversation,
        clearLocalConversation
    } = useAiStore();
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Ref para el observer
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);
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

    // Cargar conversaciones solo cuando el sidebar se abre por primera vez
    useEffect(() => {
        if (user && isVisible && !hasLoadedRef.current) {
            loadConversations(true); // Reset y cargar primera página
            hasLoadedRef.current = true;
        }
    }, [user, isVisible]);

    // Callback para cargar más conversaciones
    const loadMore = useCallback(() => {
        if (!loadingMore && hasMoreConversations && user) {
            loadConversations(false); // Cargar siguiente página
        }
    }, [loadingMore, hasMoreConversations, user, loadConversations]);

    // IntersectionObserver para scroll infinito
    useEffect(() => {
        if (!loadMoreRef.current) return;

        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                loadMore();
            }
        }, options);

        observerRef.current.observe(loadMoreRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore]);

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
                                            <Icon icon={<Trash2 />} size="tiny" />
                                        </button>
                                    </div>
                                );
                            })}
                            
                            {/* Elemento observador para scroll infinito */}
                            {hasMoreConversations && (
                                <div ref={loadMoreRef} style={{ height: '20px', margin: '10px 0' }}>
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
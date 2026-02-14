import { useAiStore } from "../../store/AiStore";
import { useAuthStore } from "../../store/AuthStore";
import styles from '../../pages/AI.module.css';
import { useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import Icon from "../ui/Icon";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../ui/SkeletonLoader";
import { formatRelativeTime } from "../../utils/FormatTime";
import { Plus } from "lucide-react";

    function AIHistory ({ currentConversationId, setShowHistorialSidebar}) {
        const { 
        conversations, 
        loadConversations, 
        loadingConversations, 
        deleteConversation,
        clearLocalConversation
    } = useAiStore();
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleConversation = (id) => {
        navigate(`/ai/${id}`, { replace: true });
    };

    const handleNewConversation = () => {
        clearLocalConversation();
        navigate(`/ai`, { replace: true });
        setShowHistorialSidebar(false);
    };

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user, loadConversations]);
    

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
                        conversations.map(conv => {
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConversation(conv.id);
                                        }} 
                                    >
                                        <Icon icon={<Trash2 />} size="tiny" />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <p>{t('ai_no_conversations')}</p>
                    )}
                </>
            )}
        </div>
    );
}

export default AIHistory;
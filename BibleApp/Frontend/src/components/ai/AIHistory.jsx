import { useAiStore } from "../../store/AiStore";
import { useAuthStore } from "../../store/AuthStore";
import styles from '../../pages/AI.module.css';
import { useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import Icon from "../ui/Icon";
import { Trash2 } from "lucide-react";

function AIHistory () {
    const { 
        conversations, 
        loadConversations, 
        loadingConversations, 
        loadSingleConversation,
        deleteConversation
    } = useAiStore();
    const { user } = useAuthStore();
    const { t } = useTranslation();

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user, loadConversations]);
    

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
 
    return (
        <div>
            {loadingConversations ? (
                <p>Cargando conversaciones...</p>
            ) : (
                <>
                    {conversations && conversations.length > 0 ? (
                        conversations.map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => loadSingleConversation(conv.id)}
                                className={styles.conversation_item}
                            >
                                <h3>{conv.title}</h3>
                                <p>{formatDate(conv.updated_at)}</p>
                                <button 
                                    className={styles.deleteButton} 
                                    onClick={() => deleteConversation(conv.id)} 
                                    title={t('ai_delete_conversation')}
                                >
                                    <Icon icon={<Trash2 />} size="small" color="red" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No hay conversaciones guardadas</p>
                    )}
                </>
            )}
        </div>
    );
}

export default AIHistory;
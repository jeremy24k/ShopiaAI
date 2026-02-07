import { useAiStore } from "../../store/AiStore";
import { useAuthStore } from "../../store/AuthStore";
import styles from '../../pages/AI.module.css';
import { useEffect } from "react";

function AIHistory () {
    const { conversations, loadConversations, loadSingleConversation } = useAiStore();
    const { user } = useAuthStore();

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
            {conversations && conversations.length > 0 ? (
                conversations.map(conv => (
                    <div 
                        key={conv.id}
                        onClick={() => loadSingleConversation(conv.id)}
                        className={styles.conversation_item}
                    >
                        <h3>{conv.title}</h3>
                        <p>{formatDate(conv.updated_at)}</p>
                    </div>
                ))
            ) : (
                <p>No hay conversaciones guardadas</p>
            )}
        </div>
    );
}

export default AIHistory;
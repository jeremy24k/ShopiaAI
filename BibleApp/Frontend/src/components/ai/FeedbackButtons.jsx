import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import Icon from '../ui/Icon';
import { useTranslation } from '../../hooks/useTranslation';
import FeedbackService from '../../services/FeedbackService';
import styles from '../../styles/AI.module.css';

export default function FeedbackButtons({ 
    msg, 
    user, 
    previousUserMessage,
    modeId, 
    doctrineId,
    isStreaming 
}) {
    const { t } = useTranslation();
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (content) => {
        const markdownToPlainText = (text) => {
            return text
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/^#{1,6}\s+/gm, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/```[\s\S]*?```/g, '')
                .replace(/^---+$/gm, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        };
        
        const plainText = markdownToPlainText(content);
        
        navigator.clipboard.writeText(plainText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Error al copiar texto:', err);
        });
    };

    const handleLike = async () => {
        if (!user) return;
        try {
            const result = await FeedbackService.saveFeedback({
                userId: user.id,
                messageContent: msg.content,
                messageIndex: msg.id,
                feedbackType: 'like',
                verseContext: previousUserMessage?.verseContext || [{content: "No Verse Context"}],
                modeId: previousUserMessage?.modeId || modeId,
                doctrineId: previousUserMessage?.doctrineId || doctrineId
            });

            if (result.action === 'removed') {
                setIsLiked(false);
            } else {
                setIsLiked(true);
                setIsDisliked(false);
            }
        } catch (error) {
            console.error('Error al guardar feedback:', error);
        }
    };

    const handleDislike = async () => {
        if (!user) return;
        try {
            const result = await FeedbackService.saveFeedback({
                userId: user.id,
                messageContent: msg.content,
                messageIndex: msg.id,
                feedbackType: 'dislike',
                verseContext: previousUserMessage?.verseContext || [{content: "No Verse Context"}],
                modeId: previousUserMessage?.modeId || modeId,
                doctrineId: previousUserMessage?.doctrineId || doctrineId
            });

            if (result.action === 'removed') {
                setIsDisliked(false);
            } else {
                setIsDisliked(true);
                setIsLiked(false);
            }
        } catch (error) {
            console.error('Error al guardar feedback:', error);
        }
    };

    if (isStreaming) return null;

    return (
        <div className={styles.messageActions}>
            <button 
                className={`${styles.actionButton} ${isCopied ? styles.copied : ''}`}
                onClick={() => handleCopy(msg.content)}
                title={isCopied ? t('ai_copied') : t('ai_copy_text')}
            >
                <Icon icon={<Copy />} size="small"/>
            </button>
            {user && 
                <>
                    <button 
                        className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
                        onClick={handleLike}
                        title={isLiked ? t('ai_remove_like') : t('ai_like')}
                    >
                        <Icon icon={<ThumbsUp />} size="small"/>
                    </button>
                    <button 
                        className={`${styles.actionButton} ${isDisliked ? styles.disliked : ''}`}
                        onClick={handleDislike}
                        title={isDisliked ? t('ai_remove_dislike') : t('ai_dislike')}
                    >
                        <Icon icon={<ThumbsDown />} size="small"/>
                    </button>
                </>
            }
        </div>
    );
}

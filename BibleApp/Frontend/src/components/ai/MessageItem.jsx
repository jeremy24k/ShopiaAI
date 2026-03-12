import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Streamdown } from 'streamdown';
import "streamdown/styles.css";
import { Copy, ThumbsUp, ThumbsDown, User, BookOpen } from "lucide-react";
import Icon from "../ui/Icon";
import { useTranslation } from "../../hooks/useTranslation";
import FeedbackService from "../../services/FeedbackService";
import { useAuthStore } from "../../store/AuthStore";
import { useAiStore } from "../../store/AiStore";
import styles from '../../styles/AI.module.css';

export default function MessageItem({ msg, index, isStreaming = false, previousUserMessage = null }) {
    const { t } = useTranslation();
    const user = useAuthStore(state => state.user);
    
    // Selectors from aiStore
    const modeId = useAiStore(state => state.modeId);
    const doctrineId = useAiStore(state => state.doctrineId);
    const availableModes = useAiStore(state => state.availableModes);
    const availableDoctrines = useAiStore(state => state.availableDoctrines);

    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const getModeName = (id) => {
        const mode = availableModes.find(m => m.id === id);
        return mode?.name || id;
    };

    const getDoctrineName = (id) => {
        const doctrine = availableDoctrines.find(p => p.id === id);
        return doctrine?.name || id;
    };

    const getVerseRange = (verses) => {
        const verseArray = verses;
        if (!verseArray || verseArray.length === 0) return '';
        if (verseArray.length === 1) {
            const v = verseArray[0];
            return `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`;
        }
        
        const groupedByBook = {};
        verseArray.forEach(v => {
            if (!groupedByBook[v.bookName]) {
                groupedByBook[v.bookName] = [];
            }
            groupedByBook[v.bookName].push(v);
        });
        
        const bookNames = Object.keys(groupedByBook);
        const maxBooks = 3;
        const totalBooks = bookNames.length;
        const booksToShow = bookNames.slice(0, maxBooks);
        
        const bookStrings = booksToShow.map(bookName => {
            const verses = groupedByBook[bookName];
            verses.sort((a, b) => a.chapterNumber - b.chapterNumber || a.verseNumber - b.verseNumber);
            
            const chapters = {};
            verses.forEach(v => {
                if (!chapters[v.chapterNumber]) {
                    chapters[v.chapterNumber] = [];
                }
                chapters[v.chapterNumber].push(v.verseNumber);
            });
            
            const chapterStrings = Object.keys(chapters).map(chapter => {
                const verseNumbers = chapters[chapter].sort((a, b) => a - b);
                const ranges = [];
                let start = verseNumbers[0];
                let end = verseNumbers[0];
                
                for (let i = 1; i < verseNumbers.length; i++) {
                    if (verseNumbers[i] === end + 1) {
                        end = verseNumbers[i];
                    } else {
                        ranges.push(start === end ? `${start}` : `${start}-${end}`);
                        start = verseNumbers[i];
                        end = verseNumbers[i];
                    }
                }
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                return `${chapter}:${ranges.join(',')}`;
            });
            
            return `${bookName.toLowerCase()} ${chapterStrings.join('; ')}`;
        });
        
        const result = bookStrings.join('; ');
        return totalBooks > maxBooks ? `${result}...` : result;
    };

    function handleCopy(content) {
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
    }

    async function handleLike() {
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
            console.error('❌ Error al guardar feedback:', error);
        }
    }

    async function handleDislike() {
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
            console.error('❌ Error al guardar feedback:', error);
        }
    }

    return (
        <div className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}>
            {msg.role === 'user' ? (
                <div className={styles.userQuestionContainer}>
                    <div className={styles.userQuestionHeader}>
                        <Icon icon={<User />} size="small" color="white" />
                    </div>
                    <div className={styles.userQuestionContent}>
                        <p>{msg.content}</p>
                        <div className={styles.answerMode}>
                            {msg.verseContext && msg.verseContext.length > 0 && (
                                <div className={styles.contextVerse}>
                                    {getVerseRange(msg.verseContext)}
                                </div>
                            )}
                            <div className={styles.headerMode}>
                                <div className={styles.modeBadges}>
                                    <span className={styles.modeBadge}>
                                        <Icon icon={<User />} size="tiny" />
                                        {getModeName(msg.modeId)}
                                    </span>
                                    <span className={styles.modeBadge}>
                                        <Icon icon={<BookOpen />} size="tiny" />
                                        {getDoctrineName(msg.doctrineId)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.assistantAnswerContainer}>
                    <div className={styles.assistantAnswerContent}>
                        <Streamdown 
                            animated={true}
                            isAnimating={isStreaming}
                            linkSafety={{ enabled: false }}
                        >
                            {msg.content}
                        </Streamdown>
                        {!isStreaming && (
                            <div className={styles.messageActions}>
                                <button 
                                    className={`${styles.actionButton} ${isCopied ? styles.copied : ''}`}
                                    onClick={() => handleCopy(msg.content)}
                                    title={isCopied ? t('ai_copied') : t('ai_copy_text')}
                                >
                                    <Icon icon={<Copy />} size="small"/>
                                </button>
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
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

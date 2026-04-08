import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Streamdown } from 'streamdown';
import "streamdown/styles.css";
import { Copy, ThumbsUp, ThumbsDown, User, BookOpen, Sparkles, Lock } from "lucide-react";
import Icon from "../ui/Icon";
import { useTranslation } from "../../hooks/useTranslation";
import FeedbackService from "../../services/FeedbackService";
import { useAuthStore } from "../../store/AuthStore";
import { useAiStore } from "../../store/AiStore";
import styles from '../../styles/AI.module.css';

const CustomLink = ({ href, children, user, onDemoLock }) => {
    const { t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLinkClick = (e) => {
        e.preventDefault();
        if (!user) {
            onDemoLock?.();
            return;
        }
        setShowMenu(!showMenu);
    };

    return (
        <span style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
            <a href={href} onClick={handleLinkClick}>
                {children}
            </a>
            {showMenu && (
                <span className={styles.linkMenuPopover}>
                    <button 
                        onClick={() => {
                            setShowMenu(false);
                            window.open(href, '_blank');
                        }} 
                        className={styles.linkMenuButton}
                    >
                        {t('ai_open_new_tab', 'Abrir nueva pestaña')}
                    </button>
                    <button 
                        onClick={() => {
                            setShowMenu(false);
                            window.open(href, '_self');
                        }} 
                        className={styles.linkMenuButton}
                    >
                        {t('ai_open_here', 'Abrir aquí')}
                    </button>
                </span>
            )}
        </span>
    );
};

export default function MessageItem({ msg, index, isStreaming = false, previousUserMessage = null, onDemoLock }) {
    const { t, language } = useTranslation();
    const user = useAuthStore(state => state.user);
    const demoQuestionsUsed = useAiStore(state => state.demoQuestionsUsed);
    
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
            const bookVerses = groupedByBook[bookName];
            bookVerses.sort((a, b) => a.chapterNumber - b.chapterNumber || a.verseNumber - b.verseNumber);
            
            // Collect unique translations for this book
            const translations = new Set();
            bookVerses.forEach(v => {
                const trLabel = v.shortName || v.translation || v.translationValue;
                if (trLabel) translations.add(trLabel);
            });
            
            const chapters = {};
            bookVerses.forEach(v => {
                if (!chapters[v.chapterNumber]) {
                    chapters[v.chapterNumber] = [];
                }
                chapters[v.chapterNumber].push(Number(v.verseNumber));
            });
            
            const chapterStrings = Object.keys(chapters).map(chapter => {
                // Deduplicate verse numbers (same verse in multiple translations)
                const verseNumbers = [...new Set(chapters[chapter])].sort((a, b) => a - b);
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
            
            // Show translation labels when there are multiple translations for this book
            const trSuffix = translations.size > 1 ? ` (${[...translations].join(', ')})` : '';
            return `${bookName.toLowerCase()} ${chapterStrings.join('; ')}${trSuffix}`;
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
                            linkSafety={{ 
                                enabled: false,
                                allowRelative: true,
                                allowFragments: true
                            }}
                            urlTransform={(url) => url}
                            components={{ a: (props) => <CustomLink user={user} onDemoLock={onDemoLock} {...props} /> }}
                            >
                            {msg.content}
                        </Streamdown>
                        
                        {/* Value Lock - Show after first demo response */}
                        {!user && !isStreaming && demoQuestionsUsed === 1 && index === 1 && (
                            <div className={styles.valueLockCard}>
                                <div className={styles.valueLockHeader}>
                                    <Sparkles size={18} className={styles.valueLockIcon} />
                                    <h4 className={styles.valueLockTitle}>
                                        {language === 'es' 
                                            ? 'Este análisis fue genérico' 
                                            : 'This analysis was generic'}
                                    </h4>
                                </div>
                                <p className={styles.valueLockDescription}>
                                    {language === 'es'
                                        ? 'Crea tu cuenta gratis para ver cómo cambia esta respuesta según tu tradición (Evangélica, Católica, etc.) y profundidad de estudio.'
                                        : 'Create your free account to see how this response changes based on your tradition (Evangelical, Catholic, etc.) and study depth.'}
                                </p>
                                <div className={styles.valueLockFeatures}>
                                    <div className={styles.valueLockFeature}>
                                        <User size={14} />
                                        <span>{language === 'es' ? 'Personaliza el modo de respuesta' : 'Customize response mode'}</span>
                                    </div>
                                    <div className={styles.valueLockFeature}>
                                        <BookOpen size={14} />
                                        <span>{language === 'es' ? 'Ajusta la tradición doctrinal' : 'Adjust doctrinal tradition'}</span>
                                    </div>
                                    <div className={styles.valueLockFeature}>
                                        <Lock size={14} />
                                        <span>{language === 'es' ? 'Añade contexto bíblico' : 'Add biblical context'}</span>
                                    </div>
                                </div>
                                <Link to="/login" className={styles.valueLockButton}>
                                    <Sparkles size={16} />
                                    {language === 'es' ? 'Crear cuenta gratis' : 'Create free account'}
                                </Link>
                            </div>
                        )}
                        
                        {!isStreaming && (
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

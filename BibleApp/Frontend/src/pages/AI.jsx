import { useEffect, useState, useRef } from "react";
import { useAiStore } from "../store/AiStore";
import { useAuthStore } from "../store/AuthStore";
import FeedbackService from "../services/FeedbackService";
import ReactMarkdown from "react-markdown";
import { useLocation, Link } from "react-router-dom";
import { 
    User, 
    X,
    History,
    Scroll, 
    Lightbulb, 
    Link2, 
    Sparkles, 
    Globe, 
    BookOpen, 
    Trash2,
    AlertTriangle,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Share2,
    ArrowUp,
    Settings,
    FileText,
    ChevronLeft,
    ChevronRight,
    CircleStop,
} from "lucide-react";
import ModeSelectorModal from "../components/ai/ModeSelectorModal";
import ContextModal from "../components/ai/ContextModal";
import IconButton from "../components/ui/IconButton";
import Icon from "../components/ui/Icon";
import AIHistory from "../components/ai/AIHistory";
import { useTranslation } from "../hooks/useTranslation";
import styles from './AI.module.css';
import "../styles/animations.css";

function AI() {
    // Refs for scroll management
    const scrollContainerRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const lastScrollTop = useRef(0);
    const isUserScrolling = useRef(false);
    const scrollTimeout = useRef(null);

    // Componente personalizado para renderizar enlaces
    const LinkRenderer = ({ href, children, ...props }) => {
        // Si es un enlace interno de la biblia, abrir en nueva pestaña
        if (href && href.startsWith('/books/')) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                </a>
            );
        }
        // Para otros enlaces, comportamiento normal
        return <a href={href} {...props}>{children}</a>;
    };

    // Smooth scroll functions
    const handleScrollLeft = () => {
        const content = scrollContainerRef.current;
        if (content) {
            content.style.scrollBehavior = 'smooth';
            content.scrollLeft -= 300;
        }
    };

    const handleScrollRight = () => {
        const content = scrollContainerRef.current;
        if (content) {
            content.style.scrollBehavior = 'smooth';
            content.scrollLeft += 300;
        }
    };

    const { 
        explainVerse, 
        askQuestion, 
        verseToExplain, 
        loading, 
        error, 
        setVerseToExplain,
        messages,
        currentResponse,
        cancelResponse,
        clearMessages,
        setUserId,
        removeVerseFromContext, 
        removeBookFromContext, 
        clearAllContext 
    } = useAiStore();
    const { user } = useAuthStore();

    // Setear userId en el store cuando el usuario esté disponible
    useEffect(() => {
        if (user?.id) {
            setUserId(user.id);
        }
    }, [user, setUserId]);
    const [question, setQuestion] = useState('');
    const [likedMessages, setLikedMessages] = useState(new Set());
    const [dislikedMessages, setDislikedMessages] = useState(new Set());
    const [copiedMessage, setCopiedMessage] = useState(null);
    const [currentMode, setCurrentMode] = useState('personal_guide');
    const [currentDoctrine, setCurrentDoctrine] = useState('evangelical');
    const [showModeModal, setShowModeModal] = useState(false);
    const [showContextModal, setShowContextModal] = useState(false);
    const [showHistorialSidebar, setShowHistorialSidebar] = useState(false);
    const [availableModes, setAvailableModes] = useState([]);
    const [availablePerspectives, setAvailablePerspectives] = useState([]);
    const location = useLocation(); 
    const { t, language } = useTranslation();

    // Cargar modos y perspectivas disponibles
    useEffect(() => {
        async function loadAvailableOptions() {
            try {
                const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                
                // Cargar modos
                const modesResponse = await fetch(`${BASE_URL}/ai/modes?language=${language}`);
                if (modesResponse.ok) {
                    const modesData = await modesResponse.json();
                    if (modesData.success) {
                        setAvailableModes(modesData.data);
                    }
                }

                // Cargar perspectivas
                const perspectivesResponse = await fetch(`${BASE_URL}/ai/perspectives?language=${language}`);
                if (perspectivesResponse.ok) {
                    const perspectivesData = await perspectivesResponse.json();
                    if (perspectivesData.success) {
                        setAvailablePerspectives(perspectivesData.data);
                    }
                }
            } catch (error) {
                console.error('Error cargando opciones de IA:', error);
                
                // Fallbacks
                const fallbackModes = [
                    { id: 'personal', name: language === 'en' ? 'Personal Mode' : 'Modo Personal', icon: 'Heart' },
                    { id: 'impartial', name: language === 'en' ? 'Impartial Mode' : 'Modo Imparcial', icon: 'Balance' },
                    { id: 'teacher', name: language === 'en' ? 'Student Mode' : 'Modo Estudiantil', icon: 'BookOpen' }
                ];
                
                const fallbackPerspectives = [
                    { id: 'evangelical', name: language === 'en' ? 'Evangelical' : 'Evangélico', description: language === 'en' ? 'Emphasis on the gospel, personal conversion and biblical authority' : 'Énfasis en el evangelio, conversión personal y autoridad bíblica' },
                    { id: 'pentecostal', name: language === 'en' ? 'Pentecostal' : 'Pentecostal', description: language === 'en' ? 'Emphasis on the Holy Spirit, spiritual gifts and healing' : 'Énfasis en el Espíritu Santo, dones espirituales y sanidad' },
                    { id: 'catholic', name: language === 'en' ? 'Catholic' : 'Católico', description: language === 'en' ? 'Apostolic tradition, sacraments and Church authority' : 'Tradición apostólica, sacramentos y autoridad de la Iglesia' },
                    { id: 'baptist', name: language === 'en' ? 'Baptist' : 'Bautista', description: language === 'en' ? 'Biblical authority, local church autonomy' : 'Autoridad de la Biblia, autonomía de la iglesia local' },
                    { id: 'adventist', name: language === 'en' ? 'Adventist' : 'Adventista', description: language === 'en' ? 'Emphasis on Sabbath, second coming and holistic health' : 'Énfasis en el sábado, segunda venida y salud integral' },
                    { id: 'ecumenical', name: language === 'en' ? 'Ecumenical' : 'Ecuménico', description: language === 'en' ? 'Inclusive approach that values unity in Christian diversity' : 'Enfoque inclusivo que valora la unidad en la diversidad cristiana' }
                ];
                
                setAvailableModes(fallbackModes);
                setAvailablePerspectives(fallbackPerspectives);
            }
        }

        loadAvailableOptions();
    }, [language]);

    // Manejar envío de pregunta
    function handleSubmitQuestion(e) {
        e.preventDefault();
        if (!question.trim() || loading) return;
        askQuestion(question, verseToExplain?.length > 0 ? verseToExplain : null, currentMode, currentDoctrine, language);
        setQuestion('');
        setShouldAutoScroll(true); // Activar auto-scroll al enviar pregunta
    }

    // Manejar Enter para enviar
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitQuestion(e);
        }
    }

    // Función para generar el rango de versículos (funciona para estado actual o mensaje específico)
    function getVerseRange(verses = null) {
        const verseArray = verses || verseToExplain;
        
        if (!verseArray || verseArray.length === 0) return '';
        
        if (verseArray.length === 1) {
            const v = verseArray[0];
            return `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`;
        }
        
        // Agrupar por libro para mostrar múltiples libros
        const groupedByBook = {};
        verseArray.forEach(v => {
            if (!groupedByBook[v.bookName]) {
                groupedByBook[v.bookName] = [];
            }
            groupedByBook[v.bookName].push(v);
        });
        
        // Formatear cada libro
        const bookStrings = Object.keys(groupedByBook).map(bookName => {
            const verses = groupedByBook[bookName];
            verses.sort((a, b) => a.chapterNumber - b.chapterNumber || a.verseNumber - b.verseNumber);
            
            // Agrupar por capítulo
            const chapters = {};
            verses.forEach(v => {
                if (!chapters[v.chapterNumber]) {
                    chapters[v.chapterNumber] = [];
                }
                chapters[v.chapterNumber].push(v.verseNumber);
            });
            
            // Formatear capítulos y versículos
            const chapterStrings = Object.keys(chapters).map(chapter => {
                const verseNumbers = chapters[chapter].sort((a, b) => a - b);
                
                if (verseNumbers.length === 1) {
                    return `${chapter}:${verseNumbers[0]}`;
                }
                
                // Agrupar versículos consecutivos
                const ranges = [];
                let start = verseNumbers[0];
                let prev = verseNumbers[0];
                
                for (let i = 1; i < verseNumbers.length; i++) {
                    if (verseNumbers[i] === prev + 1) {
                        prev = verseNumbers[i];
                    } else {
                        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
                        start = prev = verseNumbers[i];
                    }
                }
                ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
                
                return `${chapter}:${ranges.join(',')}`;
            });
            
            return `${bookName} ${chapterStrings.join('; ')}`;
        });
        
        return bookStrings.join('; ');
    }

    // Funciones para gestionar contexto acumulativo
    const addToContext = (newVerses) => {
        if (!newVerses || newVerses.length === 0) return;
        
        // Evitar duplicados
        const filtered = newVerses.filter(newVerse => 
            !verseToExplain.some(existing => 
                existing.bookName === newVerse.bookName &&
                existing.chapterNumber === newVerse.chapterNumber &&
                existing.verseNumber === newVerse.verseNumber
            )
        );
        
        if (filtered.length > 0) {
            setVerseToExplain([...verseToExplain, ...filtered]);
        }
    };

    const handleRemoveVerse = (verseToRemove) => {
        removeVerseFromContext(verseToRemove); 
    };
    
    const handleRemoveBook = (bookName) => {
        removeBookFromContext(bookName);
    };
    
    const handleClearAll = () => {
        clearAllContext();
    };

    // Recibir versículos desde la navegación (acumulativo)
    useEffect(() => {
        if (location.state?.selectedVerses) {
            addToContext(location.state.selectedVerses);
        }
    }, [location.state]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (shouldAutoScroll) {
            const mainElement = document.querySelector('main.ai');
            if (mainElement) {
                console.log('Auto-scrolling to bottom - shouldAutoScroll is true'); 
                mainElement.scrollTo({
                    top: mainElement.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [messages, currentResponse, shouldAutoScroll]);

    // Handle scroll events to detect user scrolling
    const handleScroll = () => {
        const mainElement = document.querySelector('main.ai');
        if (!mainElement) return;
        
        const currentScrollTop = mainElement.scrollTop;
        const scrollHeight = mainElement.scrollHeight;
        const clientHeight = mainElement.clientHeight;
        const isAtBottom = scrollHeight - currentScrollTop - clientHeight <= 0;
        
        // Detectar scroll hacia arriba (usuario intentando subir)
        if (currentScrollTop < lastScrollTop.current) {
            isUserScrolling.current = true;
            setShouldAutoScroll(false);
            
            // Limpiar timeout existente
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
            
            // Después de 1s de no scroll, resetear el flag
            scrollTimeout.current = setTimeout(() => {
                isUserScrolling.current = false;
            }, 1000);
        }
        
        // Re-enable auto-scroll solo si estás exactamente al fondo, no estás haciendo scroll manual, y no está ya activado
        if (isAtBottom && !isUserScrolling.current && !shouldAutoScroll) {
            setShouldAutoScroll(true);
        }
        
        lastScrollTop.current = currentScrollTop;
    };

    // Add scroll event listener to main.ai element
    useEffect(() => {
        const mainElement = document.querySelector('main.ai');
        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll);
            return () => {
                mainElement.removeEventListener('scroll', handleScroll);
                // Limpiar timeout al desmontar
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }
            };
        }
    }, []);

    // Manejar clics en botones de explicación
    function handleExplanationClick(type) {
        explainVerse(verseToExplain, type, currentMode, currentDoctrine, language);
    }

    // Funciones para acciones de respuesta
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
            setCopiedMessage(content);
            setTimeout(() => setCopiedMessage(null), 2000);
        }).catch(err => {
            console.error('Error al copiar texto:', err);
        });
    }

    async function handleLike(messageId, messageIndex) {
        if (!user) {
            console.error('Usuario no autenticado');
            return;
        }

        const message = messages[messageIndex];
        if (!message || message.role !== 'assistant') return;

        const userMessage = messages[messageIndex - 1];
        
        try {
            const result = await FeedbackService.saveFeedback({
                userId: user.id,
                messageContent: message.content,
                messageIndex: messageId,
                feedbackType: 'like',
                verseContext: userMessage?.verseContext || [{content: "No Verse Context"}],
                modeId: userMessage?.modeId || currentMode,
                doctrineId: userMessage?.doctrineId || currentDoctrine
            });

            const newLiked = new Set(likedMessages);
            const newDisliked = new Set(dislikedMessages);
            
            if (result.action === 'removed') {
                newLiked.delete(messageId);
            } else {
                newLiked.add(messageId);
                newDisliked.delete(messageId);
            }
            
            setLikedMessages(newLiked);
            setDislikedMessages(newDisliked);

            console.log('✅ Feedback guardado:', result);
        } catch (error) {
            console.error('❌ Error al guardar feedback:', error);
        }
    }

    async function handleDislike(messageId, messageIndex) {
        if (!user) {
            console.error('Usuario no autenticado');
            return;
        }

        const message = messages[messageIndex];
        if (!message || message.role !== 'assistant') return;

        const userMessage = messages[messageIndex - 1];
        
        try {
            const result = await FeedbackService.saveFeedback({
                userId: user.id,
                messageContent: message.content,
                messageIndex: messageId,
                feedbackType: 'dislike',
                verseContext: userMessage?.verseContext || [{content: "No Verse Context"}],
                modeId: userMessage?.modeId || currentMode,
                doctrineId: userMessage?.doctrineId || currentDoctrine
            });

            const newLiked = new Set(likedMessages);
            const newDisliked = new Set(dislikedMessages);
            
            if (result.action === 'removed') {
                newDisliked.delete(messageId);
            } else {
                newDisliked.add(messageId);
                newLiked.delete(messageId);
            }
            
            setLikedMessages(newLiked);
            setDislikedMessages(newDisliked);

            console.log('✅ Feedback guardado:', result);
        } catch (error) {
            console.error('❌ Error al guardar feedback:', error);
        }
    }

    function handleShare(content) {
        if (navigator.share) {
            navigator.share({
                title: t('ai_assistant') + ' - ' + t('ai_ai_generated_content'),
                text: content,
                url: window.location.href
            }).catch(err => {
                console.error('Error al compartir:', err);
                handleCopy(content);
            });
        } else {
            handleCopy(content);
        }
    }

    // Componente para botones de acción
    function MessageActions({ content, messageId, messageIndex, isStreaming = false }) {
        if (isStreaming) return null;
        
        const isLiked = likedMessages.has(messageId);
        const isDisliked = dislikedMessages.has(messageId);
        const isCopied = copiedMessage === content;
        
        return (
            <div className={styles.messageActions}>
                <button 
                    className={`${styles.actionButton} ${isCopied ? styles.copied : ''}`}
                    onClick={() => handleCopy(content)}
                    title={isCopied ? t('ai_copied') : t('ai_copy_text')}
                >
                    <Icon icon={<Copy />} size="small"/>
                </button>
                <button 
                    className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
                    onClick={() => handleLike(messageId, messageIndex)}
                    title={isLiked ? t('ai_remove_like') : t('ai_like')}
                >
                    <Icon icon={<ThumbsUp />} size="small"/>
                </button>
                <button 
                    className={`${styles.actionButton} ${isDisliked ? styles.disliked : ''}`}
                    onClick={() => handleDislike(messageId, messageIndex)}
                    title={isDisliked ? t('ai_remove_dislike') : t('ai_dislike')}
                >
                    <Icon icon={<ThumbsDown />} size="small"/>
                </button>
                <button 
                    className={styles.actionButton}
                    onClick={() => handleShare(content)}
                    title={t('ai_share')}
                >
                    <Icon icon={<Share2 />} size="small"/>
                </button>
            </div>
        );
    }

    const getModeName = (modeId) => {
        const mode = availableModes.find(m => m.id === modeId);
        return mode?.name || modeId;
    };

    const getDoctrineName = (doctrineId) => {
        const doctrine = availablePerspectives.find(p => p.id === doctrineId);
        return doctrine?.name || doctrineId;
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerTitle}>
                        <h1>{t('ai_title')}</h1>
                        <p>{t('ai_subtitle')}</p>
                        {/* Verse Citation */}
                        {verseToExplain && verseToExplain.length > 0 && (
                            <div className={styles.verseCitation}>
                                <span className={styles.citationLabel}>{t('ai_current_verse')}:</span>
                                <span 
                                    className={styles.citationText}
                                    onClick={() => setShowContextModal(true)}
                                >{getVerseRange()}</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.headerConfig}>
                        <div className={styles.headerConfigButtons}>
                             <IconButton 
                                onClick={() => setShowHistorialSidebar(true)}
                                icon={History}
                                variant="primary"
                                size="medium"
                                iconSize="medium"
                                circle={true}
                                title={t('ai_historial')}
                            >
                            </IconButton>
                            <IconButton 
                                onClick={() => setShowContextModal(true)}
                                icon={FileText}
                                variant="primary"
                                size="medium"
                                iconSize="medium"
                                circle={true}
                                title={t('ai_context')}
                            >
                            </IconButton>
                            <IconButton 
                                onClick={() => setShowModeModal(true)}
                                icon={Settings}
                                variant="primary"
                                size="medium"
                                iconSize="medium"
                                circle={true}
                                title={t('ai_config')}
                            >
                            </IconButton>
                        </div>
                        
                        <div className={styles.headerMode}>
                            <div className={styles.modeBadges}>
                                <p>
                                    {t('ai_mode')}
                                </p>
                                <span className={styles.modeBadge}>
                                    <Icon icon={<User />} size="tiny" />
                                    {getModeName(currentMode)}
                                </span>
                                <span className={styles.modeBadge}>
                                    <Icon icon={<BookOpen />} size="tiny" />
                                    {getDoctrineName(currentDoctrine)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <div className={styles.chatContainer}>
                    {/* Messages */}
                    {messages.length > 0 && (
                        <div className={styles.messagesContainer}>
                            {messages.map((msg, index) => (
                                <div className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage} key={index}>
                                    {/* User Question Container */}
                                    {msg.role === 'user' && (
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
                                    )}
                                    
                                    {/* Assistant Answer Container */}
                                    {msg.role === 'assistant' && (
                                        <div className={styles.assistantAnswerContainer}>
                                            <div className={styles.assistantAnswerContent}>
                                                <ReactMarkdown components={{ a: LinkRenderer }}>{msg.content}</ReactMarkdown>
                                                <MessageActions 
                                                    content={msg.content}
                                                    messageId={msg.id}
                                                    messageIndex={index}    
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Current streaming response */}
                            {currentResponse && (
                                <div className={styles.assistantAnswerContainer}>
                                    <div className={styles.assistantAnswerContent}>
                                        <ReactMarkdown components={{ a: LinkRenderer }}>{currentResponse}</ReactMarkdown>
                                        <span className={styles.cursor}></span>
                                        <MessageActions 
                                            content={currentResponse} 
                                            messageIndex={messages.length}
                                            isStreaming={true}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Loading indicator */}
                            {loading && !currentResponse && (
                                <div className={styles.assistantAnswerContainer}>
                                    <div className={styles.assistantAnswerContent}>
                                        <div className={styles.typingIndicator}>
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading for first interaction */}
                    {loading && messages.length === 0 && !currentResponse && (
                        <div className={styles.loading}>
                            <div className={styles.loadingInner}>
                                <div className={styles.spinner}></div>
                                <span className={styles.loadingText}>{t('ai_generating_explanation')}</span>
                            </div>
                            <p className={styles.loadingSubtext}>{t('ai_please_be_patient')}</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className={styles.error}>
                            <Icon icon={<AlertTriangle />} />
                            <strong>{t('ai_error')}:</strong> {error}
                        </div>
                    )}

                    {/* Placeholder */}
                    {messages.length === 0 && !loading && !error && (
                        <div className={styles.placeholder}>
                            <p>
                                {verseToExplain?.length > 0 
                                    ? t('ai_placeholder_with_verses')
                                    : (
                                        <span>
                                            <Link to="/books">{t('ai_placeholder_no_verses_link')}</Link>
                                            {t('ai_placeholder_no_verses')}
                                        </span>
                                    )
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                {/* Input Form */}
                <form className={styles.inputForm} onSubmit={handleSubmitQuestion}>
                    <textarea 
                        className={styles.textarea}
                        name="question" 
                        id="question"
                        placeholder={t('ai_question_placeholder')}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        rows={3}
                    />
    
                    <div className={styles.ctnInputButtons}>
                        <div className={styles.quickActionsContainer}>
                            <button 
                                className={styles.scrollButton}
                                onClick={handleScrollLeft}
                            >
                                <Icon icon={<ChevronLeft />} size="tiny" />
                            </button>
                            
                            <div 
                                className={styles.quickActions} 
                                ref={scrollContainerRef}
                            >
                            <button 
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('contextoHistorico')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Scroll />} size="tiny" />
                                {t('ai_historical_context')}
                            </button>
                            <button 
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('aplicacionDiaria')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Lightbulb />} size="tiny" />
                                {t('ai_daily_application')}
                            </button>
                            <button 
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('vesiculosRelacionados')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Link2 />} size="tiny" />
                                {t('ai_related_verses')}
                            </button>
                            <button 
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('explicacionSencilla')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Sparkles />} size="tiny" />
                                {t('ai_simple_explanation')}
                            </button>
                            <button 
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('TraducirAlIdiomaOriginal')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Globe />} size="tiny" />
                                {t('ai_original_language')}
                            </button>
                            <button 
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('ProponerGuiaDeEstudio')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<BookOpen />} size="tiny" />
                                {t('ai_study_guide')}
                            </button>
                            </div>
                            
                            <button 
                                className={styles.scrollButton}
                                onClick={handleScrollRight}
                            >
                                <Icon icon={<ChevronRight />} size="tiny" />
                            </button>
                        </div>
                        <div className={styles.inputButtons}>
                            {messages.length > 0 && (
                                <button 
                                    type="button" 
                                    className={styles.clearButton}
                                    onClick={clearMessages}
                                    disabled={loading}
                                >
                                    <Icon icon={<Trash2 />} size="small" />
                                </button>
                            )}

                            {loading ? (
                                <button 
                                    type="button" 
                                    className={styles.cancelButton}
                                    onClick={cancelResponse}
                                    disabled={!loading}
                                >
                                    <Icon icon={<CircleStop />} size="small" />
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    className={styles.sendButton}
                                    disabled={loading || !question.trim()}
                                >
                                    <Icon icon={<ArrowUp />} size="tiny" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>
                <div className={styles.inputFormFooter}>
                    <p>
                        {t('ai_footer_text')}
                    </p>
                </div>
            </div>

            {/* Modals */}
            <ModeSelectorModal
                isOpen={showModeModal}
                onClose={() => setShowModeModal(false)}
                currentMode={currentMode}
                currentDoctrine={currentDoctrine}
                onModeChange={setCurrentMode}
                onDoctrineChange={setCurrentDoctrine}
            />

            <ContextModal
                isOpen={showContextModal}
                onClose={() => setShowContextModal(false)}
                verses={verseToExplain}
                onRemoveVerse={handleRemoveVerse}
                onRemoveBook={handleRemoveBook}
                onClearAll={handleClearAll}
            />

            {/* Sidebar */}
            {showHistorialSidebar && (
                <div 
                    className={styles.history_overlay + ' ' + "fadeIn"}
                    onClick={() => setShowHistorialSidebar(false)}
                />
            )}
            <div className={`${styles.ctn_history_sidebar} ${showHistorialSidebar ? styles.open : ''}`}>
                <div className={styles.history_header}>
                    <h2>{t('ai_history')}</h2>
                    <IconButton 
                        onClick={() => setShowHistorialSidebar(false)}
                        icon={X}
                        variant="ghost"
                        size="small"
                        iconSize="medium"
                        circle={true}
                    />
                </div>
                <AIHistory/>
            </div>
        </div>
    );
}

export default AI;


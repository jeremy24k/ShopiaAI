import { useEffect, useState, useRef } from "react";
import { useAiStore } from "../store/AiStore";
import ReactMarkdown from 'react-markdown';
import { useLocation } from "react-router-dom";
import { 
    User, 
    Bot, 
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
    ChevronRight
} from "lucide-react";
import ModeSelectorModal from "../components/ai/ModeSelectorModal";
import ContextModal from "../components/ai/ContextModal";
import IconButton from "../components/ui/IconButton";
import Icon from "../components/ui/Icon";
import { useTranslation } from "../hooks/useTranslation";
import styles from './AI.module.css';

function AI() {
    // Ref for scroll container
    const scrollContainerRef = useRef(null);

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
        clearMessages
    } = useAiStore();
    const [question, setQuestion] = useState('');
    const [likedMessages, setLikedMessages] = useState(new Set());
    const [dislikedMessages, setDislikedMessages] = useState(new Set());
    const [copiedMessage, setCopiedMessage] = useState(null);
    const [currentMode, setCurrentMode] = useState('personal');
    const [currentDoctrine, setCurrentDoctrine] = useState('evangelical');
    const [showModeModal, setShowModeModal] = useState(false);
    const [showContextModal, setShowContextModal] = useState(false);
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
    }

    // Manejar Enter para enviar
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitQuestion(e);
        }
    }

    // Función para generar el rango de versículos
    function getVerseRange() {
        if (!verseToExplain || verseToExplain.length === 0) return '';
        
        const first = verseToExplain[0];
        const last = verseToExplain[verseToExplain.length - 1];
        
        if (verseToExplain.length === 1) {
            return `${first.bookName} ${first.chapterNumber}:${first.verseNumber}`;
        }
        
        return `${first.bookName} ${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;
    }

    // Recibir versículos desde la navegación
    useEffect(() => {
        if (location.state?.selectedVerses) {
            setVerseToExplain(location.state.selectedVerses);
        }
    }, [location.state]);

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

    function handleLike(messageIndex) {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        
        if (likedMessages.has(messageIndex)) {
            newLiked.delete(messageIndex);
        } else {
            newLiked.add(messageIndex);
            newDisliked.delete(messageIndex);
        }
        
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
    }

    function handleDislike(messageIndex) {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        
        if (dislikedMessages.has(messageIndex)) {
            newDisliked.delete(messageIndex);
        } else {
            newDisliked.add(messageIndex);
            newLiked.delete(messageIndex);
        }
        
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
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
    function MessageActions({ content, messageIndex, isStreaming = false }) {
        if (isStreaming) return null;
        
        const isLiked = likedMessages.has(messageIndex);
        const isDisliked = dislikedMessages.has(messageIndex);
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
                    onClick={() => handleLike(messageIndex)}
                    title={isLiked ? t('ai_remove_like') : t('ai_like')}
                >
                    <Icon icon={<ThumbsUp />} size="small"/>
                </button>
                <button 
                    className={`${styles.actionButton} ${isDisliked ? styles.disliked : ''}`}
                    onClick={() => handleDislike(messageIndex)}
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

    // Obtener nombre del modo actual
    const currentModeName = availableModes.find(m => m.id === currentMode)?.name || currentMode;
    const currentDoctrineName = availablePerspectives.find(p => p.id === currentDoctrine)?.name || currentDoctrine;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerTitle}>
                        <h1>{t('ai_title')}</h1>
                        <p>{t('ai_subtitle')}</p>
                    </div>
                    <div className={styles.headerConfig}>
                        <IconButton 
                            onClick={() => setShowContextModal(true)}
                            icon={FileText}
                            variant="primary"
                            size="medium"
                            iconSize="medium"
                            circle={true}
                        >
                            {t('ai_context')}
                        </IconButton>
                        <IconButton 
                            onClick={() => setShowModeModal(true)}
                            icon={Settings}
                            variant="primary"
                            size="medium"
                            iconSize="medium"
                            circle={true}
                        >
                            {t('ai_config')}
                        </IconButton>
                    </div>
                </div>

                <div className={styles.headerMode}>
                    <div className={styles.modeBadges}>
                        <p>
                            {t('ai_mode')}
                        </p>
                        <span className={styles.modeBadge}>
                            <Icon icon={<User />} size="tiny" />
                            {currentModeName}
                        </span>
                        <span className={styles.modeBadge}>
                            <Icon icon={<BookOpen />} size="tiny" />
                            {currentDoctrineName}
                        </span>
                    </div>
                </div>
            </header>

            {/* Verse Citation */}
            {verseToExplain && verseToExplain.length > 0 && (
                <div className={styles.verseCitation}>
                    <span className={styles.citationLabel}>{t('ai_current_verse')}:</span>
                    <span className={styles.citationText}>{getVerseRange()}</span>
                </div>
            )}

            {/* Main Content */}
            <div className={styles.mainContent}>
                <div className={styles.chatContainer}>
                    {/* Messages */}
                    {messages.length > 0 && (
                        <div className={styles.messagesContainer}>
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                                >
                                    <div className={styles.messageHeader}>
                                        <span className={styles.messageRole}>
                                            {msg.role === 'user' ? (
                                                <>
                                                    <Icon icon={<User />} size="small" />
                                                    {' '}{t('ai_you')}
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon={<Bot />} size="small" />
                                                    {' '}{t('ai_assistant')}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.messageContent}>
                                        {msg.role === 'user' ? (
                                            <p>{msg.content}</p>
                                        ) : (
                                            <>
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                <MessageActions 
                                                    content={msg.content} 
                                                    messageIndex={index}
                                                    isStreaming={false}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Current streaming response */}
                            {currentResponse && (
                                <div className={`${styles.messageBubble} ${styles.assistantMessage}`}>
                                    <div className={styles.messageHeader}>
                                        <span className={styles.messageRole}>
                                            <Icon icon={<Bot />} size="small" />
                                            {' '}{t('ai_assistant')}
                                        </span>
                                    </div>
                                    <div className={styles.messageContent}>
                                        <ReactMarkdown>{currentResponse}</ReactMarkdown>
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
                                <div className={`${styles.messageBubble} ${styles.assistantMessage}`}>
                                    <div className={styles.messageHeader}>
                                        <span className={styles.messageRole}>
                                            <Icon icon={<Bot />} size="small" />
                                            {' '}{t('ai_assistant')}
                                        </span>
                                    </div>
                                    <div className={styles.messageContent}>
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
                                    : t('ai_placeholder_no_verses')
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
                        placeholder={t('ai_question_placeholder')}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        rows={2}
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
                            <button 
                                type="submit" 
                                className={styles.sendButton}
                                disabled={loading || !question.trim()}
                            >
                                <Icon icon={<ArrowUp />} size="tiny" />
                            </button>
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
            />
        </div>
    );
}

export default AI;

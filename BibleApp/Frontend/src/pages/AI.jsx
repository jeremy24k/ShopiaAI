import { useEffect, useState } from "react";
import { useAiStore } from "../store/AiStore";
import ReactMarkdown from 'react-markdown';
import { Link, useLocation } from "react-router-dom";
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
    ArrowUp
} from "lucide-react";
import ModeSelectorModal from "../components/ai/ModeSelectorModal";
import CurrentModeDisplay from "../components/ai/CurrentModeDisplay";
import Icon from "../components/ui/Icon";
import { useTranslation } from "../hooks/useTranslation";
import styles from './AI.module.css';

function AI() {
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
    const [currentMode, setCurrentMode] = useState('personal');           // NUEVO: modo de IA
    const [currentDoctrine, setCurrentDoctrine] = useState('evangelical');  // NUEVO: perspectiva doctrinal
    const [showModeModal, setShowModeModal] = useState(false);             // NUEVO: estado del modal
    const [availableModes, setAvailableModes] = useState([]);               // NUEVO: modos disponibles
    const [availablePerspectives, setAvailablePerspectives] = useState([]); // NUEVO: perspectivas disponibles
    const location = useLocation(); 
    const { t, language } = useTranslation();  // NUEVO: obtener idioma actual

    // NUEVO: Cargar modos y perspectivas disponibles
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

    // Función para generar el rango de versículos (ej: "Génesis 1:1-12")
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

    // NUEVO: Manejar clics en botones de explicación
    function handleExplanationClick(type) {
        explainVerse(verseToExplain, type, currentMode, currentDoctrine, language);
    }

    // NUEVO: Funciones para acciones de respuesta
    function handleCopy(content) {
        // Función para convertir markdown a texto plano
        const markdownToPlainText = (text) => {
            return text
                // Eliminar negritas y cursivas **texto** *texto*
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                // Eliminar encabezados ## y #
                .replace(/^#{1,6}\s+/gm, '')
                // Eliminar links [texto](url) -> texto
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                // Eliminar código inline `código`
                .replace(/`([^`]+)`/g, '$1')
                // Eliminar bloques de código ```código```
                .replace(/```[\s\S]*?```/g, '')
                // Eliminar líneas horizontales ---
                .replace(/^---+$/gm, '')
                // Limpiar múltiples espacios y saltos de línea
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        };
        
        const plainText = markdownToPlainText(content);
        
        navigator.clipboard.writeText(plainText).then(() => {
            setCopiedMessage(content);
            setTimeout(() => setCopiedMessage(null), 2000); // Reset después de 2 segundos
        }).catch(err => {
            console.error('Error al copiar texto:', err);
        });
    }

    function handleLike(messageIndex) {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        
        if (likedMessages.has(messageIndex)) {
            newLiked.delete(messageIndex); // Unlike
        } else {
            newLiked.add(messageIndex); // Like
            newDisliked.delete(messageIndex); // Remove dislike if exists
        }
        
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
        
        // Aquí podrías enviar feedback al backend
        console.log('Like para mensaje:', messageIndex, newLiked.has(messageIndex));
    }

    function handleDislike(messageIndex) {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        
        if (dislikedMessages.has(messageIndex)) {
            newDisliked.delete(messageIndex); // Remove dislike
        } else {
            newDisliked.add(messageIndex); // Dislike
            newLiked.delete(messageIndex); // Remove like if exists
        }
        
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
        
        // Aquí podrías enviar feedback al backend
        console.log('Dislike para mensaje:', messageIndex, newDisliked.has(messageIndex));
    }

    function handleShare(content) {
        if (navigator.share) {
            navigator.share({
                title: t('ai_assistant') + ' - ' + t('ai_ai_generated_content'),
                text: content,
                url: window.location.href
            }).catch(err => {
                console.error('Error al compartir:', err);
                // Fallback: copiar al portapapeles
                handleCopy(content);
            });
        } else {
            // Fallback: copiar al portapapeles
            handleCopy(content);
        }
    }

    // NUEVO: Componente para botones de acción
    function MessageActions({ content, messageIndex, isStreaming = false }) {
        if (isStreaming) return null; // No mostrar botones durante streaming
        
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


    return (
        <div className={styles.container}>
            <div className={styles.mainBox}>
                <section className={styles.section}>
                    <div className={styles.mainContent}>
                        <div className={styles.chatContainer}>
                            {/* SIEMPRE mostrar historial de mensajes unificado */}
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
                                    
                                    {/* Respuesta actual en streaming */}
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
                                                    messageIndex={messages.length} // Usar el próximo índice
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

                            {/* Loading para primera interacción */}
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

                            {/* Placeholder cuando no hay mensajes ni explicación */}
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

                        <div className={styles.actionsContainer}>
                            <form className={styles.chatForm} onSubmit={handleSubmitQuestion}>
                                <textarea 
                                    className={styles.chatTextarea}
                                    name="question" 
                                    placeholder={t('ai_question_placeholder')}
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                    rows={2}
                                />

                                <div className={styles.actionButtons}>
                                   <div className={styles.secondaryButtons}>
                                        <button 
                                            className={styles.btn} 
                                            onClick={() => handleExplanationClick('contextoHistorico')}
                                            disabled={loading || !verseToExplain?.length}
                                        >
                                            <Icon icon={<Scroll />} size="tiny" />
                                            {t('ai_historical_context')}
                                        </button>
                                        <button 
                                            className={styles.btn} 
                                            onClick={() => handleExplanationClick('aplicacionDiaria')}
                                            disabled={loading || !verseToExplain?.length}
                                        >
                                            <Icon icon={<Lightbulb />} size="tiny" />
                                            {t('ai_daily_application')}
                                        </button>
                                        <button 
                                            className={styles.btn} 
                                            onClick={() => handleExplanationClick('vesiculosRelacionados')}
                                            disabled={loading || !verseToExplain?.length}
                                        >
                                            <Icon icon={<Link2 />} size="tiny" />
                                            {t('ai_related_verses')}
                                        </button>
                                        <button 
                                            className={styles.btn} 
                                            onClick={() => handleExplanationClick('explicacionSencilla')}
                                            disabled={loading || !verseToExplain?.length}
                                        >
                                            <Icon icon={<Sparkles />} size="tiny" />
                                            {t('ai_simple_explanation')}
                                        </button>
                                        <button 
                                            className={styles.btn} 
                                            onClick={() => handleExplanationClick('TraducirAlIdiomaOriginal')}
                                            disabled={loading || !verseToExplain?.length}
                                        >
                                            <Icon icon={<Globe />} size="tiny" />
                                            {t('ai_original_language')}
                                        </button>
                                        <button 
                                            className={styles.btn} 
                                            onClick={() => handleExplanationClick('ProponerGuiaDeEstudio')}
                                            disabled={loading || !verseToExplain?.length}
                                        >
                                            <Icon icon={<BookOpen />} size="tiny" />
                                            {t('ai_study_guide')}
                                        </button>
                                   </div>
                                    <div className={styles.chatButtons}>
                                        <button 
                                            type="submit" 
                                            className={styles.chatSubmit}
                                            disabled={loading || !question.trim()}
                                        >
                                            <Icon icon={<ArrowUp />} size="tiny" />
                                        </button>
                                        {messages.length > 0 && (
                                            <button 
                                                type="button" 
                                                className={styles.clearChat}
                                                onClick={clearMessages}
                                                disabled={loading}
                                            >
                                                <Icon icon={<Trash2 />} size="small" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>

                           
                        </div>
                    </div>

                    <div className={styles.sidebar}>
                        {/* NUEVO: Current Mode Display */}
                        <CurrentModeDisplay
                            currentMode={currentMode}
                            currentDoctrine={currentDoctrine}
                            availableModes={availableModes}
                            availablePerspectives={availablePerspectives}
                            onOpenModal={() => setShowModeModal(true)}
                        />

                        <h2 className={styles.sidebarTitle}>
                            <Icon icon={<BookOpen />} size="small" />
                            {t('ai_selected_verses')}
                        </h2>
                        
                        {/* Modo Single: Card grande con un solo versículo */}
                        {verseToExplain?.length === 1 && (
                            <div className={styles.singleCard}>
                                <div className={styles.singleCardHeader}>
                                    <span className={styles.verseBadge}>{verseToExplain[0].bookName} {verseToExplain[0].chapterNumber}:{verseToExplain[0].verseNumber}</span>
                                    <span className={styles.translationBadge}>{verseToExplain[0].translation}</span>
                                </div>
                                <p className={styles.singleCardContent}>"{verseToExplain[0].content}"</p>
                            </div>
                        )}

                        {/* Modo Multiple: Card unificada con rango de versículos */}
                        {verseToExplain?.length > 1 && (
                            <div className={styles.passageCard}>
                                <div className={styles.passageHeader}>
                                    <span className={styles.verseBadge}>{getVerseRange()}</span>
                                    <span className={styles.translationBadge}>{verseToExplain?.[0]?.translation}</span>
                                </div>
                                <div className={styles.passageContent}>
                                    {verseToExplain?.map((verse, index) => (
                                        <p key={index} className={styles.passageVerse}>
                                            <sup className={styles.verseSup}>{verse.verseNumber}</sup>
                                            {verse.content}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No hay versículos seleccionados */}
                        {(!verseToExplain || verseToExplain.length === 0) && (
                            <div className={styles.noVerse}>
                                <p>{t('ai_no_verses_selected')}</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* NUEVO: Modal de configuración de IA */}
            <ModeSelectorModal
                isOpen={showModeModal}
                onClose={() => setShowModeModal(false)}
                currentMode={currentMode}
                currentDoctrine={currentDoctrine}
                onModeChange={setCurrentMode}
                onDoctrineChange={setCurrentDoctrine}
            />
        </div>
    );
}

export default AI;

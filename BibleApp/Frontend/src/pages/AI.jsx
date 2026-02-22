import { useEffect, useState, useRef } from "react";
import { useAiStore } from "../store/AiStore";
import { useAuthStore } from "../store/AuthStore";
import FeedbackService from "../services/FeedbackService";
import ReactMarkdown from "react-markdown";
import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
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
import Loading from "../components/ui/Loading";
import AIHistory from "../components/ai/AIHistory";
import { useTranslation } from "../hooks/useTranslation";
import CreditsDisplay from "../components/ai/CreditsDisplay";
import CreditStore from "../components/ai/CreditStore";
import InsufficientCreditsModal from "../components/ai/InsufficientCreditsModal";
import DailyBonusButton from "../components/ai/DailyBonusButton";
import MessageItem from "../components/ai/MessageItem";
import ChatInputArea from "../components/ai/ChatInputArea";
import styles from './AI.module.css';
import "../styles/animations.css";

function AI() {
    console.log('🔄 AI.jsx re-rendered');
    // Refs for scroll management
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const lastScrollTop = useRef(0);
    const isUserScrolling = useRef(false);
    const hasLoadedOptions = useRef(false);
    const scrollTimeout = useRef(null);
    const { conversationId: urlConversationId } = useParams();
    const navigate = useNavigate();

    // Selectores individuales - evita renderizados innecesarios
    const messages = useAiStore(state => state.messages);
    const loading = useAiStore(state => state.loading);
    const error = useAiStore(state => state.error);
    const currentResponse = useAiStore(state => state.currentResponse);
    const loadingMessages = useAiStore(state => state.loadingMessages);
    const modeId = useAiStore(state => state.modeId);
    const doctrineId = useAiStore(state => state.doctrineId);
    const availableModes = useAiStore(state => state.availableModes);
    const availableDoctrines = useAiStore(state => state.availableDoctrines);
    const currentConversationId = useAiStore(state => state.currentConversationId);

    // Acciones (funciones) - estas no causan renderizados
    const verseToExplain = useAiStore(state => state.verseToExplain);
    const setVerseToExplain = useAiStore(state => state.setVerseToExplain);
    const setUserId = useAiStore(state => state.setUserId);
    const removeVerseFromContext = useAiStore(state => state.removeVerseFromContext);
    const removeBookFromContext = useAiStore(state => state.removeBookFromContext);
    const clearAllContext = useAiStore(state => state.clearAllContext);
    const setModeId = useAiStore(state => state.setModeId);
    const setDoctrineId = useAiStore(state => state.setDoctrineId);
    const loadAvailableOptions = useAiStore(state => state.loadAvailableOptions);
    const loadSingleConversation = useAiStore(state => state.loadSingleConversation);
    const loadConversations = useAiStore(state => state.loadConversations);
    const clearLocalConversation = useAiStore(state => state.clearLocalConversation);

    // URL como fuente de verdad: /ai = nueva conversación, /ai/:id = cargar esa conversación
    useEffect(() => {
        if (!urlConversationId) {
            // Solo limpiar si hay una conversación activa
            if (currentConversationId) {
                clearLocalConversation();
            }
            return;
        }
        if (urlConversationId !== currentConversationId) {
            loadSingleConversation(urlConversationId);
        }
    }, [urlConversationId]); // ✅ Removido currentConversationId de dependencias

    const openHistorialSidebar = (value) => {
        setShowHistorialSidebar(value);
        loadConversations();
    };

    const [showCreditStore, setShowCreditStore] = useState(false);
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
    const [creditError, setCreditError] = useState(null);
    const user = useAuthStore(state => state.user);

    // Setear userId en el store cuando el usuario esté disponible
    useEffect(() => {
        if (user?.id) {
            setUserId(user.id);
        }
    }, [user?.id]);

    // Detectar error de créditos insuficientes
    useEffect(() => {
    if (error === 'insufficient_credits') {
        setShowInsufficientCreditsModal(true);
        setCreditError(error);
    }
    }, [error]);

    const [showModeModal, setShowModeModal] = useState(false);
    const [showContextModal, setShowContextModal] = useState(false);
    const [showHistorialSidebar, setShowHistorialSidebar] = useState(false);
    const location = useLocation(); 
    const { t, language } = useTranslation();

    // Cargar modos y doctrinas disponibles desde Zustand
 
    useEffect(() => {
        if (!hasLoadedOptions.current) {
            loadAvailableOptions();
            hasLoadedOptions.current = true;
        }
    }, []);

    // Función para generar el rango de versículos (funciona para estado actual o mensaje específico)
    function getVerseRange(verses = null, showBookName = true, maxBooks = 3) {
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
        
        const bookNames = Object.keys(groupedByBook);
        const totalBooks = bookNames.length;
        const booksToShow = bookNames.slice(0, maxBooks);
        
        // Formatear cada libro
        const bookStrings = booksToShow.map(bookName => {
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
            
            // Formatear cada capítulo
            const chapterStrings = Object.keys(chapters).map(chapter => {
                const verseNumbers = chapters[chapter].sort((a, b) => a - b);
                
                // Crear rangos consecutivos
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
            
            return `${showBookName ? (bookName).toLowerCase() : ''} ${chapterStrings.join('; ')}`;
        });
        
        const result = bookStrings.join('; ');
        
        // Agregar "..." si hay más libros
        return totalBooks > maxBooks ? `${result}...` : result;
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

        // 2. Obtener el nuevo estado actualizado
        const updatedVerses = verseToExplain.filter(v =>
            !(v.bookName === verseToRemove.bookName &&
            v.chapterNumber === verseToRemove.chapterNumber &&
            v.verseNumber === verseToRemove.verseNumber)
        );
        
        // 3. Actualizar sessionStorage
        updateSessionStorage(updatedVerses);
    };
    
    const handleRemoveBook = (bookName) => {
        removeBookFromContext(bookName);

        // 2. Obtener versículos actualizados (filtrando el libro eliminado)
        const updatedVerses = verseToExplain.filter(v => v.bookName !== bookName);
        
        // 3. Actualizar sessionStorage
        updateSessionStorage(updatedVerses);
    };
    
    const handleClearAll = () => {
        clearAllContext();
        sessionStorage.removeItem('pendingVerses');
    };

    const updateSessionStorage = (verses) => {
        if (verses.length > 0) {
            sessionStorage.setItem('pendingVerses', JSON.stringify({
                verses: verses,
                timestamp: Date.now()
            }));
        } else {
            sessionStorage.removeItem('pendingVerses');
        }
    };

    // Recibir versículos desde la navegación (acumulativo)
    useEffect(() => {
        if (location.state?.selectedVerses) {
            // Leer existentes
            const pendingData = sessionStorage.getItem('pendingVerses');
            const existing = pendingData ? JSON.parse(pendingData) : { verses: [], timestamp: Date.now() };

            console.log(pendingData);
            console.log(existing);
            
            
            // Crear mapa para evitar duplicados
            const verseMap = new Map();
            
            // Agregar existentes
            existing.verses.forEach(verse => {
                const key = `${verse.bookName}-${verse.chapterNumber}-${verse.verseNumber}`;
                verseMap.set(key, verse);
            });
            
            // Agregar nuevos
            location.state.selectedVerses.forEach(verse => {
                const key = `${verse.bookName}-${verse.chapterNumber}-${verse.verseNumber}`;
                verseMap.set(key, verse);
            });
            
            // Guardar combinados
            sessionStorage.setItem('pendingVerses', JSON.stringify({
                verses: Array.from(verseMap.values()),
                timestamp: Date.now()
            }));
            
            // Actualizar store
            addToContext(location.state.selectedVerses);
        }
    }, [location.state?.selectedVerses]);

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
    }, [messages.length, currentResponse]);

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

    useEffect(() => {
        const restoreVersesFromSession = () => {
            const pendingData = sessionStorage.getItem('pendingVerses');
            
            if (pendingData) {
                try {
                    const { verses } = JSON.parse(pendingData);
                    
                    if (verses && verses.length > 0 && verseToExplain.length === 0 && !urlConversationId) {
                        console.log('🔄 Restaurando versículos desde sessionStorage:', verses);
                        
                        setVerseToExplain(verses);
                    }
                } catch (error) {
                    console.error('Error restaurando versículos:', error);
                }
            }
        };

        restoreVersesFromSession();
    }, [location.pathname, verseToExplain.length, urlConversationId, messages.length]);

    const getModeName = (modeId) => {
        const mode = availableModes.find(m => m.id === modeId);
        return mode?.name || modeId;
    };

    const getDoctrineName = (doctrineId) => {
        const doctrine = availableDoctrines.find(p => p.id === doctrineId);
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
                                onClick={() => openHistorialSidebar(true)}
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
                            {user && (
                                <>
                                    <DailyBonusButton />
                                    <CreditsDisplay onClick={() => setShowCreditStore(true)} />
                                </>
                            )}
                        </div>
                        
                        <div className={styles.headerMode}>
                            <div className={styles.modeBadges}>
                                <p>
                                    {t('ai_mode')}
                                </p>
                                <span className={styles.modeBadge}>
                                    <Icon icon={<User />} size="tiny" />
                                    {getModeName(modeId)}
                                </span>
                                <span className={styles.modeBadge}>
                                    <Icon icon={<BookOpen />} size="tiny" />
                                    {getDoctrineName(doctrineId)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>


            {loadingMessages && (
                <div className={styles.messagesContainer}>
                    <p className={styles.loadingMessage}>
                        <Loading />
                        Cargando mensajes...
                    </p>
                </div>
            )}

            {!loadingMessages && (
                <div className={styles.mainContent}>
                    <div className={styles.chatContainer}>
                        {/* Messages */}
                        {messages.length > 0 && (
                            <div className={styles.messagesContainer}>
                                    {messages.map((msg, index) => (
                                        <MessageItem 
                                            key={index}
                                            msg={msg}
                                            index={index}
                                            previousUserMessage={messages[index-1]}
                                        />
                                    ))}
                                    {/* Current streaming response */}
                                    {currentResponse && (
                                        <MessageItem 
                                            msg={{ role: 'assistant', content: currentResponse }}
                                            index={messages.length}
                                            isStreaming={true}
                                        />
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
                )}         

            {/* Input Area */}
            <ChatInputArea setShouldAutoScroll={setShouldAutoScroll} />

            {/* Modals */}
            <ModeSelectorModal
                isOpen={showModeModal}
                onClose={() => setShowModeModal(false)}
                currentMode={modeId}
                currentDoctrine={doctrineId}
                onModeChange={setModeId}
                onDoctrineChange={setDoctrineId}
                availableModes={availableModes}
                availableDoctrines={availableDoctrines}
            />

            <ContextModal
                isOpen={showContextModal}
                onClose={() => setShowContextModal(false)}
                verses={verseToExplain}
                onRemoveVerse={handleRemoveVerse}
                onRemoveBook={handleRemoveBook}
                onClearAll={handleClearAll}
                getVerseRange={getVerseRange}
            />

            {/* Sidebar */}
            {showHistorialSidebar && (
                <div 
                    className={styles.history_overlay + ' ' + "fadeIn"}
                    onClick={() => openHistorialSidebar(false)}
                />
            )}
            <div className={`${styles.ctn_history_sidebar} ${showHistorialSidebar ? styles.open : ''}`}>
                <div className={styles.history_header}>
                    <h2>{t('ai_history')}</h2>
                    <IconButton 
                        onClick={() => openHistorialSidebar(false)}
                        icon={X}
                        variant="ghost"
                        size="small"
                        iconSize="medium"
                        circle={true}
                    />
                </div>
                <AIHistory 
                    currentConversationId={currentConversationId}
                    setShowHistorialSidebar={openHistorialSidebar}
                />
            </div>

            {/* Modales de Créditos */}
            {showCreditStore && (
                <CreditStore onClose={() => setShowCreditStore(false)} />
            )}
            
            {showInsufficientCreditsModal && (
                <InsufficientCreditsModal
                    onClose={() => setShowInsufficientCreditsModal(false)}
                    onBuyCredits={() => {
                        setShowInsufficientCreditsModal(false);
                        setShowCreditStore(true);
                    }}
                    currentCredits={0}
                    required={1}
                />
            )}
        </div>
    );
}

export default AI;


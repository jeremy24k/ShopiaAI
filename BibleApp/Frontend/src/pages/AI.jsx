// ========================================
// IMPORTS
// ========================================
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useAiStore } from "../store/AiStore";
import { useAuthStore } from "../store/AuthStore";
import { useNotificationStore } from '../store/NotificationStore';
import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
import { 
    X,
    TriangleAlert,
} from "lucide-react";
import Loading from "../components/ui/Loading";
import AIHistory from "../components/ai/AIHistory";
import AIHeader from "../components/ai/AIHeader";
import { useTranslation } from "../hooks/useTranslation";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useAIModals } from "../hooks/useAIModals";
import MessageItem from "../components/ai/MessageItem";
import ChatInputArea from "../components/ai/ChatInputArea";
import IconButton from "../components/ui/IconButton";
import Icon from "../components/ui/Icon";
import { useCredits } from "../store/useCredits";
import { getVerseRange, getModeName, getDoctrineName, getVerseCompactLabel } from "../utils/verseFormatting";
import styles from '../styles/AI.module.css';
import "../styles/animations.css";

// Lazy load heavy modals
const ModeSelectorModal = lazy(() => import("../components/ai/ModeSelectorModal"));
const ContextModal = lazy(() => import("../components/ai/ContextModal"));
const CreditStore = lazy(() => import("../components/ai/CreditStore"));
const InsufficientCreditsModal = lazy(() => import("../components/ai/InsufficientCreditsModal"));
const AIHelpModal = lazy(() => import("../components/ai/AIHelpModal"));
import AIEmptyState from "../components/ai/AIEmptyState";

// ========================================
// MAIN COMPONENT
// ========================================
function AI() {
    // ========================================
    // STATE & REFS
    // ========================================
    
    // UI State
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [creditError, setCreditError] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const { credits, hasFetched } = useCredits();
    
    // Modals state (extracted to custom hook)
    const modals = useAIModals();
    const {
        showModeModal,
        showContextModal,
        showHistorialSidebar,
        showCreditStore,
        showInsufficientCreditsModal,
        setShowModeModal,
        setShowContextModal,
        setShowCreditStore,
        setShowInsufficientCreditsModal,
        openHistorialSidebar,
    } = modals;
    
    // Refs
    const isChangingConversation = useRef(false);
    const prevUrlConversationId = useRef(undefined);
    const urlConversationIdRef = useRef(undefined);
    const loadingConversationIdRef = useRef(null);
    
    // Router
    const { conversationId: urlConversationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Translation
    const { t, language } = useTranslation();
    
    // ========================================
    // STORE SELECTORS
    // ========================================
    
    // Ai Store - State (causes re-renders)
    const messages = useAiStore(state => state.messages);
    const loading = useAiStore(state => state.loading);
    const error = useAiStore(state => state.error);
    const currentResponse = useAiStore(state => state.currentResponse);
    const sendingMessage = useAiStore(state => state.sendingMessage);
    const creditErrorData = useAiStore(state => state.creditErrorData);
    const loadingMessages = useAiStore(state => state.loadingMessages);
    const modeId = useAiStore(state => state.modeId);
    const doctrineId = useAiStore(state => state.doctrineId);
    const availableModes = useAiStore(state => state.availableModes);
    const availableDoctrines = useAiStore(state => state.availableDoctrines);
    const currentConversationId = useAiStore(state => state.currentConversationId);
    const verseToExplain = useAiStore(state => state.verseToExplain);
    
    // Ai Store - Actions (no re-renders)
    const setVerseToExplain = useAiStore(state => state.setVerseToExplain);
    const setUserId = useAiStore(state => state.setUserId);
    const removeVerseFromContext = useAiStore(state => state.removeVerseFromContext);
    const removeBookFromContext = useAiStore(state => state.removeBookFromContext);
    const clearAllContext = useAiStore(state => state.clearAllContext);
    const setModeId = useAiStore(state => state.setModeId);
    const setDoctrineId = useAiStore(state => state.setDoctrineId);
    const loadAvailableOptions = useAiStore(state => state.loadAvailableOptions);
    const loadSingleConversation = useAiStore(state => state.loadSingleConversation);
    const setError = useAiStore(state => state.setError);
    const clearLocalConversation = useAiStore(state => state.clearLocalConversation);
    
    // Other Stores
    const user = useAuthStore(state => state.user);
    const notificationStore = useNotificationStore();
    
    // ========================================
    // EFFECTS
    // ========================================
    
    // Load conversation from URL (and sync URL when we create a new conversation from /ai)
    useEffect(() => {
        urlConversationIdRef.current = urlConversationId;
        const hadIdInUrl = prevUrlConversationId.current != null && prevUrlConversationId.current !== '';

        if (urlConversationId && urlConversationId !== currentConversationId) {
            // ✅ Solo intentar cargar si hay usuario autenticado
            if (!user?.id) {
                // Esperar a que el usuario cargue antes de intentar cargar la conversación
                return;
            }

            // ✅ CRÍTICO: Sincronizar userId en el store ANTES de cargar la conversación
            setUserId(user.id);

            isChangingConversation.current = true;
            setShouldAutoScroll(true);
            loadingConversationIdRef.current = urlConversationId;
            const loadingId = urlConversationId;
            loadSingleConversation(urlConversationId).then((result) => {
                if (result?.notFound) {
                    navigate('/ai', { replace: true });
                    clearLocalConversation();
                } else if (urlConversationIdRef.current !== loadingId) {
                    clearLocalConversation();
                }
                loadingConversationIdRef.current = null;
                setTimeout(() => {
                    isChangingConversation.current = false;
                }, 1500);
            });
        } else if (!urlConversationId && currentConversationId) {
            if (currentConversationId === loadingConversationIdRef.current) {
                clearLocalConversation();
                loadingConversationIdRef.current = null;
            } else if (hadIdInUrl) {
                clearLocalConversation();
            } else {
                navigate(`/ai/${currentConversationId}`, { replace: true });
            }
        }

        prevUrlConversationId.current = urlConversationId;
    }, [urlConversationId, currentConversationId, user?.id, loadSingleConversation, setShouldAutoScroll, navigate, clearLocalConversation]);
    
    // Set user ID in store
    useEffect(() => {
        if (user?.id) {
            setUserId(user.id);
        }
    }, [user?.id]);
    
    // Handle insufficient credits error
    useEffect(() => {
        if (error === 'insufficient_credits') {
            setShowInsufficientCreditsModal(true);
            setCreditError(t('insufficient_credits_msg'));
        }
        if (error === 'authentication_required') {
            navigate('/login');
        }
    }, [error]);
    
    // Cleanup error state when component unmounts
    useEffect(() => {
        return () => {
            setError(null);
        };
    }, []);
    
    // Load available modes and doctrines
    useEffect(() => {
        loadAvailableOptions(language);
    }, [language]);

    useEffect(() => {
        console.log(verseToExplain);
    }, [verseToExplain]);
    
    // Handle verses from navigation (logic inlined to avoid stale closure on verseToExplain)
    useEffect(() => {
        if (!location.state?.selectedVerses?.length) return;

        const { verseToExplain: currentVerses, setVerseToExplain: setVerses } = useAiStore.getState();
        const newVerses = location.state.selectedVerses;
        const filtered = newVerses.filter(
            (newVerse) =>
                !currentVerses.some(
                    (existing) =>
                        existing.bookName === newVerse.bookName &&
                        existing.chapterNumber === newVerse.chapterNumber &&
                        existing.verseNumber === newVerse.verseNumber &&
                        (existing.translationValue || existing.translation) === (newVerse.translationValue || newVerse.translation)
                )
        );
        if (filtered.length > 0) {
            setVerses([...currentVerses, ...filtered]);
        }

        const pendingData = sessionStorage.getItem('pendingVerses');
        const existing = pendingData ? JSON.parse(pendingData) : { verses: [], timestamp: Date.now() };
        const verseMap = new Map();
        existing.verses.forEach((verse) => {
            const key = `${verse.bookName}-${verse.chapterNumber}-${verse.verseNumber}-${verse.translationValue || verse.translation}`;
            verseMap.set(key, verse);
        });
        newVerses.forEach((verse) => {
            const key = `${verse.bookName}-${verse.chapterNumber}-${verse.verseNumber}-${verse.translationValue || verse.translation}`;
            verseMap.set(key, verse);
        });
        sessionStorage.setItem(
            'pendingVerses',
            JSON.stringify({ verses: Array.from(verseMap.values()), timestamp: Date.now() })
        );
    }, [location.state?.selectedVerses]);
    
    // ========================================
    // AUTO-SCROLL
    // ========================================
    
    // Custom hook para manejar auto-scroll
    useAutoScroll(
        shouldAutoScroll,
        setShouldAutoScroll,
        messages,
        currentResponse,
        urlConversationId,
        isChangingConversation.current
    );
    
    // Restore verses from sessionStorage
    useEffect(() => {
        const pendingData = sessionStorage.getItem('pendingVerses');
        
        if (!pendingData) return;
        
        try {
            const { verses } = JSON.parse(pendingData);
            
            if (!verses?.length) return;
            
            // CASE 1: New conversation - restore all verses
            if (!urlConversationId && verseToExplain.length === 0) {
                setVerseToExplain(verses);
                
                // Info notification
                notificationStore.showInfo(
                    `${verses.length} ${verses.length === 1 ? 'verse' : 'verses'} restored from your previous session`,
                    { duration: 4000 }
                );
            }
            
            // CASE 2: Existing conversation - only add new verses
            if (urlConversationId && verseToExplain.length > 0) {
                const currentKeys = new Set(
                    verseToExplain.map(v => v.verseKey || `${v.bookName}-${v.chapterNumber}-${v.verseNumber}`)
                );
                
                const newVerses = verses.filter(v => {
                    const key = v.verseKey || `${v.bookName}-${v.chapterNumber}-${v.verseNumber}`;
                    return !currentKeys.has(key);
                });
                
                if (newVerses.length > 0) {
                    setVerseToExplain([...verseToExplain, ...newVerses]);

                    // Notification with optional action
                    notificationStore.showWithAction(
                        `${newVerses.length} ${t('ai_new_verses_added')}`,
                        t('ai_view_context'),
                        () => {
                            setShowContextModal(true)
                            openHistorialSidebar(false)
                        },
                        { duration: 6000 }
                    );
                }
            }

            // CASE 3: Old conversation with no context - add pending verses so user can use them here too
            if (urlConversationId && verseToExplain.length === 0 && verses.length > 0) {
                setVerseToExplain(verses);
                notificationStore.showInfo(
                    `${verses.length} ${t('ai_verses_added')}`,
                    { duration: 4000 }
                );
            }

        } catch (error) {
            console.error('Error restoring verses:', error);
            notificationStore.showError(t('ai_error_restoring_context'));
        }
    }, [location.pathname, urlConversationId, verseToExplain]);
    
    // ========================================
    // CONTEXT MANAGEMENT
    // ========================================
    
    // Add verses to context (avoid duplicates)
    const addToContext = (newVerses) => {
        if (!newVerses || newVerses.length === 0) return;
        
        // Avoid duplicates
        const filtered = newVerses.filter(newVerse => 
            !verseToExplain.some(existing => 
                existing.bookName === newVerse.bookName &&
                existing.chapterNumber === newVerse.chapterNumber &&
                existing.verseNumber === newVerse.verseNumber &&
                (existing.translationValue || existing.translation) === (newVerse.translationValue || newVerse.translation)
            )
        );
        
        if (filtered.length > 0) {
            setVerseToExplain([...verseToExplain, ...filtered]);
        }
    };
    
    // Remove single verse from context
    const handleRemoveVerse = (verseToRemove) => {
        removeVerseFromContext(verseToRemove);
        
        // Update sessionStorage only if verse was there
        const pendingData = sessionStorage.getItem('pendingVerses');
        if (pendingData) {
            const { verses } = JSON.parse(pendingData);
            const updatedStorageVerses = verses.filter(v =>
                !(v.bookName === verseToRemove.bookName &&
                v.chapterNumber === verseToRemove.chapterNumber &&
                v.verseNumber === verseToRemove.verseNumber &&
                (v.translationValue || v.translation) === (verseToRemove.translationValue || verseToRemove.translation))
            );
            updateSessionStorage(updatedStorageVerses);
        }
    };
    
    // Remove all verses from a book/translation tab
    const handleRemoveBook = ({ bookName, translationValue }) => {
        removeBookFromContext({ bookName, translationValue });
        
        // Update sessionStorage only if book verses were there
        const pendingData = sessionStorage.getItem('pendingVerses');
        if (pendingData) {
            const { verses } = JSON.parse(pendingData);
            const updatedStorageVerses = verses.filter(v => 
                !(v.bookName === bookName && (v.translationValue || v.translation) === translationValue)
            );
            updateSessionStorage(updatedStorageVerses);
        }
    };
    
    // Clear all context
    const handleClearAll = () => {
        clearAllContext();
        sessionStorage.removeItem('pendingVerses');
    };
    
    // Update sessionStorage helper
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
    
    
    // ========================================
    // RENDER
    // ========================================
    
    return (
        <div className={styles.container}>
            <div className={`${styles.headerGroup} TranslateY`}>
                {/* Announcement Bar for Credits */}
                {(hasFetched && credits <= 0) && (
                    <div className={`${styles.announcementBar} ${styles.announcementBarWarning}`}>
                        <Icon icon={<TriangleAlert />} size="tiny" />
                        <span>{t('insufficient_credits_msg')}</span>
                        <button 
                            className={styles.announcementButton}
                            onClick={() => setShowCreditStore(true)}
                        >
                            {t('ai_buy_credits')}
                        </button>
                    </div>
                )}

                {/* Header */}
                <AIHeader
                    t={t}
                    verseToExplain={verseToExplain}
                    getVerseRange={getVerseRange}
                    getVerseCompactLabel={(verses) => getVerseCompactLabel(verses, language)}
                    setShowContextModal={setShowContextModal}
                    openHistorialSidebar={openHistorialSidebar}
                    setShowModeModal={setShowModeModal}
                    setShowCreditStore={setShowCreditStore}
                    setShowHelpModal={setShowHelpModal}
                    user={user}
                    modeId={modeId}
                    doctrineId={doctrineId}
                    getModeName={(id) => getModeName(id, availableModes)}
                    getDoctrineName={(id) => getDoctrineName(id, availableDoctrines)}
                />
            </div>

            {loadingMessages && (
                <div className={styles.messagesContainer}>
                    <p className={styles.loadingMessage}>
                        <Loading />
                        {t('ai_loading_messages')}
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
                                     {(sendingMessage && !currentResponse || (loading && !currentResponse)) && (
                                         <div className={styles.assistantAnswerContainer}>
                                             <div className={styles.assistantAnswerContent}>
                                                 <span className={styles.loadingAIMessage}>
                                                     <div className={styles.typingIndicator}>
                                                         <span></span>
                                                         <span></span>
                                                         <span></span>
                                                     </div>

                                                     {sendingMessage && !loading 
                                                         ? t('ai_verifying_credits')
                                                         : t('ai_generating_response')
                                                     }
                                                 </span>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             )}

                             {/* Loading for first interaction directly in messages container if no messages exist yet */}
                             {messages.length === 0 && (sendingMessage || loading) && !currentResponse && (
                                 <div className={styles.messagesContainer}>
                                     <div className={styles.assistantAnswerContainer}>
                                         <div className={styles.assistantAnswerContent}>
                                             <span className={styles.loadingAIMessage}>
                                                 <div className={styles.typingIndicator}>
                                                     <span></span>
                                                     <span></span>
                                                     <span></span>
                                                 </div>

                                                 {sendingMessage && !loading 
                                                     ? t('ai_verifying_credits')
                                                     : t('ai_generating_explanation')
                                                 }
                                             </span>
                                         </div>
                                     </div>
                                 </div>
                             )}
                            {/* Loading for first interaction (Fallback loader removed, using chat bubbles instead to prevent flashes) */}
                            
                            {/* Generic Errors (excluding credits which are in the announcement bar) */}
                            {(error && error !== "insufficient_credits") && (
                                <div className={styles.AIerror}>
                                    <div className={styles.ctnHeader}>
                                        <Icon icon={<TriangleAlert />} />
                                        <strong>{t('ai_error')}:</strong>
                                    </div>
                                    {error}
                                </div>
                            )}

                            {/* Empty State */}
                            {messages.length === 0 && !loading && !sendingMessage && (!error || error === "insufficient_credits") && (
                                <AIEmptyState
                                    language={language}
                                    onHelpClick={() => setShowHelpModal(true)}
                                    verseCount={verseToExplain?.length || 0}
                                />
                            )}
                        </div>
                    </div>
                )}         

            {/* Input Area */}
            <ChatInputArea 
                hasConversation={messages.length > 0 ? true : false} 
                setShouldAutoScroll={setShouldAutoScroll} 
            />

            {/* Modals */}
            <Suspense fallback={null}>
                {showModeModal && (
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
                )}

                {showContextModal && (
                    <ContextModal
                        isOpen={showContextModal}
                        onClose={() => setShowContextModal(false)}
                        verses={verseToExplain}
                        onRemoveVerse={handleRemoveVerse}
                        onRemoveBook={handleRemoveBook}
                        onClearAll={handleClearAll}
                        getVerseRange={getVerseRange}
                    />
                )}

                {showHelpModal && (
                    <AIHelpModal
                        isOpen={showHelpModal}
                        onClose={() => setShowHelpModal(false)}
                        language={language}
                    />
                )}
            </Suspense>

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
                    isVisible={showHistorialSidebar}
                />
            </div>

            {/* Credit Modals */}
            <Suspense fallback={null}>
                {showCreditStore && (
                    <CreditStore onClose={() => setShowCreditStore(false)} />
                )}
                
                {showInsufficientCreditsModal && (
                    <InsufficientCreditsModal
                        onClose={() => {
                            setShowInsufficientCreditsModal(false);
                            setError(null);
                        }}
                        onBuyCredits={() => {
                            setShowInsufficientCreditsModal(false);
                            setShowCreditStore(true);
                            setError(null);
                        }}
                        currentCredits={creditErrorData?.current_credits || 0}
                        required={creditErrorData?.required || 1}
                    />
                )}
            </Suspense>
        </div>
    );
}

export default AI;

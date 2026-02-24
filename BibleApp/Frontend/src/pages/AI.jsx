// ========================================
// IMPORTS
// ========================================
import { useEffect, useState, useRef } from "react";
import { useAiStore } from "../store/AiStore";
import { useAuthStore } from "../store/AuthStore";
import { useNotificationStore } from '../store/NotificationStore';
import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
import { 
    X,
    AlertTriangle,
} from "lucide-react";
import ModeSelectorModal from "../components/ai/ModeSelectorModal";
import ContextModal from "../components/ai/ContextModal";
import Loading from "../components/ui/Loading";
import AIHistory from "../components/ai/AIHistory";
import AIHeader from "../components/ai/AIHeader";
import { useTranslation } from "../hooks/useTranslation";
import CreditStore from "../components/ai/CreditStore";
import InsufficientCreditsModal from "../components/ai/InsufficientCreditsModal";
import MessageItem from "../components/ai/MessageItem";
import ChatInputArea from "../components/ai/ChatInputArea";
import IconButton from "../components/ui/IconButton";
import styles from './AI.module.css';
import "../styles/animations.css";

// ========================================
// MAIN COMPONENT
// ========================================
function AI() {
    // ========================================
    // STATE & REFS
    // ========================================
    
    // UI State
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [showModeModal, setShowModeModal] = useState(false);
    const [showContextModal, setShowContextModal] = useState(false);
    const [showHistorialSidebar, setShowHistorialSidebar] = useState(false);
    const [showCreditStore, setShowCreditStore] = useState(false);
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
    const [creditError, setCreditError] = useState(null);
    
    // Refs
    const lastScrollTop = useRef(0);
    const isUserScrolling = useRef(false);
    const hasLoadedOptions = useRef(false);
    const scrollTimeout = useRef(null);
    
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
    const loadConversations = useAiStore(state => state.loadConversations);
    const clearLocalConversation = useAiStore(state => state.clearLocalConversation);
    
    // Other Stores
    const user = useAuthStore(state => state.user);
    const notificationStore = useNotificationStore();
    
    // ========================================
    // EFFECTS
    // ========================================
    
    // Load conversation from URL
    useEffect(() => {
        if (urlConversationId && urlConversationId !== currentConversationId) {
            loadSingleConversation(urlConversationId);
        }
    }, [urlConversationId]);
    
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
            setCreditError(error);
        }
    }, [error]);
    
    // Load available modes and doctrines
    useEffect(() => {
        if (!hasLoadedOptions.current) {
            loadAvailableOptions();
            hasLoadedOptions.current = true;
        }
    }, []);
    
    // Handle verses from navigation
    useEffect(() => {
        if (location.state?.selectedVerses) {
            // Read existing verses from storage
            const pendingData = sessionStorage.getItem('pendingVerses');
            const existing = pendingData ? JSON.parse(pendingData) : { verses: [], timestamp: Date.now() };

            // Create map to avoid duplicates
            const verseMap = new Map();
            
            // Add existing verses
            existing.verses.forEach(verse => {
                const key = `${verse.bookName}-${verse.chapterNumber}-${verse.verseNumber}`;
                verseMap.set(key, verse);
            });
            
            // Add new verses
            location.state.selectedVerses.forEach(verse => {
                const key = `${verse.bookName}-${verse.chapterNumber}-${verse.verseNumber}`;
                verseMap.set(key, verse);
            });
            
            // Save combined verses
            sessionStorage.setItem('pendingVerses', JSON.stringify({
                verses: Array.from(verseMap.values()),
                timestamp: Date.now()
            }));
            
            // Update store
            addToContext(location.state.selectedVerses);
        }
    }, [location.state?.selectedVerses]);
    
    // Auto-scroll to bottom
    useEffect(() => {
        if (shouldAutoScroll) {
            const mainElement = document.querySelector('main.ai');
            if (mainElement) {
                mainElement.scrollTo({
                    top: mainElement.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [messages.length, currentResponse]);
    
    // Scroll event listener
    useEffect(() => {
        const mainElement = document.querySelector('main.ai');
        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll);
            return () => {
                mainElement.removeEventListener('scroll', handleScroll);
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }
            };
        }
    }, []);
    
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
                        `Added ${newVerses.length} ${newVerses.length === 1 ? 'new verse' : 'new verses'} to this conversation`,
                        'View Context',
                        () => {
                            setShowContextModal(true)
                            setShowHistorialSidebar(false)
                        },
                        { duration: 6000 }
                    );
                }
            }
            
        } catch (error) {
            console.error('Error restoring verses:', error);
            notificationStore.showError('Error restoring context');
        }
    }, [location.pathname, urlConversationId, verseToExplain]);
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    // Format verse range for display
    function getVerseRange(verses = null, showBookName = true, maxBooks = 3) {
        const verseArray = verses || verseToExplain;
        
        if (!verseArray || verseArray.length === 0) return '';
        
        if (verseArray.length === 1) {
            const v = verseArray[0];
            return `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`;
        }
        
        // Group by book for multiple books display
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
        
        // Format each book
        const bookStrings = booksToShow.map(bookName => {
            const verses = groupedByBook[bookName];
            verses.sort((a, b) => a.chapterNumber - b.chapterNumber || a.verseNumber - b.verseNumber);
            
            // Group by chapter
            const chapters = {};
            verses.forEach(v => {
                if (!chapters[v.chapterNumber]) {
                    chapters[v.chapterNumber] = [];
                }
                chapters[v.chapterNumber].push(v.verseNumber);
            });
            
            // Format each chapter
            const chapterStrings = Object.keys(chapters).map(chapter => {
                const verseNumbers = chapters[chapter].sort((a, b) => a - b);
                
                // Create consecutive ranges
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
        
        // Add "..." if there are more books
        return totalBooks > maxBooks ? `${result}...` : result;
    }
    
    // Get mode display name
    const getModeName = (modeId) => {
        const mode = availableModes.find(m => m.id === modeId);
        return mode?.name || modeId;
    };
    
    // Get doctrine display name
    const getDoctrineName = (doctrineId) => {
        const doctrine = availableDoctrines.find(p => p.id === doctrineId);
        return doctrine?.name || doctrineId;
    };
    
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
                existing.verseNumber === newVerse.verseNumber
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
                v.verseNumber === verseToRemove.verseNumber)
            );
            updateSessionStorage(updatedStorageVerses);
        }
    };
    
    // Remove all verses from a book
    const handleRemoveBook = (bookName) => {
        removeBookFromContext(bookName);
        
        // Update sessionStorage only if book verses were there
        const pendingData = sessionStorage.getItem('pendingVerses');
        if (pendingData) {
            const { verses } = JSON.parse(pendingData);
            const updatedStorageVerses = verses.filter(v => v.bookName !== bookName);
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
    // SCROLL MANAGEMENT
    // ========================================
    
    // Handle scroll events
    const handleScroll = () => {
        const mainElement = document.querySelector('main.ai');
        if (!mainElement) return;
        
        const currentScrollTop = mainElement.scrollTop;
        const scrollHeight = mainElement.scrollHeight;
        const clientHeight = mainElement.clientHeight;
        const isAtBottom = scrollHeight - currentScrollTop - clientHeight <= 0;
        
        // Detect user scrolling up
        if (currentScrollTop < lastScrollTop.current) {
            isUserScrolling.current = true;
            setShouldAutoScroll(false);
            
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
            
            scrollTimeout.current = setTimeout(() => {
                isUserScrolling.current = false;
            }, 1000);
        }
        
        // Re-enable auto-scroll if at bottom and not manually scrolling
        if (isAtBottom && !isUserScrolling.current && !shouldAutoScroll) {
            setShouldAutoScroll(true);
        }
        
        lastScrollTop.current = currentScrollTop;
    };
    
    // ========================================
    // UI HANDLERS
    // ========================================
    
    // Open/close history sidebar
    const openHistorialSidebar = (value) => {
        setShowHistorialSidebar(value);
        loadConversations();
    };
    
    // ========================================
    // RENDER
    // ========================================
    
    return (
        <div className={styles.container}>
            {/* Header */}
            <AIHeader
                t={t}
                verseToExplain={verseToExplain}
                getVerseRange={getVerseRange}
                setShowContextModal={setShowContextModal}
                openHistorialSidebar={openHistorialSidebar}
                setShowModeModal={setShowModeModal}
                setShowCreditStore={setShowCreditStore}
                user={user}
                modeId={modeId}
                doctrineId={doctrineId}
                getModeName={getModeName}
                getDoctrineName={getDoctrineName}
            />

            {loadingMessages && (
                <div className={styles.messagesContainer}>
                    <p className={styles.loadingMessage}>
                        <Loading />
                        Loading messages...
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

            {/* Credit Modals */}
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

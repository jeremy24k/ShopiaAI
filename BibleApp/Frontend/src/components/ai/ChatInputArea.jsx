import { useState, useRef, useCallback } from 'react';
import { 
    ChevronLeft, ChevronRight, Scroll, Lightbulb, Link2, 
    Sparkles, Globe, BookOpen, CircleStop, ArrowUp, Lock 
} from "lucide-react";
import Icon from "../ui/Icon";
import { useTranslation } from "../../hooks/useTranslation";
import { useAiStore } from "../../store/AiStore";
import { useCredits } from "../../store/useCredits";
import styles from '../../styles/AI.module.css';

export default function ChatInputArea({ setShouldAutoScroll, hasConversation, onDemoLock }) {
    const { t, language } = useTranslation();
    // ↓ Ya no usamos useState para el texto — el DOM lo gestiona directamente
    const [isEmpty, setIsEmpty] = useState(true);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const editableRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const { credits, fetchCredits } = useCredits();
    const setError = useAiStore(state => state.setError);
    
    // Selectors from aiStore
    const loading = useAiStore(state => state.loading);
    const modeId = useAiStore(state => state.modeId);
    const doctrineId = useAiStore(state => state.doctrineId);
    const verseToExplain = useAiStore(state => state.verseToExplain);
    const messages = useAiStore(state => state.messages);
    const aiCosts = useAiStore(state => state.aiCosts);
    const userId = useAiStore(state => state.userId);
    const isDemoMode = !userId;
    
    // Actions from aiStore
    const askQuestion = useAiStore(state => state.askQuestion);
    const explainVerse = useAiStore(state => state.explainVerse);
    const cancelResponse = useAiStore(state => state.cancelResponse);

    // -----------------------------------------------
    // Helpers: leer y limpiar el textarea
    // -----------------------------------------------
    const getText = () => editableRef.current?.value?.trim() ?? '';

    const clearText = () => {
        if (editableRef.current) {
            editableRef.current.value = '';
            setIsEmpty(true);
        }
    };

    // -----------------------------------------------
    // Handlers
    // -----------------------------------------------
    const handleInput = useCallback(() => {
        const text = editableRef.current?.value?.trim() ?? '';
        setIsEmpty(text.length === 0);
    }, []);

    // Textarea maneja paste nativamente como texto plano

    const handleScrollLeft = (e) => {
        e.preventDefault();
        const content = scrollContainerRef.current;
        if (content) {
            content.style.scrollBehavior = 'smooth';
            content.scrollLeft -= 300;
        }
    };

    const handleScrollRight = (e) => {
        e.preventDefault();
        const content = scrollContainerRef.current;
        if (content) {
            content.style.scrollBehavior = 'smooth';
            content.scrollLeft += 300;
        }
    };

    const handleSubmit = async () => {
        const question = getText();
        if (!question || loading) return;

        // Demo mode: skip credit check (backend handles it)
        if (!isDemoMode && credits < 1) {
            useAiStore.setState({ 
                error: 'insufficient_credits', 
                creditErrorData: { 
                    current_credits: credits, 
                    required: 1 
                } 
            });
            return;
        }

        setShouldAutoScroll(true);
        clearText();
        setShowQuickActions(false);

        await askQuestion(question, verseToExplain?.length > 0 ? verseToExplain : null, modeId, doctrineId, language);
        
        fetchCredits();

        if (messages.length === 0) {
            sessionStorage.removeItem('pendingVerses');
        }
    };

    // Enter envía, Shift+Enter hace salto de línea
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleExplanationClick = async (type) => {
        if (isDemoMode) {
            onDemoLock?.();
            return;
        }

        const costKey = type.charAt(0).toUpperCase() + type.slice(1);
        const requiredCost = aiCosts[costKey] || 1;
        
        if (credits < requiredCost) {
            useAiStore.setState({ 
                error: 'insufficient_credits', 
                creditErrorData: {
                    current_credits: credits, 
                    required: requiredCost 
                } 
            });
            return;
        }
        
        setShowQuickActions(false);
        setShouldAutoScroll(true);
        
        await explainVerse(verseToExplain, type, modeId, doctrineId, language);
        fetchCredits();
    };

    return (
        <div className={`${styles.inputArea} ${hasConversation && `ActiveCoversation`} fadeIn`}>
            <div className={styles.inputForm}>
                <textarea
                    ref={editableRef}
                    className={styles.textarea}
                    disabled={loading}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={t('ai_question_placeholder')}
                    aria-label={t('ai_question_placeholder')}
                    rows={2}
                />

                <div className={styles.ctnInputButtons}>
                    {/* Mobile Quick Actions - hidden for demo */}
                    <div className={styles.mobileQuickActionsWrapper}>
                        <button 
                            type="button"
                            className={`${styles.toggleQuickActions} ${showQuickActions ? styles.active : ''}`}
                            onClick={() => setShowQuickActions(!showQuickActions)}
                            disabled={!isDemoMode && !verseToExplain?.length}
                        >
                            <Icon icon={<Sparkles />} size="tiny" />
                            <span>{t('ai_quick_actions')}</span>
                            {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                        </button>
                        
                        {showQuickActions && (
                            <div className={styles.mobileQuickActions}>
                                <button 
                                    type="button"
                                    className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                    onClick={() => handleExplanationClick('simpleExplanation')}
                                    disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                                >
                                    <Icon icon={<Sparkles />} size="tiny" />
                                    <span>{t('ai_simple_explanation')}</span>
                                    {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                    {aiCosts.SimpleExplanation && <span className={styles.costBadge}>{aiCosts.SimpleExplanation}x</span>}
                                </button>
                                <button 
                                    type="button"
                                    className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                    onClick={() => handleExplanationClick('dailyApplication')}
                                    disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                                >
                                    <Icon icon={<Lightbulb />} size="tiny" />
                                    <span>{t('ai_daily_application')}</span>
                                    {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                    {aiCosts.DailyApplication && <span className={styles.costBadge}>{aiCosts.DailyApplication}x</span>}
                                </button>
                                <button 
                                    type="button"
                                    className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                    onClick={() => handleExplanationClick('historicalContext')}
                                    disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                                >
                                    <Icon icon={<Scroll />} size="tiny" />
                                    <span>{t('ai_historical_context')}</span>
                                    {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                    {aiCosts.HistoricalContext && <span className={styles.costBadge}>{aiCosts.HistoricalContext}x</span>}
                                </button>
                                <button 
                                    type="button"
                                    className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                    onClick={() => handleExplanationClick('relatedVerses')}
                                    disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                                >
                                    <Icon icon={<Link2 />} size="tiny" />
                                    <span>{t('ai_related_verses')}</span>
                                    {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                    {aiCosts.RelatedVerses && <span className={styles.costBadge}>{aiCosts.RelatedVerses}x</span>}
                                </button>
                                <button 
                                    type="button"
                                    className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                    onClick={() => handleExplanationClick('originalLanguage')}
                                    disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                                >
                                    <Icon icon={<Globe />} size="tiny" />
                                    <span>{t('ai_original_language')}</span>
                                    {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                    {aiCosts.OriginalLanguage && <span className={styles.costBadge}>{aiCosts.OriginalLanguage}x</span>}
                                </button>
                                <button 
                                    type="button"
                                    className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                    onClick={() => handleExplanationClick('studyPlan')}
                                    disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                                >
                                    <Icon icon={<BookOpen />} size="tiny" />
                                    <span>{t('ai_study_guide')}</span>
                                    {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                    {aiCosts.StudyPlan && <span className={styles.costBadge}>{aiCosts.StudyPlan}x</span>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.desktopQuickActions}>
                        <div className={styles.quickActionsContainer}>
                            <button 
                                type="button"
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
                                type="button"
                                className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                onClick={() => handleExplanationClick('simpleExplanation')}
                                disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                            >
                                <Icon icon={<Sparkles />} size="tiny" />
                                {t('ai_simple_explanation')}
                                {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                {aiCosts.SimpleExplanation && <span className={styles.costBadge}>{aiCosts.SimpleExplanation}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                onClick={() => handleExplanationClick('dailyApplication')}
                                disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                            >
                                <Icon icon={<Lightbulb />} size="tiny" />
                                {t('ai_daily_application')}
                                {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                {aiCosts.DailyApplication && <span className={styles.costBadge}>{aiCosts.DailyApplication}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                onClick={() => handleExplanationClick('historicalContext')}
                                disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                            >
                                <Icon icon={<Scroll />} size="tiny" />
                                {t('ai_historical_context')}
                                {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                {aiCosts.HistoricalContext && <span className={styles.costBadge}>{aiCosts.HistoricalContext}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                onClick={() => handleExplanationClick('relatedVerses')}
                                disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                            >
                                <Icon icon={<Link2 />} size="tiny" />
                                {t('ai_related_verses')}
                                {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                {aiCosts.RelatedVerses && <span className={styles.costBadge}>{aiCosts.RelatedVerses}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                onClick={() => handleExplanationClick('originalLanguage')}
                                disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                            >
                                <Icon icon={<Globe />} size="tiny" />
                                {t('ai_original_language')}
                                {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                {aiCosts.OriginalLanguage && <span className={styles.costBadge}>{aiCosts.OriginalLanguage}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={`${styles.quickButton} ${isDemoMode ? styles.demoLockedQuickButton : ''}`} 
                                onClick={() => handleExplanationClick('studyPlan')}
                                disabled={loading || (!isDemoMode && !verseToExplain?.length)}
                            >
                                <Icon icon={<BookOpen />} size="tiny" />
                                {t('ai_study_guide')}
                                {isDemoMode && <Lock size={12} className={styles.demoInlineLock} />}
                                {aiCosts.StudyPlan && <span className={styles.costBadge}>{aiCosts.StudyPlan}x</span>}
                            </button>
                        </div>
                        
                            <button 
                                type="button"
                                className={styles.scrollButton}
                                onClick={handleScrollRight}
                            >
                                <Icon icon={<ChevronRight />} size="tiny" />
                            </button>
                        </div>
                    </div>
                    <div className={styles.inputButtons}>
                        {loading ? (
                            <button 
                                type="button" 
                                className={styles.cancelButton}
                                onClick={cancelResponse}
                            >
                                <Icon icon={<CircleStop />} size="small" />
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                className={styles.sendButton}
                                onClick={handleSubmit}
                                disabled={loading || isEmpty}
                            >
                                <Icon icon={<ArrowUp />} size="tiny" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.inputFormFooter}>
                <p>
                    {t('ai_footer_text')}
                </p>
            </div>
        </div>
    );
}

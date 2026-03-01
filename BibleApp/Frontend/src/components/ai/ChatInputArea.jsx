import { useState, useRef, useEffect } from 'react';
import { 
    ChevronLeft, ChevronRight, Scroll, Lightbulb, Link2, 
    Sparkles, Globe, BookOpen, Trash2, CircleStop, ArrowUp 
} from "lucide-react";
import Icon from "../ui/Icon";
import { useTranslation } from "../../hooks/useTranslation";
import { useAiStore } from "../../store/AiStore";
import { useCredits } from "../../store/useCredits";
import styles from '../../pages/AI.module.css';

export default function ChatInputArea({ setShouldAutoScroll, hasConversation }) {
    const { t, language } = useTranslation();
    const [question, setQuestion] = useState('');
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
    
    // Actions from aiStore
    const askQuestion = useAiStore(state => state.askQuestion);
    const explainVerse = useAiStore(state => state.explainVerse);
    const clearMessages = useAiStore(state => state.clearMessages);
    const cancelResponse = useAiStore(state => state.cancelResponse);

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

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        
        if (credits <= 0) {
            setError('insufficient_credits');
            return;
        }

        // Activar auto-scroll ANTES de enviar la pregunta
        setShouldAutoScroll(true);

        // Ejecutar pregunta
        await askQuestion(question, verseToExplain?.length > 0 ? verseToExplain : null, modeId, doctrineId, language);
        
        // Actualizar créditos después de la respuesta
        fetchCredits();
        
        setQuestion('');
        if (messages.length === 0) {
            sessionStorage.removeItem('pendingVerses');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitQuestion(e);
        }
    };

    const handleExplanationClick = async (type) => {
        if (credits <= 0) {
            setError('insufficient_credits');
            return;
        }
        
        // Activar auto-scroll ANTES de enviar la explicación
        setShouldAutoScroll(true);
        
        await explainVerse(verseToExplain, type, modeId, doctrineId, language);
        fetchCredits();
    };

    return (
        <div className={`${styles.inputArea} ${hasConversation && `ActiveCoversation`}`}>
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
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('historicalContext')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Scroll />} size="tiny" />
                                {t('ai_historical_context')}
                                {aiCosts.HistoricalContext && <span className={styles.costBadge}>{aiCosts.HistoricalContext}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('dailyApplication')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Lightbulb />} size="tiny" />
                                {t('ai_daily_application')}
                                {aiCosts.DailyApplication && <span className={styles.costBadge}>{aiCosts.DailyApplication}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('relatedVerses')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Link2 />} size="tiny" />
                                {t('ai_related_verses')}
                                {aiCosts.RelatedVerses && <span className={styles.costBadge}>{aiCosts.RelatedVerses}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('simpleExplanation')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Sparkles />} size="tiny" />
                                {t('ai_simple_explanation')}
                                {aiCosts.SimpleExplanation && <span className={styles.costBadge}>{aiCosts.SimpleExplanation}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('originalLanguage')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<Globe />} size="tiny" />
                                {t('ai_original_language')}
                                {aiCosts.OriginalLanguage && <span className={styles.costBadge}>{aiCosts.OriginalLanguage}x</span>}
                            </button>
                            <button 
                                type="button"
                                className={styles.quickButton} 
                                onClick={() => handleExplanationClick('studyPlan')}
                                disabled={loading || !verseToExplain?.length}
                            >
                                <Icon icon={<BookOpen />} size="tiny" />
                                {t('ai_study_guide')}
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
                    <div className={styles.inputButtons}>
                        {messages.length > 0 && (
                            <button 
                                type="button" 
                                className={styles.clearButton}
                                onClick={clearMessages}
                                disabled={loading}
                            >
                                <Icon icon={<Trash2 />} size="tiny" />
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
    );
}

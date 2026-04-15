import { Link } from "react-router-dom";
import { BookMarked, Brain, Settings2, HelpCircle, Sparkles, Lock } from "lucide-react";
import styles from "./AIEmptyState.module.css";

const TIPS = (isEs, onHelpClick) => [
    {
        icon: <BookMarked size={24} />,
        title: isEs ? "Selecciona versículos" : "Select verses",
        description: isEs
            ? "Ve a la Biblia, elige los versículos que te interesen y envíalos como contexto al chat."
            : "Go to the Bible, choose the verses you're interested in, and send them as context to the chat.",
        action: (
            <Link to="/books" className={styles.tipLink}>
                {isEs ? "Abrir Biblia →" : "Open Bible →"}
            </Link>
        ),
    },
    {
        icon: <Brain size={24} />,
        title: isEs ? "Haz una pregunta" : "Ask a question",
        description: isEs
            ? "Escribe libremente cualquier duda sobre un pasaje, un personaje bíblico, o un concepto teológico."
            : "Freely type any question about a passage, a biblical figure, or a theological concept.",
        action: null,
    },
    {
        icon: <Settings2 size={24} />,
        title: isEs ? "Personaliza el modo" : "Customize the mode",
        description: isEs
            ? "Ajusta cómo te responde la IA: guía personal, devocional, académico, y más."
            : "Adjust how the AI responds: personal guide, devotional, academic, and more.",
        action: null,
    },
];

const SUGGESTED_QUESTIONS = {
    es: [
        "¿Qué dice la Biblia sobre la ansiedad?",
        "¿Quién fue el apóstol Pablo?",
        "Explícame el Salmo 23",
    ],
    en: [
        "What does the Bible say about anxiety?",
        "Who was the apostle Paul?",
        "Explain Psalm 23 to me",
    ]
};

function AIEmptyState({ language = "es", onHelpClick, onSuggestedClick, verseCount = 0, isDemo = false, onDemoLock }) {
    const isEs = language === "es";
    const questions = SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.es;

    return (
        <div className={`${styles.container} fadeIn`}>
            <div className={styles.hero}>
                <div className={styles.heroIcon}>
                    <Brain size={40} />
                </div>
                <h2>{isEs ? "¿En qué puedo ayudarte hoy?" : "How can I help you today?"}</h2>
                <p className={styles.heroSub}>
                    {isDemo ? (
                        isEs
                            ? "Prueba la IA bíblica — haz una pregunta o selecciona un ejemplo."
                            : "Try the Bible AI — ask a question or pick an example."
                    ) : verseCount > 0 ? (
                        isEs ? (
                            <>Tienes <span className={styles.verseCount}>{verseCount}</span> versículo{verseCount > 1 ? "s" : ""} en contexto. Pregunta lo que quieras.</>
                        ) : (
                            <>You have <span className={styles.verseCount}>{verseCount}</span> verse{verseCount > 1 ? "s" : ""} in context. Ask anything.</>
                        )
                    ) : (
                        isEs ? (
                            "Puedes empezar con una pregunta directa o añadir versículos como contexto."
                        ) : (
                            "You can start with a direct question or add verses as context."
                        )
                    )}
                </p>
            </div>

            {/* Suggested questions — only for demo users */}
            {isDemo && onSuggestedClick && (
                <div className={styles.suggestedQuestions}>
                    <p className={styles.suggestedLabel}>
                        {isEs ? "Prueba con una de estas:" : "Try one of these:"}
                    </p>
                    <div className={styles.suggestedButtons}>
                        {questions.map((q, i) => (
                            <button
                                key={i}
                                className={styles.suggestedButton}
                                onClick={() => onSuggestedClick(q)}
                            >
                                <Sparkles size={14} />
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips — only for logged-in users */}
            {!isDemo && (
                <div className={styles.tips}>
                    {TIPS(isEs, onHelpClick).map((tip, i) => (
                        <div key={i} className={styles.tipCard}>
                            <div className={styles.tipIcon}>{tip.icon}</div>
                            <div className={styles.tipContent}>
                                <h3>{tip.title}</h3>
                                <p>{tip.description}</p>
                                {tip.action}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isDemo && (
                <button
                    type="button"
                    className={styles.demoCallout}
                    onClick={onDemoLock}
                >
                    <div className={styles.demoCalloutIcon}>
                        <Settings2 size={18} />
                        <Lock size={10} className={styles.tipLockIcon} />
                    </div>
                    <div className={styles.demoCalloutContent}>
                        <strong>
                            {isEs ? 'Desbloquea doctrina, contexto y herramientas de estudio' : 'Unlock doctrine, context, and study tools'}
                        </strong>
                        <p>
                            {isEs
                                ? 'Crea tu cuenta para personalizar respuestas, añadir versículos y usar herramientas avanzadas.'
                                : 'Create your account to personalize responses, add verses, and use advanced tools.'}
                        </p>
                    </div>
                    <span className={styles.demoCalloutLink}>
                        {isEs ? 'Crear cuenta gratis →' : 'Create free account →'}
                    </span>
                </button>
            )}

            {/* Help Button - locked for demo users */}
            <button 
                className={`${styles.helpButton} ${isDemo ? styles.lockedHelpButton : ''}`} 
                onClick={isDemo ? onDemoLock : onHelpClick}
            >
                <HelpCircle size={16} />
                {isEs ? "Ver cómo funciona la IA" : "Learn how the AI works"}
                {isDemo && <Lock size={12} className={styles.helpLockIcon} />}
            </button>
        </div>
    );
}

export default AIEmptyState;

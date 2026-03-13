import { Link } from "react-router-dom";
import { BookMarked, Brain, Settings2, HelpCircle } from "lucide-react";
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

function AIEmptyState({ language = "es", onHelpClick, verseCount = 0 }) {
    const isEs = language === "es";

    return (
        <div className={`${styles.container} fadeIn`}>
            <div className={styles.hero}>
                <div className={styles.heroIcon}>
                    <Brain size={40} />
                </div>
                <h2>{isEs ? "¿En qué puedo ayudarte hoy?" : "How can I help you today?"}</h2>
                <p className={styles.heroSub}>
                    {verseCount > 0
                        ? isEs
                            ? `Tienes ${verseCount} versículo${verseCount > 1 ? "s" : ""} en contexto. Pregunta lo que quieras.`
                            : `You have ${verseCount} verse${verseCount > 1 ? "s" : ""} in context. Ask anything.`
                        : isEs
                        ? "Puedes empezar con una pregunta directa o añadir versículos como contexto."
                        : "You can start with a direct question or add verses as context."}
                </p>
            </div>

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

            <button className={styles.helpButton} onClick={onHelpClick}>
                <HelpCircle size={16} />
                {isEs ? "Ver cómo funciona la IA" : "Learn how the AI works"}
            </button>
        </div>
    );
}

export default AIEmptyState;

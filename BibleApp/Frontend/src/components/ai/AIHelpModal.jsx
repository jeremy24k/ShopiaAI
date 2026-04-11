import { X, BookMarked, MessageSquare, Settings2, Layers } from "lucide-react";
import IconButton from "../ui/IconButton";
import MobileSheet from "../ui/MobileSheet";
import styles from "./AIHelpModal.module.css";

const SECTIONS = (t, isEs) => [
    {
        icon: <BookMarked size={22} />,
        title: isEs ? "Selecciona versículos como contexto" : "Select verses as context",
        description: isEs
            ? "Lee la Biblia, selecciona los versículos que quieras y envíalos al chat. La IA los usará para darte respuestas más precisas y profundas."
            : "Read the Bible, select the verses you want, and send them to the chat. The AI will use them to give you more precise, insightful answers.",
    },
    {
        icon: <MessageSquare size={22} />,
        title: isEs ? "Haz preguntas libremente" : "Ask questions freely",
        description: isEs
            ? "Puedes preguntar sobre el significado de un pasaje, el contexto histórico, aplicaciones para el día a día, o cualquier tema bíblico."
            : "Ask about the meaning of a passage, historical context, daily applications, or any biblical topic you have in mind.",
    },
    {
        icon: <Settings2 size={22} />,
        title: isEs ? "Elige tu modo de estudio" : "Choose your study mode",
        description: isEs
            ? "La IA puede responder como guía personal, en modo devocional, académico u otros. Ajusta el modo desde el botón de configuración en el header."
            : "The AI can respond as a personal guide, in devotional mode, academic mode, and more. Adjust the mode from the settings button in the header.",
    },
    {
        icon: <Layers size={22} />,
        title: isEs ? "Perspectiva teológica" : "Theological perspective",
        description: isEs
            ? "También puedes elegir la perspectiva teológica (evangélica, católica, reformada...) para adaptar las respuestas a tu tradición de fe."
            : "You can also choose the theological perspective (evangelical, Catholic, Reformed...) to tailor the responses to your faith tradition.",
    },
];

function AIHelpModal({ isOpen, onClose, language = "es" }) {
    if (!isOpen) return null;
    const isEs = language === "es";
    const title = isEs ? "¿Cómo funciona el Asistente de IA?" : "How does the AI Assistant work?";

    const bodyContent = (
        <>
            <div className={styles.sections}>
                {SECTIONS(null, isEs).map((section, i) => (
                    <div key={i} className={styles.section}>
                        <div className={styles.sectionIcon}>{section.icon}</div>
                        <div className={styles.sectionText}>
                            <h3>{section.title}</h3>
                            <p>{section.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p className={styles.footer}>
                {isEs
                    ? "Cada respuesta consume créditos. Los créditos se recargan diariamente."
                    : "Each response consumes credits. Credits are recharged daily."}
            </p>
        </>
    );

    return (
        <>
            {/* Desktop: Modal tradicional */}
            <div className={styles.desktopOnly}>
                <div className={styles.overlay} onClick={onClose}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <h2>{title}</h2>
                            <IconButton onClick={onClose} icon={X} variant="ghost" size="small" iconSize="medium" circle />
                        </div>
                        {bodyContent}
                    </div>
                </div>
            </div>

            {/* Mobile: Sheet desde abajo */}
            <MobileSheet isOpen={isOpen} onClose={onClose} title={title}>
                {bodyContent}
            </MobileSheet>
        </>
    );
}

export default AIHelpModal;

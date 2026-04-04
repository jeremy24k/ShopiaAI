import { Link } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../styles/DemoLimitModal.module.css';

export default function DemoLimitModal({ onClose, title, description, customIcon }) {
    const { t, language } = useTranslation();
    const isEs = language === 'es';

    const defaultTitle = isEs ? '¡Te gustó la experiencia?' : 'Did you enjoy the experience?';
    const defaultDescription = isEs 
        ? 'Has usado tus 3 preguntas de prueba. Crea tu cuenta gratis para seguir explorando la Biblia con IA — incluye créditos de bienvenida.'
        : "You've used your 3 trial questions. Create a free account to keep exploring the Bible with AI — includes welcome credits.";

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>
                <div className={styles.iconWrapper}>
                    {customIcon || <Sparkles size={32} />}
                </div>

                <h2>{title || defaultTitle}</h2>
                
                <p className={styles.description}>
                    {description || defaultDescription}
                </p>

                <div className={styles.actions}>
                    <Link to="/login" className={styles.primaryButton} onClick={onClose}>
                        <UserPlus size={18} />
                        {isEs ? 'Crear cuenta gratis' : 'Create free account'}
                    </Link>
                    <Link to="/login" className={styles.secondaryButton} onClick={onClose}>
                        <LogIn size={18} />
                        {isEs ? 'Ya tengo cuenta' : 'I have an account'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

import { Link } from 'react-router-dom';
import { Sparkles, User, BookOpen, Lock } from 'lucide-react';
import styles from '../../styles/AI.module.css';

export default function ValueLockCard({ language }) {
    return (
        <div className={styles.valueLockCard}>
            <div className={styles.valueLockHeader}>
                <Sparkles size={18} className={styles.valueLockIcon} />
                <h4 className={styles.valueLockTitle}>
                    {language === 'es' 
                        ? 'Este análisis fue genérico' 
                        : 'This analysis was generic'}
                </h4>
            </div>
            <p className={styles.valueLockDescription}>
                {language === 'es'
                    ? 'Crea tu cuenta gratis para ver cómo cambia esta respuesta según tu tradición (Evangélica, Católica, etc.) y profundidad de estudio.'
                    : 'Create your free account to see how this response changes based on your tradition (Evangelical, Catholic, etc.) and study depth.'}
            </p>
            <div className={styles.valueLockFeatures}>
                <div className={styles.valueLockFeature}>
                    <User size={14} />
                    <span>{language === 'es' ? 'Personaliza el modo de respuesta' : 'Customize response mode'}</span>
                </div>
                <div className={styles.valueLockFeature}>
                    <BookOpen size={14} />
                    <span>{language === 'es' ? 'Ajusta la tradición doctrinal' : 'Adjust doctrinal tradition'}</span>
                </div>
                <div className={styles.valueLockFeature}>
                    <Lock size={14} />
                    <span>{language === 'es' ? 'Añade contexto bíblico' : 'Add biblical context'}</span>
                </div>
            </div>
            <Link to="/login" className={styles.valueLockButton}>
                <Sparkles size={16} />
                {language === 'es' ? 'Crear cuenta gratis' : 'Create free account'}
            </Link>
        </div>
    );
}

import { Link } from 'react-router-dom';
import { Sparkles, User, BookOpen, Lock } from 'lucide-react';
import styles from '../../styles/AI.module.css';

export default function ValueLockCard({ language, className = '' }) {
    const registerHref = '/login?mode=register&next=/ai&context=demo';

    return (
        <div className={`${styles.valueLockCard} ${className}`.trim()}>
            <div className={styles.valueLockHeader}>
                <Sparkles size={18} className={styles.valueLockIcon} />
                <h4 className={styles.valueLockTitle}>
                    {language === 'es' 
                        ? '¿Quieres ver el análisis completo y guardar tus 10 créditos diarios?' 
                        : 'Want to see the full analysis and keep your 10 daily credits?'}
                </h4>
            </div>
            <p className={styles.valueLockDescription}>
                {language === 'es'
                    ? 'Ya probaste que Sophia funciona. Regístrate gratis en segundos para desbloquear la respuesta completa, guardar tus próximos estudios y seguir profundizando según tu doctrina.'
                    : 'You already proved Sophia works. Create your free account in seconds to unlock the full answer, save your future studies, and keep going deeper according to your doctrine.'}
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
            <Link to={registerHref} className={styles.valueLockButton}>
                <Sparkles size={16} />
                {language === 'es' ? 'Crear cuenta gratis' : 'Create free account'}
            </Link>
        </div>
    );
}

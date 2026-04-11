import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguageStore } from '../store/LanguageStore';
import { Trash2, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';
import styles from '../styles/Account.module.css';

function Account() {
    const navigate = useNavigate();
    const { user, deleteAccount } = useAuthStore();
    const { t } = useTranslation();
    const { language } = useLanguageStore();

    // Detectar si el usuario se autenticó con Google u otro OAuth
    const isOAuthUser = user?.app_metadata?.provider !== 'email';

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [confirmText, setConfirmText] = useState('');

    const handleDeleteAccount = async () => {
        // Para usuarios email, la contraseña es obligatoria
        if (!isOAuthUser && !password) {
            setError(t('password_required'));
            return;
        }

        // Validar texto de confirmación según el idioma
        const expectedText = language === 'es' ? 'eliminar' : 'delete';
        if (confirmText.toLowerCase() !== expectedText) {
            setError(t('delete_confirmation_text_error'));
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            const { data, error: deleteError } = await deleteAccount(password);

            if (deleteError) {
                if (deleteError.message.includes('Invalid password')) {
                    setError(t('invalid_password'));
                } else {
                    setError(deleteError.message || t('delete_account_error'));
                }
                setIsDeleting(false);
                return;
            }

            // Redirigir al login después de eliminar la cuenta
            navigate('/login', { 
                state: { 
                    message: t('account_deleted_success') 
                } 
            });
        } catch (err) {
            setError(t('delete_account_error'));
            setIsDeleting(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>{t('account_settings')}</h1>
                
                <div className={styles.section}>
                    <h2>{t('account_information')}</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>{t('email_label')}:</span>
                            <span className={styles.value}>{user.email}</span>
                        </div>
                        {user.user_metadata?.name && (
                            <div className={styles.infoItem}>
                                <span className={styles.label}>{t('name_label')}:</span>
                                <span className={styles.value}>{user.user_metadata.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${styles.section} ${styles.dangerZone}`}>
                    <h2>{t('danger_zone')}</h2>
                    <p className={styles.dangerDescription}>
                        {t('delete_account_warning')}
                    </p>
                    <button
                        className={styles.deleteButton}
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 size={18} />
                        {t('delete_account')}
                    </button>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showDeleteModal && (
                <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowDeleteModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <AlertTriangle size={48} className={styles.warningIcon} />
                            <h2>{t('delete_account_confirm_title')}</h2>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.warningBox}>
                                <p><strong>{t('delete_account_warning_title')}</strong></p>
                                <ul>
                                    <li>{t('delete_warning_conversations')}</li>
                                    <li>{t('delete_warning_notes')}</li>
                                    <li>{t('delete_warning_favorites')}</li>
                                    <li>{t('delete_warning_progress')}</li>
                                    <li>{t('delete_warning_credits')}</li>
                                </ul>
                                <p className={styles.permanentWarning}>
                                    {t('delete_warning_permanent')}
                                </p>
                            </div>

                            {error && (
                                <div className={styles.error}>
                                    <AlertTriangle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirm-text">
                                    {t('delete_confirm_instruction')}
                                </label>
                                <input
                                    id="confirm-text"
                                    type="text"
                                    placeholder={t('delete_confirm_placeholder')}
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    disabled={isDeleting}
                                    className={styles.input}
                                />
                            </div>

                            {/* Campo de contraseña solo para usuarios email/password */}
                            {!isOAuthUser ? (
                                <div className={styles.inputGroup}>
                                    <label htmlFor="password">
                                        <Lock size={14} />
                                        {t('password_label')}
                                    </label>
                                    <div className={styles.passwordWrapper}>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={t('enter_password_to_confirm')}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isDeleting}
                                            className={styles.input}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isDeleting}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.oauthNote}>
                                    <Lock size={14} /> {language === 'es'
                                        ? 'Tu cuenta está vinculada con Google. No se requiere contraseña.'
                                        : 'Your account is linked with Google. No password required.'}
                                </p>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setPassword('');
                                    setConfirmText('');
                                    setError('');
                                }}
                                disabled={isDeleting}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                className={styles.confirmDeleteButton}
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || (!isOAuthUser && !password) || confirmText.toLowerCase() !== (language === 'es' ? 'eliminar' : 'delete')}
                            >
                                {isDeleting ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        {t('deleting_account')}
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        {t('delete_account_permanently')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Account;

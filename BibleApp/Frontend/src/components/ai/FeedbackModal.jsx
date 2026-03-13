import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../store/AuthStore';
import styles from './FeedbackModal.module.css';
import Modal from '../ui/Modal';
import { Send, Bug, Lightbulb, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

function FeedbackModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    
    const [type, setType] = useState('suggestion');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return;

        setSending(true);
        setStatus('loading');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id,
                    email,
                    type,
                    message,
                    userAgent: navigator.userAgent
                }),
            });

            if (response.ok) {
                setStatus('success');
                setMessage('');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                }, 2500);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    const typeIcons = {
        bug: <Bug size={18} />,
        suggestion: <Lightbulb size={18} />,
        other: <MessageSquare size={18} />
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={t('feedback_title')}
        >
            <div className={styles.feedbackContainer}>
                {status === 'success' ? (
                    <div className={styles.successState}>
                        <CheckCircle size={48} className={styles.successIcon} />
                        <p>{t('feedback_success')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <p className={styles.subtitle}>{t('feedback_subtitle')}</p>

                        <div className={styles.typeSelector}>
                            <label className={styles.label}>{t('feedback_type')}</label>
                            <div className={styles.typeOptions}>
                                {['bug', 'suggestion', 'other'].map((tKey) => (
                                    <button
                                        key={tKey}
                                        type="button"
                                        className={`${styles.typeButton} ${type === tKey ? styles.activeType : ''}`}
                                        onClick={() => setType(tKey)}
                                    >
                                        {typeIcons[tKey]}
                                        {t(`feedback_type_${tKey}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>{t('feedback_message_placeholder')}</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('feedback_message_placeholder')}
                                required
                                className={styles.textarea}
                                rows={5}
                            />
                        </div>

                        {!user && (
                            <div className={styles.field}>
                                <label className={styles.label}>{t('feedback_email_optional')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className={styles.input}
                                />
                            </div>
                        )}

                        {status === 'error' && (
                            <div className={styles.errorState}>
                                <XCircle size={18} />
                                <p>{t('feedback_error')}</p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={sending || !message}
                        >
                            <Send size={18} />
                            {sending ? t('feedback_sending') : t('feedback_send')}
                        </button>
                    </form>
                )}
            </div>
        </Modal>
    );
}

export default FeedbackModal;

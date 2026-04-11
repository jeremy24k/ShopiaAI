import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAiStore } from '../../store/AiStore';
import { useTranslation } from '../../hooks/useTranslation';
import Icon from './Icon';
import {
    Sparkles, Church, Cross, Landmark, BookOpen, Handshake, Flame,
    BookMarked, Mic, HelpCircle, Heart,
    PartyPopper, Gift, Brain, Check
} from 'lucide-react';
import '../../styles/OnboardingModal.css';

const ONBOARDING_KEY = 'shopia_onboarding_done';
const FOCUS_KEY = 'sophia_user_focus';

const DOCTRINES = [
    { id: 'evangelical', icon: Church },
    { id: 'pentecostal', icon: Flame },
    { id: 'catholic', icon: Cross },
    { id: 'baptist', icon: Landmark },
    { id: 'adventist', icon: BookOpen },
    { id: 'ecumenical', icon: Handshake },
];

const FOCUSES = [
    { id: 'personal_study', icon: BookMarked },
    { id: 'sermons', icon: Mic },
    { id: 'hard_questions', icon: HelpCircle },
    { id: 'devotional', icon: Heart },
];

function OnboardingModal({ onComplete }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const setDoctrineId = useAiStore(state => state.setDoctrineId);

    const [step, setStep] = useState(0);
    const [selectedDoctrine, setSelectedDoctrine] = useState('evangelical');
    const [selectedFocus, setSelectedFocus] = useState('personal_study');

    const handleDoctrineSelect = (doctrineId) => {
        setSelectedDoctrine(doctrineId);
    };

    const handleFocusSelect = (focusId) => {
        setSelectedFocus(focusId);
    };

    const handleNext = () => {
        if (step === 0) {
            // Save doctrine
            setDoctrineId(selectedDoctrine);
        }
        if (step === 1) {
            // Save focus
            localStorage.setItem(FOCUS_KEY, selectedFocus);
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSkip = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setDoctrineId('evangelical');
        onComplete();
    };

    const handleFinish = (destination) => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        onComplete();
        navigate(destination);
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                {step === 0 && <StepDoctrine
                    t={t}
                    selected={selectedDoctrine}
                    onSelect={handleDoctrineSelect}
                />}
                {step === 1 && <StepFocus
                    t={t}
                    selected={selectedFocus}
                    onSelect={handleFocusSelect}
                />}
                {step === 2 && <StepReady
                    t={t}
                    doctrine={selectedDoctrine}
                    focus={selectedFocus}
                    onFinish={handleFinish}
                />}

                {step < 2 && (
                    <div className="onboarding-footer">
                        <div className="onboarding-dots">
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>
                        <div className="onboarding-nav">
                            {step === 0 && (
                                <button className="btn-skip" onClick={handleSkip}>
                                    {t('onboarding_skip') || 'Omitir'}
                                </button>
                            )}
                            {step > 0 && (
                                <button className="btn-back" onClick={handleBack}>
                                    {t('onboarding_back') || '← Atrás'}
                                </button>
                            )}
                            <button className="btn-next" onClick={handleNext}>
                                {t('onboarding_next') || 'Siguiente →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =====================
   STEP 1: Doctrine
   ===================== */
function StepDoctrine({ t, selected, onSelect }) {
    return (
        <div className="onboarding-step" key="step-doctrine">
            <div className="onboarding-header">
                <div className="onboarding-logo">
                    <Icon icon={<Sparkles />} size="large" color="primary" />
                </div>
                <h2 className="onboarding-title">
                    {t('onboarding_step1_title') || '¡Bienvenido a SophiaBible!'}
                </h2>
                <p className="onboarding-subtitle">
                    {t('onboarding_step1_subtitle') || 'Para personalizar mis respuestas, ¿cuál es tu tradición teológica?'}
                </p>
            </div>

            <div className="doctrine-grid">
                {DOCTRINES.map(d => {
                    const DoctrineIcon = d.icon;
                    return (
                        <button
                            key={d.id}
                            className={`doctrine-card ${selected === d.id ? 'selected' : ''}`}
                            onClick={() => onSelect(d.id)}
                        >
                            <span className="doctrine-icon">
                                <DoctrineIcon size={24} />
                            </span>
                            <span className="doctrine-name">
                                {t(`onboarding_doctrine_${d.id}`) || d.id}
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="doctrine-hint">
                {t('onboarding_doctrine_hint') || 'Puedes cambiarlo después en la configuración de la IA'}
            </p>
        </div>
    );
}

/* =====================
   STEP 2: Focus
   ===================== */
function StepFocus({ t, selected, onSelect }) {
    return (
        <div className="onboarding-step" key="step-focus">
            <div className="onboarding-header">
                <h2 className="onboarding-title">
                    {t('onboarding_step2_title') || '¿En qué te gustaría enfocarte?'}
                </h2>
                <p className="onboarding-subtitle">
                    {t('onboarding_step2_subtitle') || 'Esto me ayuda a sugerirte las mejores herramientas'}
                </p>
            </div>

            <div className="focus-list">
                {FOCUSES.map(f => {
                    const FocusIcon = f.icon;
                    return (
                        <button
                            key={f.id}
                            className={`focus-card ${selected === f.id ? 'selected' : ''}`}
                            onClick={() => onSelect(f.id)}
                        >
                            <span className="focus-icon">
                                <FocusIcon size={24} />
                            </span>
                            <div className="focus-text">
                                <p className="focus-name">
                                    {t(`onboarding_focus_${f.id}`) || f.id}
                                </p>
                                <p className="focus-desc">
                                    {t(`onboarding_focus_${f.id}_desc`) || ''}
                                </p>
                            </div>
                            <div className="focus-check">
                                <Check size={14} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* =====================
   STEP 3: Ready
   ===================== */
function StepReady({ t, doctrine, focus, onFinish }) {
    const getDoctrineName = () => t(`onboarding_doctrine_${doctrine}`) || doctrine;
    const getFocusName = () => t(`onboarding_focus_${focus}`) || focus;

    return (
        <div className="onboarding-step" key="step-ready">
            <div className="onboarding-header">
                <div className="ready-celebration">
                    <PartyPopper size={56} />
                </div>
                <h2 className="onboarding-title">
                    {t('onboarding_step3_title') || '¡Todo listo!'}
                </h2>
                <p className="onboarding-subtitle">
                    {t('onboarding_step3_subtitle') || 'Tienes créditos de regalo para empezar a estudiar'}
                </p>
            </div>

            <div className="ready-credits-badge">
                <Gift size={20} />
                {t('onboarding_credits_gift') || '10 créditos de regalo'}
            </div>

            <div className="ready-summary">
                <div className="ready-summary-item">
                    <span>{t('onboarding_your_tradition') || 'Tu tradición'}</span>
                    <span className="ready-summary-value">{getDoctrineName()}</span>
                </div>
                <div className="ready-summary-item">
                    <span>{t('onboarding_your_focus') || 'Tu enfoque'}</span>
                    <span className="ready-summary-value">{getFocusName()}</span>
                </div>
            </div>

            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: 0 }}>
                {t('onboarding_step3_question') || '¿Qué quieres hacer primero?'}
            </p>

            <div className="ready-cta-group">
                <button className="cta-primary" onClick={() => onFinish('/ai')}>
                    <Brain size={20} />
                    {t('onboarding_cta_ask') || 'Preguntarle a Sophia'}
                </button>
                <button className="cta-secondary" onClick={() => onFinish('/books')}>
                    <BookMarked size={20} />
                    {t('onboarding_cta_explore') || 'Explorar la Biblia'}
                </button>
            </div>
        </div>
    );
}

export default OnboardingModal;

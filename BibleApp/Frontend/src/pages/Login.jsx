import supabase from "../supabase/supabase";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useTranslation } from "../hooks/useTranslation";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft, Send, Sparkles, BookOpen, ScrollText } from "lucide-react";
import styles from "../styles/Login.module.css";
import HeroImage from "../assets/HeroImage.webp";

function normalizeNextPath(next) {
    if (!next || typeof next !== 'string') return '/home';
    return next.startsWith('/') ? next : '/home';
}

function getDemoBenefits(isEs) {
    return [
        {
            icon: <Sparkles size={16} />,
            title: isEs ? 'Guarda tus futuras conversaciones' : 'Save your future conversations',
            description: isEs ? 'Al crear tu cuenta, tus estudios nuevos quedaran guardados en Sophia.' : 'Once you create your account, your new studies will be saved in Sophia.'
        },
        {
            icon: <BookOpen size={16} />,
            title: isEs ? 'Desbloquea contexto bíblico' : 'Unlock Bible context',
            description: isEs ? 'Usa versículos, doctrina y profundidad personalizada.' : 'Use verses, doctrine, and personalized depth.'
        },
        {
            icon: <ScrollText size={16} />,
            title: isEs ? 'Obtén herramientas avanzadas' : 'Get advanced tools',
            description: isEs ? 'Contexto histórico, idioma original y más.' : 'Historical context, original language, and more.'
        }
    ];
}

function getAuthBenefits(isEs, isDemoIntent) {
    if (isDemoIntent) {
        return getDemoBenefits(isEs);
    }

    return [
        {
            icon: <Sparkles size={16} />,
            title: isEs ? 'Estudia segun tu tradicion' : 'Study from your tradition',
            description: isEs ? 'Personaliza la doctrina y el enfoque de cada respuesta.' : 'Personalize the doctrine and focus of each response.'
        },
        {
            icon: <BookOpen size={16} />,
            title: isEs ? 'Lee y pregunta en un solo lugar' : 'Read and ask in one place',
            description: isEs ? 'Combina lectura biblica, contexto y preguntas a Sophia.' : 'Combine Bible reading, context, and questions to Sophia.'
        },
        {
            icon: <ScrollText size={16} />,
            title: isEs ? 'Guarda tu progreso' : 'Save your progress',
            description: isEs ? 'Conserva conversaciones, notas y contexto para volver despues.' : 'Keep conversations, notes, and context to return later.'
        }
    ];
}

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, signUp, resetPassword, updatePassword, signInWithGoogle } = useAuthStore();
    const { t, language } = useTranslation();
    const nextPath = normalizeNextPath(searchParams.get('next'));
    const isDemoIntent = searchParams.get('context') === 'demo' || nextPath === '/ai';
    const isEs = language === 'es';
    const authBenefits = getAuthBenefits(isEs, isDemoIntent);
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [honeypot, setHoneypot] = useState(""); // Campo trampa para bots
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // 'login' | 'register' | 'forgotPassword' | 'updatePassword'
    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isLoginMode = mode === 'login';
    const isForgotMode = mode === 'forgotPassword';
    const isUpdatePasswordMode = mode === 'updatePassword';
    const isPrimaryAuthMode = !isForgotMode && !isUpdatePasswordMode;

    // Detectar si venimos del email de reset password
    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'update-password') {
            setMode('updatePassword');
        } else if (modeParam === 'register') {
            setMode('register');
        } else if (modeParam === 'forgotPassword') {
            setMode('forgotPassword');
        } else if (modeParam === 'login') {
            setMode('login');
        }
    }, [searchParams]);

    const contextualTitle = isUpdatePasswordMode
        ? t('update_password_title')
        : isForgotMode
            ? t('forgot_password_title')
            : isDemoIntent
                ? (isLoginMode
                    ? (isEs ? 'Sigue tu estudio con Sophia' : 'Continue your study with Sophia')
                    : (isEs ? 'Crea tu cuenta para seguir' : 'Create your account to continue'))
                : isLoginMode
                    ? t('welcome_back')
                    : t('create_account');

    const contextualSubtitle = isUpdatePasswordMode
        ? t('update_password_subtitle')
        : isForgotMode
            ? t('forgot_password_subtitle')
            : isDemoIntent
                ? (isLoginMode
                    ? (isEs ? 'Inicia sesión para volver a la IA, guardar tu conversación y seguir estudiando.' : 'Sign in to return to the AI, save your conversation, and keep studying.')
                    : (isEs ? 'Crea tu cuenta gratis para guardar tu conversación, desbloquear más herramientas y continuar en la IA.' : 'Create your free account to save your conversation, unlock more tools, and continue in the AI.'))
                : isLoginMode
                    ? t('login_subtitle')
                    : t('register_subtitle');

    const valuePanelTitle = isDemoIntent
        ? (isEs ? 'Lo que desbloqueas al crear tu cuenta' : 'What you unlock when you create your account')
        : (isEs ? 'Por qué usar SophiaBible' : 'Why use SophiaBible');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const resetMessages = () => {
        setError("");
        setSuccess("");
    };

    const HandleEmailChange = (email) => {
        setEmail(email);
        resetMessages();
    }

    const HandlePasswordChange = (password) => {
        setPassword(password);
        resetMessages();
    }

    const HandleNameChange = (name) => {
        setName(name);
        resetMessages();
    }

    const validateForm = () => {
        if (!email || !password) {
            setError(t('complete_all_fields'));
            return false;
        }
        
        if (!isLoginMode && !name) {
            setError(t('enter_name'));
            return false;
        }
        
        if (!email.includes("@")) {
            setError(t('valid_email'));
            return false;
        }
        
        if (password.length < 6) {
            setError(t('password_min_length'));
            return false;
        }
        
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Verificar honeypot - si está lleno, es un bot
        if (honeypot) {
            console.warn('🤖 Bot detectado en login');
            return; // Silenciosamente rechazar sin mostrar error
        }
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        resetMessages();
        
        try {
            const { data, error } = await login(email, password);
            
            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    setError(t('invalid_credentials'));
                } else if (error.message.includes("Email not confirmed")) {
                    setError(t('email_not_confirmed'));
                } else {
                    setError(error.message);
                }
            } else {
                setSuccess(t('login_success'));
                setTimeout(() => {
                    navigate(nextPath);
                }, 1500);
            }
        } catch (err) {
            setError(t('connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        // Verificar honeypot - si está lleno, es un bot
        if (honeypot) {
            console.warn('🤖 Bot detectado en registro');
            return; // Silenciosamente rechazar sin mostrar error
        }
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        resetMessages();
        
        try {
            const { data, error } = await signUp(email, password, name, nextPath);

            if (error) {
                if (error.message.includes("User already registered")) {
                    setError(t('user_already_registered'));
                } else if (error.message.includes("Password should be")) {
                    setError(t('password_min_length'));
                } else {
                    setError(error.message);
                }
            } else {
                if (data?.session) {
                    setSuccess(t('login_success'));
                    setTimeout(() => {
                        navigate(nextPath);
                    }, 1500);
                } else {
                    setSuccess(
                        isDemoIntent
                            ? (isEs
                                ? 'Revisa tu email para confirmar tu cuenta. Cuando vuelvas, seguiremos en Sophia.'
                                : 'Check your email to confirm your account. When you come back, we will continue in Sophia.')
                            : t('register_success')
                    );
                    setTimeout(() => {
                        setMode('login');
                        setName("");
                    }, 3000);
                }
            }
        } catch (err) {
            setError(t('connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError(t('enter_email_reset'));
            return;
        }
        if (!email.includes("@")) {
            setError(t('valid_email'));
            return;
        }

        setIsLoading(true);
        resetMessages();

        try {
            const { error } = await resetPassword(email);
            if (error) {
                setError(error.message);
            } else {
                setSuccess(t('reset_email_sent'));
            }
        } catch (err) {
            setError(t('connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
            setError(t('complete_all_fields'));
            return;
        }

        if (newPassword.length < 6) {
            setError(t('password_min_length'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('passwords_dont_match'));
            return;
        }

        setIsLoading(true);
        resetMessages();

        try {
            const { error } = await updatePassword(newPassword);
            if (error) {
                setError(error.message);
            } else {
                setSuccess(t('password_updated_success'));
                setTimeout(() => {
                    navigate('/home');
                }, 2000);
            }
        } catch (err) {
            setError(t('connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        resetMessages();
        try {
            const { error } = await signInWithGoogle(nextPath);
            if (error) setError(error.message);
            // Si tiene éxito, Supabase redirige automáticamente — no hace falta navegar
        } catch (err) {
            setError(t('connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(isLoginMode ? 'register' : 'login');
        resetMessages();
        setName("");
    };

    const primaryEmailCta = isDemoIntent
        ? (isLoginMode
            ? (isEs ? 'Entrar y volver a Sophia' : 'Sign in and return to Sophia')
            : (isEs ? 'Crear cuenta y seguir con Sophia' : 'Create account and continue with Sophia'))
        : (isLoginMode ? t('login_button') : t('register_button'));
    
    return (
        <div className={styles.container}>
            {/* Background Image */}
            <div className={styles.login_bg}>
                <img 
                    src={HeroImage} 
                    alt="Bible AI Login" 
                    className={styles.login_bg_img} 
                    fetchPriority="high"
                    decoding="async" 
                />
                <div className={styles.login_bg_overlay}></div>
            </div>

            <div className={`${styles.card} ${isPrimaryAuthMode ? styles.cardWide : ''}`} style={{ position: 'relative', zIndex: 1 }}>
                <div className={`${styles.cardBody} ${isPrimaryAuthMode ? styles.demoLayout : ''}`}>
                    <div className={styles.mainColumn}>
                        <div className={styles.header}>
                            <h2>
                                {contextualTitle}
                            </h2>
                            <p>
                                {contextualSubtitle}
                            </p>
                        </div>

                        {/* Mensajes de error y éxito */}
                        {error && (
                            <div className={`${styles.message} ${styles.messageError}`}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                        
                        {success && (
                            <div className={`${styles.message} ${styles.messageSuccess}`}>
                                <CheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        {isUpdatePasswordMode ? (
                    /* Update Password Form */
                    <form className={styles.form} onSubmit={handleUpdatePassword}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword">
                                <Lock size={14} />
                                {t('new_password_label')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <input 
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder={t('new_password_placeholder')}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                    className={`${styles.input} ${error && !newPassword ? styles.inputError : ""}`}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    disabled={isLoading}
                                    aria-label={showNewPassword ? t('hide_password') : t('show_password')}
                                >
                                    {showNewPassword 
                                        ? <EyeOff size={16} aria-hidden="true" /> 
                                        : <Eye size={16} aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">
                                <Lock size={14} />
                                {t('confirm_password_label')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <input 
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t('confirm_password_placeholder')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    className={`${styles.input} ${error && !confirmPassword ? styles.inputError : ""}`}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
                                    aria-label={showConfirmPassword ? t('hide_password') : t('show_password')}
                                >
                                    {showConfirmPassword 
                                        ? <EyeOff size={16} aria-hidden="true" /> 
                                        : <Eye size={16} aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    {t('updating_password')}
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    {t('update_password_button')}
                                </>
                            )}
                        </button>
                    </form>
                ) : isForgotMode ? (
                    /* Forgot Password Form */
                    <form className={styles.form} onSubmit={handleForgotPassword}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">
                                <Mail size={14} />
                                {t('email_label')}
                            </label>
                            <input 
                                id="email"
                                type="email" 
                                placeholder={t('email_placeholder')}
                                value={email}
                                onChange={(e) => HandleEmailChange(e.target.value)}
                                disabled={isLoading}
                                className={`${styles.input} ${error && !email ? styles.inputError : ""}`}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    {t('sending_reset')}
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    {t('send_reset_link')}
                                </>
                            )}
                        </button>

                        <div className={styles.footer}>
                            <p>
                                <button 
                                    type="button" 
                                    className={styles.toggleButton}
                                    onClick={() => { setMode('login'); resetMessages(); }}
                                    disabled={isLoading}
                                >
                                    <ArrowLeft size={14} />
                                    {t('back_to_login')}
                                </button>
                            </p>
                        </div>
                    </form>
                ) : (
                    /* Login / Register Form */
                    <>
                        {/* Google Sign In - Primary CTA */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className={styles.googleButtonPrimary}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            {isDemoIntent
                                ? (isEs ? 'Continuar con Google y volver a Sophia' : 'Continue with Google and return to Sophia')
                                : (t('login_with_google') || 'Continuar con Google')}
                        </button>

                        {/* Divider */}
                        <div className={styles.divider}>
                            <span>{t('or') || 'o'}</span>
                        </div>

                        <form className={styles.form} onSubmit={isLoginMode ? handleLogin : handleSignUp}>
                            {!isLoginMode && (
                                <div className={styles.inputGroup}>
                                    <label htmlFor="name">
                                        <User size={14} />
                                        {t('name_label')}
                                    </label>
                                    <input 
                                        id="name"
                                        type="text"
                                        placeholder={t('name_placeholder')}
                                        value={name}
                                        onChange={(e) => HandleNameChange(e.target.value)}
                                        disabled={isLoading}
                                        className={`${styles.input} ${error && !name ? styles.inputError : ""}`}
                                        required
                                    />
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <label htmlFor="email">
                                    <Mail size={14} />
                                    {t('email_label')}
                                </label>
                                <input 
                                    id="email"
                                    type="email" 
                                    placeholder={t('email_placeholder')}
                                    value={email}
                                    onChange={(e) => HandleEmailChange(e.target.value)}
                                    disabled={isLoading}
                                    className={`${styles.input} ${error && !email ? styles.inputError : ""}`}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="password">
                                    <Lock size={14} />
                                    {t('password_label')}
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input 
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={t('password_placeholder')}
                                        value={password}
                                        onChange={(e) => HandlePasswordChange(e.target.value)}
                                        disabled={isLoading}
                                        className={`${styles.input} ${error && !password ? styles.inputError : ""}`}
                                        aria-invalid={error && !password ? "true" : "false"}
                                        aria-required="true"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={togglePasswordVisibility}
                                        disabled={isLoading}
                                        aria-label={showPassword ? t('hide_password') : t('show_password')}
                                    >
                                        {showPassword 
                                            ? <EyeOff size={16} aria-hidden="true" /> 
                                            : <Eye size={16} aria-hidden="true" />}
                                    </button>
                                </div>
                                {!isLoginMode && password && (
                                    <div className={styles.passwordStrength}>
                                        {password.length >= 6 ? (
                                            <span className={styles.strengthGood}>{t('password_valid')}</span>
                                        ) : (
                                            <span className={styles.strengthWeak}>{t('password_invalid')}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Honeypot field - invisible para humanos, visible para bots */}
                            <input
                                type="text"
                                name="website"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                                style={{
                                    position: 'absolute',
                                    left: '-9999px',
                                    width: '1px',
                                    height: '1px',
                                    opacity: 0,
                                    pointerEvents: 'none'
                                }}
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                            />

                            {isLoginMode && (
                                <div className={styles.forgotPasswordLink}>
                                    <button
                                        type="button"
                                        className={styles.toggleButton}
                                        onClick={() => { setMode('forgotPassword'); resetMessages(); }}
                                        disabled={isLoading}
                                    >
                                        {t('forgot_password')}
                                    </button>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className={`${styles.buttonSecondary} ${isLoading ? styles.buttonLoading : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        {isLoginMode ? t('logging_in') : t('registering')}
                                    </>
                            ) : (
                                <>
                                        {primaryEmailCta}
                                </>
                            )}
                        </button>
                        </form>

                        <div className={styles.footer}>
                            <p>
                                {isLoginMode ? t('no_account') : t('have_account')}
                                <button 
                                    type="button" 
                                    className={styles.toggleButton}
                                    onClick={toggleMode}
                                    disabled={isLoading}
                                >
                                    {isLoginMode ? t('register_here') : t('login_here')}
                                </button>
                            </p>
                        </div>
                    </>
                )}
                    </div>

                    {isPrimaryAuthMode && (
                        <aside className={styles.asideColumn}>
                            <div className={styles.contextPanel}>
                                <div className={styles.contextPanelHeader}>
                                    <Sparkles size={16} />
                                    <span>{valuePanelTitle}</span>
                                </div>
                                <div className={styles.contextBenefitList}>
                                    {authBenefits.map((benefit) => (
                                        <div key={benefit.title} className={styles.contextBenefitItem}>
                                            <div className={styles.contextBenefitIcon}>{benefit.icon}</div>
                                            <div>
                                                <strong>{benefit.title}</strong>
                                                <p>{benefit.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;

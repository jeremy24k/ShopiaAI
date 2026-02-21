import supabase from "../supabase/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/Login.module.css";

function Login() {
    const navigate = useNavigate();
    const { login, signUp } = useAuthStore();
    const { t } = useTranslation();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

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
                    setError(`❌ Error: ${error.message}`);
                    console.log(error);
                }
            } else {
                setSuccess(t('login_success'));
                setTimeout(() => {
                    navigate("/");
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
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        resetMessages();
        
        try {
            const { data, error } = await signUp(email, password, name);

            if (error) {
                if (error.message.includes("User already registered")) {
                    setError(t('user_already_registered'));
                } else if (error.message.includes("Password should be")) {
                    setError(t('password_min_length'));
                } else {
                    setError(`❌ Error: ${error.message}`);
                    console.log(error);
                }
            } else {
                setSuccess(t('register_success'));
                setTimeout(() => {
                    setIsLoginMode(true);
                    setName("");
                }, 3000);
            }
        } catch (err) {
            setError(t('connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        resetMessages();
        setName("");
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2>{isLoginMode ? t('welcome_back') : t('create_account')}</h2>
                    <p>
                        {isLoginMode 
                            ? t('login_subtitle') 
                            : t('register_subtitle')
                        }
                    </p>
                </div>

                {/* Mensajes de error y éxito */}
                {error && (
                    <div className={`${styles.message} ${styles.messageError}`}>
                        <span className={styles.messageIcon}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
                
                {success && (
                    <div className={`${styles.message} ${styles.messageSuccess}`}>
                        <span className={styles.messageIcon}>✅</span>
                        <span>{success}</span>
                    </div>
                )}

                <form className={styles.form} onSubmit={isLoginMode ? handleLogin : handleSignUp}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">{t('name_label')}</label>
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

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">{t('email_label')}</label>
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
                        <label htmlFor="password">{t('password_label')}</label>
                        <div className={styles.inputWrapper}>
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t('password_placeholder')}
                                value={password}
                                onChange={(e) => HandlePasswordChange(e.target.value)}
                                disabled={isLoading}
                                className={`${styles.input} ${error && !password ? styles.inputError : ""}`}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                                title={showPassword ? t('hide_password') : t('show_password')}
                            >
                                <span className={styles.eyeIcon}>
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
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

                    <button 
                        type="submit" 
                        className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className={styles.spinner}></span>
                                {isLoginMode ? t('logging_in') : t('registering')}
                            </>
                        ) : (
                            <>
                                {isLoginMode ? t('login_button') : t('register_button')}
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
            </div>
        </div>
    );
}

export default Login;

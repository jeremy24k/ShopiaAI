import { useAuthStore } from "../../store/AuthStore";
import { useTranslation } from "../../hooks/useTranslation";
import { useThemeStore } from "../../store/ThemeStore";
import styles from "../../styles/Sidebar.module.css";
import Icon from "../../components/ui/Icon";
import LinkButton from "../../components/ui/LinkButton";
import { User, Moon, Sun, Globe, LogOut, LogIn, Mail, FlaskConical } from "lucide-react";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import CustomSelect from "../../components/ui/CustomSelect";
import { useState } from "react";
import FeedbackModal from "../ai/FeedbackModal";

function SidebarFooter() {
    const { user, logout, loading } = useAuthStore();
    const { language: currentLang, setLanguage: changeLanguage, t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const userName = useAuthStore(state => state.userName);

    const handleContactClick = (e) => {
        setIsFeedbackOpen(true);
    };

    const languageOptions = [
        { value: "en", label: "English" },
        { value: "es", label: "Español" },
    ];

    // Convertir string a objeto para CustomSelect
    const languageValue = languageOptions.find(opt => opt.value === currentLang) || languageOptions[1];

    // Handler para cambiar idioma
    const handleLanguageChange = (selectedOption) => {
        changeLanguage(selectedOption.value);
    };

    return (
        <>
            <div id="onboarding-settings">
            <div className={styles.swicht_language}>
                <CustomSelect 
                    prefixIcon={<Icon icon={<Globe />} size="small" color="black" />} 
                    arrowPadding="0"
                    textPadding="0"
                    generalPadding="8px 12px"
                    options={languageOptions}
                    value={languageValue}
                    onChange={handleLanguageChange}
                    isSearchable={false}
                />
            </div>

            <div className={styles.swicht_mode}>
                {theme === "light" ? (
                    <button onClick={toggleTheme}>
                        <Icon icon={<Moon />} size="small" color="black" />
                        {t('dark_mode') || 'Dark Mode'}
                    </button>
                ) : (
                    <button onClick={toggleTheme}>
                        <Icon icon={<Sun />} size="small" color="black" />
                        {t('light_mode') || 'Light Mode'}
                    </button>
                )}
            </div>
            </div>
            {/* BETA badge + Contact */}
            <div className={styles.betaSection}>
                <div className={styles.betaBadge}>
                    <FlaskConical size={13} />
                    <span>{t('beta_label') || 'Beta'}</span>
                    <span className={styles.betaPulse} />
                </div>
                <button
                    className={styles.contactLink}
                    title={t('contact_tooltip')}
                    onClick={handleContactClick}
                >
                    <Mail size={13} />
                    {t('contact_us') || 'Contactar'}
                </button>
            </div>

            <FeedbackModal 
                isOpen={isFeedbackOpen} 
                onClose={() => setIsFeedbackOpen(false)} 
            />

            {loading ? (
                <div className={styles.user_container}>
                    <div className={styles.user_info}>
                        <SkeletonLoader 
                            variant="circle" 
                            width="40px" 
                            height="40px"
                        />
                        <div className={styles.user}>
                            <SkeletonLoader 
                                variant="text" 
                                width="100%" 
                                height="32px"
                            />
                        </div>
                    </div>

                    <div className={styles.user_actions}>
                        <SkeletonLoader 
                            variant="text" 
                            width="100%" 
                            height="36px"
                        />
                    </div>
                </div>
            ) : user ? (
                <div className={styles.user_container}>
                    <div className={styles.user_info}>
                        <div className={styles.user_image}>
                            <Icon icon={<User />} size="small" color="black" />
                        </div>
                        <div className={styles.user}>
                            <p className={styles.user_name}>{userName ? userName : t('username')}</p>
                            <p className={styles.user_email}>
                                <span className={styles.email_text}>{user?.email}</span>
                                <span className={styles.email_tooltip}>{user?.email}</span>
                            </p>
                        </div>
                    </div>

                    <div className={styles.user_actions}>
                        <button className={styles.logout_button} onClick={() => logout()}>
                            {t('logout')}
                            <Icon icon={<LogOut />} size="tiny"/>
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.user_container}>
                    <p className={styles.login_text}>{t('login_message') || 'Por favor, inicia sesión para acceder a tus datos de usuario.'}</p>
                    <div className={styles.user_actions}>
                        <LinkButton to="/login" variant="outline" size="normal" width="100%">
                            {t('login')}
                            <Icon icon={<LogIn />} size="tiny"/>
                        </LinkButton>
                    </div>
                </div>
            )}
        </>
    );
}

export default SidebarFooter;
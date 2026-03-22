import { useAuthStore } from "../../store/AuthStore";
import { useTranslation } from "../../hooks/useTranslation";
import { useThemeStore } from "../../store/ThemeStore";
import Icon from "./Icon";
import LinkButton from "./LinkButton";
import { User, Moon, Sun, Globe, LogOut, LogIn, X, Settings } from "lucide-react";
import SkeletonLoader from "./SkeletonLoader";
import CustomSelect from "./CustomSelect";
import styles from "../../styles/SettingsModal.module.css";

function SettingsModal({ isOpen, onClose }) {
    const { user, logout, loading } = useAuthStore();
    const { language: currentLang, setLanguage: changeLanguage, t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();

    const languageOptions = [
        { value: "en", label: "English" },
        { value: "es", label: "Español" },
    ];

    const languageValue = languageOptions.find(opt => opt.value === currentLang) || languageOptions[1];

    const handleLanguageChange = (selectedOption) => {
        changeLanguage(selectedOption.value);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h3>{t('settings') || 'Configuración'}</h3>
                    <button className={styles.close_button} onClick={onClose}>
                        <Icon icon={<X />} size="small" color="black" />
                    </button>
                </div>

                <div className={styles.modal_body}>
                    {/* Idioma */}
                    <div className={styles.setting_section}>
                        <label className={styles.setting_label}>
                            <Icon icon={<Globe />} size="small" color="black" />
                            {t('language') || 'Idioma'}
                        </label>
                        <CustomSelect 
                            arrowPadding="0"
                            textPadding="0"
                            generalPadding="8px 12px"
                            options={languageOptions}
                            value={languageValue}
                            onChange={handleLanguageChange}
                            isSearchable={false}
                        />
                    </div>

                    {/* Modo oscuro */}
                    <div className={styles.setting_section}>
                        <label className={styles.setting_label}>
                            <Icon icon={theme === "light" ? <Moon /> : <Sun />} size="small" color="black" />
                            {t('theme') || 'Tema'}
                        </label>
                        <button 
                            className={styles.theme_button}
                            onClick={toggleTheme}
                        >
                            {theme === "light" ? (t('dark_mode') || 'Modo Oscuro') : (t('light_mode') || 'Modo Claro')}
                        </button>
                    </div>

                    {/* Usuario */}
                    <div className={styles.setting_section}>
                        <label className={styles.setting_label}>
                            <Icon icon={<User />} size="small" color="black" />
                            {t('account') || 'Cuenta'}
                        </label>
                        
                        {loading ? (
                            <div className={styles.user_loading}>
                                <SkeletonLoader variant="circle" width="40px" height="40px" />
                                <SkeletonLoader variant="text" width="100%" height="32px" />
                            </div>
                        ) : user ? (
                            <div className={styles.user_info}>
                                <div className={styles.user_avatar}>
                                    <Icon icon={<User />} size="full" color="black" />
                                </div>
                                <div className={styles.user_details}>
                                    <p className={styles.user_name}>{t('username') || 'UserName'}</p>
                                    <p className={styles.user_email}>{user?.email}</p>
                                </div>
                            </div>
                        ) : (
                            <p className={styles.login_message}>
                                {t('login_message') || 'Por favor, inicia sesión para acceder a tus datos de usuario.'}
                            </p>
                        )}
                    </div>
                </div>

                <div className={styles.modal_footer}>
                    {user ? (
                        <>
                            <LinkButton to="/account" variant="outline" size="normal" width="100%" onClick={onClose}>
                                {t('account')}
                                <Icon icon={<Settings />} size="tiny"/>
                            </LinkButton>
                            <button 
                                className={styles.logout_button} 
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                            >
                                {t('logout')}
                                <Icon icon={<LogOut />} size="tiny"/>
                            </button>
                        </>
                    ) : (
                        <LinkButton to="/login" variant="outline" size="normal" width="100%">
                            {t('login')}
                            <Icon icon={<LogIn />} size="tiny"/>
                        </LinkButton>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;

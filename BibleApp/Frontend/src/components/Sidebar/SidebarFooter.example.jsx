import { useAuthStore } from "../../store/AuthStore";
import styles from "../../styles/Sidebar.module.css";
import Icon from "../ui/Icon";
import { Link } from "react-router-dom";
import { CircleUserRound, Moon, Sun, Globe, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import CustomSelect from "../ui/CustomSelect";
import SkeletonLoader from "../ui/SkeletonLoader";

function SidebarFooter() {
    const { user, logout, loading } = useAuthStore();
    const [mode, setMode] = useState("light");
    const [language, setLanguage] = useState({ value: "es", label: "Español" });

    // Opciones de idioma con iconos (banderas emoji)
    const languageOptions = [
        { 
            value: "en", 
            label: "English",
            icon: <span style={{ fontSize: '18px' }}>🇺🇸</span>
        },
        { 
            value: "es", 
            label: "Español",
            icon: <span style={{ fontSize: '18px' }}>🇪🇸</span>
        },
        { 
            value: "fr", 
            label: "Français",
            icon: <span style={{ fontSize: '18px' }}>🇫🇷</span>
        },
        { 
            value: "de", 
            label: "Deutsch",
            icon: <span style={{ fontSize: '18px' }}>🇩🇪</span>
        },
    ];

    // Estilos personalizados para el select de idioma
    const languageSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '36px',
            borderRadius: '8px',
            borderColor: state.isFocused ? 'var(--color-primary-500)' : 'var(--color-grey-300)',
            boxShadow: state.isFocused ? '0 0 0 2px var(--color-primary-100)' : 'none',
            backgroundColor: 'var(--color-white)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: 'var(--color-primary-400)',
            },
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '4px 8px',
            gap: '6px',
        }),
        singleValue: (base) => ({
            ...base,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--color-grey-900)',
        }),
        option: (base, state) => ({
            ...base,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: state.isSelected
                ? 'var(--color-primary-500)'
                : state.isFocused
                ? 'var(--color-primary-50)'
                : 'transparent',
            color: state.isSelected ? 'var(--color-white)' : 'var(--color-grey-900)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: state.isSelected ? '600' : '400',
            transition: 'all 0.15s ease',
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            marginTop: '4px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            padding: '4px',
            color: 'var(--color-grey-500)',
            transition: 'all 0.2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
    };

    return (
        <>
            {/* Select de Idioma con CustomSelect */}
            <div className={styles.swicht_language}>
                <CustomSelect 
                    value={language} 
                    onChange={setLanguage}
                    options={languageOptions}
                    isSearchable={false}
                    prefixIcon={<Globe size={16} color="var(--color-grey-600)" />}
                    placeholder="Selecciona idioma"
                    customStyles={languageSelectStyles}
                    menuPlacement="top"
                />
            </div>

            {/* Botón de Modo (Dark/Light) */}
            <div className={styles.swicht_mode}>
                {mode === "light" ? (
                    <button onClick={() => setMode("dark")}>
                        <Icon icon={<Moon />} size="small" color="black" />
                        Dark Mode
                    </button>
                ) : (
                    <button onClick={() => setMode("light")}>
                        <Icon icon={<Sun />} size="small" color="black" />
                        Light Mode
                    </button>
                )}
            </div>
        
            {/* Información del Usuario */}
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
                            <Icon icon={<CircleUserRound />} size="full" color="black" />
                        </div>
                        <div className={styles.user}>
                            <p className={styles.user_name}>UserName</p>
                            <p className={styles.user_email}>
                                <span className={styles.email_text}>{user?.email}</span>
                                <span className={styles.email_tooltip}>{user?.email}</span>
                            </p>
                        </div>
                    </div>

                    <div className={styles.user_actions}>
                        <button className={styles.logout_button} onClick={() => logout()}>
                            Logout
                            <Icon icon={<LogOut />} size="tiny"/>
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.user_container}>
                    <p className={styles.login_text}>Por favor, inicia sesión para acceder a tus datos de usuario.</p>
                    <div className={styles.user_actions}>
                        <Link to="/login" className={styles.login_button}>
                            Login
                            <Icon icon={<LogIn />} size="tiny"/>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default SidebarFooter;

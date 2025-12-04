import { useAuthStore } from "../../store/AuthStore";
import styles from "../../styles/Sidebar.module.css";
import Icon from "../ui/Icon";
import { Link } from "react-router-dom";
import { CircleUserRound, Moon, Sun, Globe, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import Select, { components } from "react-select";

function SidebarFooter() {
    const { user, logout, loading } = useAuthStore();
    const [mode, setMode] = useState("light");
    const [language, setLanguage] = useState({ value: "es", label: "Español" });

    const languageOptions = [
        { value: "en", label: "English" },
        { value: "es", label: "Español" },
    ];

    const ValueContainer = ({ children, ...props }) => {
        return (
            <components.ValueContainer {...props}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                    <Icon icon={<Globe />} size="small" color="black" />
                    {children}
                </div>
            </components.ValueContainer>
        );
    };

    return (
        <>
            <div className={styles.swicht_language}>
                <Select 
                    value={language} 
                    onChange={setLanguage}
                    options={languageOptions}
                    components={{ ValueContainer }}
                    isSearchable={false}
                />
            </div>

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

            {loading ? (
                <div className={styles.user_container}>
                    <div className={styles.user_info}>
                        <div className={styles.user_image}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-grey-400)' }}></div>
                        </div>
                        <div className={styles.user} style={{ gap: '8px' }}>
                            <div style={{ width: '80px', height: '16px', backgroundColor: 'var(--color-grey-400)', borderRadius: '4px' }}></div>
                            <div style={{ width: '120px', height: '14px', backgroundColor: 'var(--color-grey-400)', borderRadius: '4px' }}></div>
                        </div>
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
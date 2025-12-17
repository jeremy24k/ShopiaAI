import { useAuthStore } from "../../store/AuthStore";
import styles from "../../styles/Sidebar.module.css";
import Icon from "../../components/ui/Icon";
import { Link } from "react-router-dom";
import { CircleUserRound, Moon, Sun, Globe, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import CustomSelect from "../../components/ui/CustomSelect";

function SidebarFooter() {
    const { user, logout, loading } = useAuthStore();
    const [mode, setMode] = useState("light");
    const [language, setLanguage] = useState({ value: "es", label: "Español" });

    const languageOptions = [
        { value: "en", label: "English" },
        { value: "es", label: "Español" },
    ];

    return (
        <>
            <div className={styles.swicht_language}>
                <CustomSelect 
                    prefixIcon={<Icon icon={<Globe />} size="small" color="black" />} 
                    arrowPadding="0"
                    textPadding="0"
                    generalPadding="8px 12px"
                    options={languageOptions}
                    value={language}
                    onChange={setLanguage}
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
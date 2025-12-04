import LogoImage from '../../assets/LogoImage.webp';
import LogoApp from '../../assets/LogoApp.jsx';
import styles from "../../styles/Sidebar.module.css";

function SidebarHeader() {
    return (
        <>
            <img className={styles.header_image} src={LogoImage} alt="Logo App" />
            <div className={styles.header_logo}>
                <LogoApp />
            </div>
        </>
    );
}

export default SidebarHeader;

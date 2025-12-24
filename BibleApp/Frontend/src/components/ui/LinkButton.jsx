import { Link } from "react-router-dom";
import styles from "../../styles/LinkButton.module.css";

function LinkButton({ 
    to, 
    children, 
    variant = "primary",
    size = "medium",
    width = "150px",
    className = "",
    ...props 
}) {
    const variantClass = styles[`btn_${variant}`] || styles.btn_primary;
    const sizeClass = styles[`btn_${size}`] || styles.btn_medium;

    return (
        <Link 
            to={to} 
            style={{ width }}
            className={`${styles.link_button} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </Link>
    );
}

export default LinkButton;

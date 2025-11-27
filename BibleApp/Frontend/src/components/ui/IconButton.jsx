import styles from "../../styles/IconButton.module.css";
import { Link } from "react-router-dom";

function IconButton({ 
  icon: Icon, 
  ariaLabel, 
  onClick, 
  disabled = false,
  size = "medium",
  variant = "default",
  type = "button", 
  to = ""
}) {

  const className = `
    ${styles.icon_button} 
    ${styles[`icon_button_${size}`]} 
    ${styles[`icon_button_${variant}`]}
  `;

  if (type === "link") {
    return (
      <Link
        className={className}
        aria-label={ariaLabel}
        to={to}
      >
        <Icon />
      </Link>
    );
  }

  return (
    <button
      className={className}
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon />
    </button>
  );
}

export default IconButton;
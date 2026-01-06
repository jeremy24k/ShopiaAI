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
  to = "",
  iconSize = "small",
  circle = false,
  title = ""
}) {

  const className = `
    ${styles.icon_button} 
    ${styles[`icon_button_${size}`]} 
    ${styles[`icon_button_${variant}`]}
    ${styles[`icon_size_${iconSize}`]}
    ${styles[`icon_button_${circle ? 'circle' : ''}`]}
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
      title={title}
    >
      <Icon />
    </button>
  );
}

export default IconButton;
import styles from "../../styles/Icon.module.css";

function Icon({ icon, size, color, title }) {
    const iconClassName = `
        ${styles.icon}
        ${styles[`icon_size_${size}`]}
        ${styles[`icon_color_${color}`]}
    `;

    return (
        <span className={iconClassName} title={title}>
            { icon }
        </span>
    );
}

export default Icon;
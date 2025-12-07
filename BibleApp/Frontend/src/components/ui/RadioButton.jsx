import styles from "../../styles/Filter.module.css";

function RadioButton({ label, value, checked, onChange, name = "radio-group" }) {
    return (
        <label className={styles.ctn_radio_label}>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />

            <span className={styles.ctn_radio_span}>
                <span className={styles.ctn_radio_span_check}>
                </span>
            </span>

            <span className={styles.ctn_radio_span_label}>
                {label}
            </span>
        </label>
    );
}

export default RadioButton;
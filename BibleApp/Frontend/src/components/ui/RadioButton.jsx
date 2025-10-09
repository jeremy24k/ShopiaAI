function RadioButton({ label, value, checked, onChange }) {
    return (
        <label>
            <input type="radio" name="testament" value={value} checked={checked} onChange={onChange} />
            {label}
        </label>
    );
}

export default RadioButton;
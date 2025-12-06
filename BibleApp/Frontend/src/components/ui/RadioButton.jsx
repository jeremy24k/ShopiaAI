function RadioButton({ label, value, checked, onChange, name = "radio-group" }) {
    return (
        <label>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
            {label}
        </label>
    );
}

export default RadioButton;
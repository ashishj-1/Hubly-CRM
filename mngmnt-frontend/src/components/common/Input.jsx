import "./Input.css";

// Input Component
export const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="input-group">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      {/* Input Field */}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${error ? "input-error" : ""}`}
        required={required}
        disabled={disabled}
      />

      {/* Error Message */}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
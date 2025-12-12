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
  const inputId = name;
  const hasError = Boolean(error);

  return (
    <div className="input-group">
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      {/* Input Field */}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`input ${hasError ? "input-error" : ""}`}
      />

      {/* Error Message */}
      {hasError && <span className="error-message">{error}</span>}
    </div>
  );
};
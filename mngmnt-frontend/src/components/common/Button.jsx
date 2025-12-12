import "./Button.css";

// Reusable button component
export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;
  const classes = [
    "btn",
    `btn-${variant}`,
    fullWidth ? "btn-full" : "",
    loading ? "btn-loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
    >
      {/* Show spinner when loading */}
      {loading ? <span className="spinner" /> : children}
    </button>
  );
};
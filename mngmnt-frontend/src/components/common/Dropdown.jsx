import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import "./Dropdown.css";

// Generic dropdown component
const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  renderOption,
  renderSelected,
  icon = null,
  disabled = false,
}) => {
  // Open/close state
  const [isOpen, setIsOpen] = useState(false);

  // Ref for click-outside detection
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Current selected option
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Handle selection
  const handleSelect = useCallback(
    (option) => {
      onChange(option.value);
      setIsOpen(false);
    },
    [onChange]
  );

  const rootClass = ["dropdown", disabled && "dropdown-disabled"]
    .filter(Boolean)
    .join(" ");
  const triggerClass = ["dropdown-trigger", isOpen && "dropdown-open"]
    .filter(Boolean)
    .join(" ");
  const arrowClass = ["dropdown-arrow", isOpen && "dropdown-arrow-up"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} ref={dropdownRef}>
      {/* Trigger */}
      <div
        className={triggerClass}
        onClick={() => !disabled && setIsOpen((o) => !o)}
      >
        {/* Optional icon */}
        {icon && <span className="dropdown-icon">{icon}</span>}

        {/* Selected value or placeholder */}
        <span className="dropdown-value">
          {selectedOption
            ? renderSelected
              ? renderSelected(selectedOption)
              : selectedOption.label
            : placeholder}
        </span>

        {/* Arrow */}
        <svg
          className={arrowClass}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>

      {/* Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div
              key={option.value ?? index}
              className={`dropdown-item ${
                value === option.value ? "dropdown-item-selected" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {renderOption ? renderOption(option) : option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
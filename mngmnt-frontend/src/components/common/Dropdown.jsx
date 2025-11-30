import React, { useState, useRef, useEffect } from "react";
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
  const selectedOption = options.find((opt) => opt.value === value);

  // Handle selection
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div
      className={`dropdown ${disabled ? "dropdown-disabled" : ""}`}
      ref={dropdownRef}
    >
      {/* Trigger */}
      <div
        className={`dropdown-trigger ${isOpen ? "dropdown-open" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
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
          className={`dropdown-arrow ${isOpen ? "dropdown-arrow-up" : ""}`}
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
              key={option.value || index}
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
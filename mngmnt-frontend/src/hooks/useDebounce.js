import { useState, useEffect } from "react";

export const useDebounce = (value, delay = 500) => {
  // Debounced value state
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Update debounced value after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
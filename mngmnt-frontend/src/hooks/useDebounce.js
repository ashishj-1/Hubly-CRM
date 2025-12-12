import { useEffect, useState } from "react";

export const useDebounce = (value, delay = 500) => {
  // Debounced value state
  const [debouncedValue, setDebouncedValue] = useState(() => value);

  // Update debounced value after delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
};
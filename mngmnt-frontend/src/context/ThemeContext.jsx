import { createContext, useReducer, useEffect } from "react";

export const ThemeContext = createContext();

// Theme state
const initialState = {
  theme: "light",
};

function themeReducer(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load saved theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "light";
    dispatch({ type: "SET_THEME", payload: stored });
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const switched = state.theme === "light" ? "dark" : "light";
    dispatch({ type: "SET_THEME", payload: switched });
    localStorage.setItem("theme", switched);
    document.documentElement.setAttribute("data-theme", switched);
  };

  const value = {
    theme: state.theme,
    toggleTheme,
    isDark: state.theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
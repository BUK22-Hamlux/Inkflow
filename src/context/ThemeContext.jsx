import { createContext, useContext, useState, useEffect } from "react";
import themes from "../config/themes";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("inkflow_theme");
    const isValid = themes.some((t) => t.id === saved);
    return isValid ? saved : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("inkflow_theme", theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    const isValid = themes.some((t) => t.id === newTheme);
    if (!isValid) return;
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used inside ThemeProvider");
  }
  return context;
};

export default ThemeContext;

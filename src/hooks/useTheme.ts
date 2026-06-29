import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../../constants/Colors";

export function useTheme() {
  const { theme, setTheme } = useThemeStore();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  
  return {
    theme,
    setTheme,
    colors,
    accent: Colors.accent,
    textColors: Colors.text,
  };
}

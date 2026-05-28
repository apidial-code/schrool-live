import React from "react";
type Theme = "light" | "dark";
interface ThemeContextType {
    theme: Theme;
    toggleTheme?: () => void;
    switchable: boolean;
}
interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    switchable?: boolean;
}
export declare function ThemeProvider({ children, defaultTheme, switchable, }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useTheme(): ThemeContextType;
export {};

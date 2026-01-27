import { useEffect, useState } from "react";
import { SunMediumIcon } from "@/components/icons/SunMediumIcon";
import { SunMoonIcon } from "@/components/icons/SunMoonIcon";

export function DarkModeToggle({
    className = "",
    variant = "header"
}: {
    className?: string;
    variant?: "header" | "chat";
}) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Check dark mode on mount
    useEffect(() => {
        const darkMode = localStorage.getItem("darkMode") === "true";
        setIsDarkMode(darkMode);

        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        // Save to localStorage
        localStorage.setItem("darkMode", String(newDarkMode));

        // Toggle dark class
        if (newDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Different styles based on variant
    const baseStyles = "relative transition-colors";
    const variantStyles = {
        header: "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-transparent",
        chat: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    };

    const iconStyles = {
        header: "text-gray-600 dark:text-gray-300",
        chat: "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    };

    return (
        <button
            onClick={toggleDarkMode}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDarkMode ? (
                <SunMoonIcon size={20} className={iconStyles[variant]} />
            ) : (
                <SunMediumIcon size={20} className={iconStyles[variant]} />
            )}
        </button>
    );
}

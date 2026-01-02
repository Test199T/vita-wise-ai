import React from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export function ShinyButton({
    children,
    className,
    ...props
}: ShinyButtonProps) {
    return (
        <button
            className={cn(
                "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3 font-medium transition-all duration-300",
                "bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500 bg-[length:200%_100%]",
                "text-white shadow-lg hover:shadow-xl hover:shadow-sky-500/50",
                "hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                className
            )}
            style={{
                backgroundPosition: "0% 50%",
                animation: "gradient 3s ease infinite"
            }}
            {...props}
        >
            {/* Shimmer effect */}
            <span className="absolute inset-0 overflow-hidden rounded-full">
                <span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{
                        transform: "translateX(-100%)",
                        animation: "shimmer 2s ease-in-out infinite"
                    }}
                />
            </span>

            {/* Button content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </button>
    );
}

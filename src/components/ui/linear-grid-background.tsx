import React from "react";
import { cn } from "@/lib/utils";

interface LinearGridProps {
    className?: string;
    children?: React.ReactNode;
}

export const LinearGridBackground = ({
    className,
    children,
}: LinearGridProps) => {
    return (
        <div className={cn("relative w-full overflow-hidden bg-white", className)}>
            {/* Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 z-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
                />
                {/* Radial Mask */}
                <div className="absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_70%,black)]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

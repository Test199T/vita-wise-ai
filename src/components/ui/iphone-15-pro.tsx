"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Iphone15ProProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: number;
    height?: number;
    src?: string;
    videoSrc?: string;
    children?: React.ReactNode;
}

const Iphone15Pro = React.forwardRef<HTMLDivElement, Iphone15ProProps>(
    (
        {
            width = 433,
            height = 882,
            src,
            videoSrc,
            children,
            className,
            ...props
        },
        ref
    ) => {
        // Calculate proportions based on original 433x882 dimensions
        const scale = width / 433;
        const screenWidth = Math.round(385 * scale);
        const screenHeight = Math.round(840 * scale);
        const screenLeft = Math.round(24 * scale);
        const screenTop = Math.round(21 * scale);
        const borderRadius = Math.round(47 * scale);

        return (
            <div
                ref={ref}
                className={cn("relative", className)}
                style={{
                    width,
                    height,
                }}
                {...props}
            >
                {/* iPhone Outer Frame - Background */}
                <div
                    className="absolute inset-0 bg-[#1F1F1F] rounded-[55px]"
                    style={{
                        borderRadius: `${55 * scale}px`,
                    }}
                />

                {/* Screen Content Area */}
                <div
                    className="absolute overflow-hidden bg-white"
                    style={{
                        left: screenLeft,
                        top: screenTop,
                        width: screenWidth,
                        height: screenHeight,
                        borderRadius,
                    }}
                >
                    {src && (
                        <img
                            src={src}
                            alt="iPhone screen"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}
                    {videoSrc && (
                        <video
                            src={videoSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}
                    {children}
                </div>

                {/* iPhone Frame (Top bezel with Dynamic Island) */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    width={width}
                    height={height}
                    viewBox="0 0 433 882"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Frame outline only */}
                    <path
                        d="M75 1H358C397.765 1 430 33.2355 430 73V809C430 848.765 397.765 881 358 881H75C35.2355 881 3 848.765 3 809V73C3 33.2355 35.2355 1 75 1Z"
                        stroke="#333"
                        strokeWidth="4"
                        fill="none"
                    />

                    {/* Left side buttons */}
                    <rect x="-4" y="165" width="8" height="40" rx="3" fill="#1F1F1F" />
                    <rect x="-4" y="230" width="8" height="80" rx="3" fill="#1F1F1F" />
                    <rect x="-4" y="325" width="8" height="80" rx="3" fill="#1F1F1F" />

                    {/* Right side button */}
                    <rect x="429" y="200" width="8" height="100" rx="3" fill="#1F1F1F" />

                    {/* Top bezel (covers the area above the notch) */}
                    <rect x="24" y="21" width="385" height="50" rx="47" ry="30" fill="#1F1F1F" />

                    {/* Dynamic Island */}
                    <path
                        d="M154 48C154 40.268 160.268 34 168 34H265C272.732 34 279 40.268 279 48C279 55.732 272.732 62 265 62H168C160.268 62 154 55.732 154 48Z"
                        fill="#0A0A0A"
                    />

                    {/* Camera lens */}
                    <circle cx="261" cy="48" r="5" fill="#1C1C1E" />
                    <circle cx="261" cy="48" r="2.5" fill="#2D5A7B" />

                    {/* Frame highlight */}
                    <path
                        d="M75 1H358C397.765 1 430 33.2355 430 73V809C430 848.765 397.765 881 358 881H75C35.2355 881 3 848.765 3 809V73C3 33.2355 35.2355 1 75 1Z"
                        stroke="url(#highlight)"
                        strokeOpacity="0.15"
                    />

                    <defs>
                        <linearGradient id="highlight" x1="0" y1="0" x2="433" y2="882">
                            <stop offset="0%" stopColor="white" />
                            <stop offset="50%" stopColor="#666" />
                            <stop offset="100%" stopColor="white" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Bottom indicator */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 bg-slate-300 rounded-full"
                    style={{
                        bottom: `${10 * scale}px`,
                        width: `${120 * scale}px`,
                        height: `${5 * scale}px`,
                    }}
                />
            </div>
        );
    }
);

Iphone15Pro.displayName = "Iphone15Pro";

export { Iphone15Pro };

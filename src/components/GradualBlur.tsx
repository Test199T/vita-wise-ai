// Component added by Ansh - github.com/ansh-dhanani
import React, { useEffect, useRef, useState } from 'react';

interface GradualBlurProps {
    target?: 'parent' | 'self';
    position?: 'top' | 'bottom' | 'left' | 'right';
    height?: string;
    width?: string;
    strength?: number;
    divCount?: number;
    curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out';
    exponential?: boolean;
    opacity?: number;
    className?: string;
    zIndex?: number;
}

const GradualBlur: React.FC<GradualBlurProps> = ({
    target = 'parent',
    position = 'bottom',
    height = '6rem',
    width = '100%',
    strength = 10,
    divCount = 5,
    curve = 'bezier',
    exponential = true,
    opacity = 1,
    className = '',
    zIndex = 10,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: '100%', height: '6rem' });

    useEffect(() => {
        if (target === 'parent' && containerRef.current?.parentElement) {
            const parent = containerRef.current.parentElement;
            const resizeObserver = new ResizeObserver(() => {
                if (position === 'top' || position === 'bottom') {
                    setDimensions({ width: '100%', height });
                } else {
                    setDimensions({ width, height: '100%' });
                }
            });
            resizeObserver.observe(parent);
            return () => resizeObserver.disconnect();
        }
    }, [target, position, height, width]);

    const getBlurValue = (index: number): number => {
        const normalizedIndex = index / (divCount - 1);
        let blurFactor: number;

        if (exponential) {
            blurFactor = Math.pow(normalizedIndex, 2);
        } else {
            switch (curve) {
                case 'linear':
                    blurFactor = normalizedIndex;
                    break;
                case 'ease-in':
                    blurFactor = normalizedIndex * normalizedIndex;
                    break;
                case 'ease-out':
                    blurFactor = 1 - Math.pow(1 - normalizedIndex, 2);
                    break;
                case 'bezier':
                default:
                    blurFactor = normalizedIndex < 0.5
                        ? 2 * normalizedIndex * normalizedIndex
                        : 1 - Math.pow(-2 * normalizedIndex + 2, 2) / 2;
            }
        }

        return blurFactor * strength;
    };

    const getOpacityValue = (index: number): number => {
        const normalizedIndex = index / (divCount - 1);
        return (1 - normalizedIndex) * opacity;
    };

    const getPositionStyles = () => {
        const baseStyles: React.CSSProperties = {
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: zIndex,
        };

        switch (position) {
            case 'top':
                return { ...baseStyles, top: 0, left: 0, right: 0, height: dimensions.height };
            case 'bottom':
                return { ...baseStyles, bottom: 0, left: 0, right: 0, height: dimensions.height };
            case 'left':
                return { ...baseStyles, left: 0, top: 0, bottom: 0, width: dimensions.width };
            case 'right':
                return { ...baseStyles, right: 0, top: 0, bottom: 0, width: dimensions.width };
            default:
                return baseStyles;
        }
    };

    const getGradientDirection = () => {
        switch (position) {
            case 'top':
                return 'to bottom';
            case 'bottom':
                return 'to top';
            case 'left':
                return 'to right';
            case 'right':
                return 'to left';
            default:
                return 'to top';
        }
    };

    return (
        <div
            ref={containerRef}
            className={className}
            style={getPositionStyles()}
        >
            {Array.from({ length: divCount }).map((_, index) => {
                const blur = getBlurValue(index);
                const opacityValue = getOpacityValue(index);

                return (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backdropFilter: `blur(${blur}px)`,
                            WebkitBackdropFilter: `blur(${blur}px)`,
                            maskImage: `linear-gradient(${getGradientDirection()}, black, transparent)`,
                            WebkitMaskImage: `linear-gradient(${getGradientDirection()}, black, transparent)`,
                            opacity: opacityValue,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default GradualBlur;

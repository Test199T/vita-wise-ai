import React from 'react';

interface ShootingStarProps {
    delay?: number;
    duration?: number;
    top?: string;
    left?: string;
    angle?: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({
    delay = 0,
    duration = 3,
    top = '10%',
    left = '10%',
    angle = 35,
}) => {
    return (
        <div
            className="absolute pointer-events-none"
            style={{
                top,
                left,
                transform: `rotate(${angle}deg)`,
            }}
        >
            <svg
                width="200"
                height="8"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shooting-star-svg"
                style={{
                    animation: `shootingStar ${duration}s ease-in-out ${delay}s infinite`,
                }}
            >
                <defs>
                    <linearGradient id={`starGradient-${delay}`} x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="30%" stopColor="rgba(200,220,255,0.3)" />
                        <stop offset="70%" stopColor="rgba(255,255,255,0.7)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,1)" />
                    </linearGradient>
                    <filter id={`glow-${delay}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Trail */}
                <line
                    x1="0"
                    y1="4"
                    x2="180"
                    y2="4"
                    stroke={`url(#starGradient-${delay})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Glowing head */}
                <circle
                    cx="190"
                    cy="4"
                    r="4"
                    fill="white"
                    filter={`url(#glow-${delay})`}
                />
                <circle
                    cx="190"
                    cy="4"
                    r="2"
                    fill="white"
                />
            </svg>
        </div>
    );
};

const SVGShootingStars: React.FC = () => {
    // Multiple shooting stars with different positions and timings
    const stars = [
        { delay: 0, duration: 4, top: '5%', left: '-5%', angle: 32 },
        { delay: 1.5, duration: 3.5, top: '15%', left: '10%', angle: 28 },
        { delay: 3, duration: 4.5, top: '8%', left: '25%', angle: 35 },
        { delay: 0.5, duration: 3, top: '20%', left: '-10%', angle: 38 },
        { delay: 2.5, duration: 4, top: '12%', left: '40%', angle: 30 },
        { delay: 4, duration: 3.8, top: '3%', left: '15%', angle: 33 },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <style>{`
        @keyframes shootingStar {
          0% {
            opacity: 0;
            transform: translateX(-100px) translateY(-50px) scale(0.3);
          }
          10% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(calc(100vw + 200px)) translateY(calc(50vh)) scale(1.2);
          }
        }
      `}</style>

            {stars.map((star, index) => (
                <ShootingStar key={index} {...star} />
            ))}
        </div>
    );
};

export default SVGShootingStars;

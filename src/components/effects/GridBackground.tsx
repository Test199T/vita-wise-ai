import React from 'react';

interface GridBackgroundProps {
    gridSize?: number;
    lineColor?: string;
    accentColor?: string;
}

const GridBackground: React.FC<GridBackgroundProps> = ({
    gridSize = 90,
    lineColor = 'rgba(255, 255, 255, 0.08)',
    accentColor = '#38bdf8', // Sky blue accent
}) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Grid Pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, ${lineColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
          `,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
            />

            {/* Animated Glowing Lines */}
            <style>{`
        @keyframes lineGlow1 {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }
        
        @keyframes lineGlow2 {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        .glow-line-horizontal {
          position: absolute;
          height: 2px;
          width: 150px;
          background: linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%);
          filter: blur(1px);
          box-shadow: 0 0 10px ${accentColor}, 0 0 20px ${accentColor};
        }
        
        .glow-line-vertical {
          position: absolute;
          width: 2px;
          height: 150px;
          background: linear-gradient(180deg, transparent 0%, ${accentColor} 50%, transparent 100%);
          filter: blur(1px);
          box-shadow: 0 0 10px ${accentColor}, 0 0 20px ${accentColor};
        }
      `}</style>

            {/* Horizontal glowing lines */}
            <div
                className="glow-line-horizontal"
                style={{
                    top: `${gridSize}px`,
                    left: 0,
                    animation: 'lineGlow1 8s ease-in-out infinite',
                }}
            />
            <div
                className="glow-line-horizontal"
                style={{
                    top: `${gridSize * 3}px`,
                    left: 0,
                    animation: 'lineGlow1 10s ease-in-out 2s infinite',
                }}
            />
            <div
                className="glow-line-horizontal"
                style={{
                    top: `${gridSize * 5}px`,
                    left: 0,
                    animation: 'lineGlow1 7s ease-in-out 4s infinite',
                }}
            />

            {/* Vertical glowing lines */}
            <div
                className="glow-line-vertical"
                style={{
                    left: `${gridSize * 2}px`,
                    top: 0,
                    animation: 'lineGlow2 9s ease-in-out 1s infinite',
                }}
            />
            <div
                className="glow-line-vertical"
                style={{
                    left: `${gridSize * 5}px`,
                    top: 0,
                    animation: 'lineGlow2 11s ease-in-out 3s infinite',
                }}
            />
            <div
                className="glow-line-vertical"
                style={{
                    left: `${gridSize * 8}px`,
                    top: 0,
                    animation: 'lineGlow2 8s ease-in-out 5s infinite',
                }}
            />

            {/* Intersection dots/crosses at some grid points */}
            <div
                className="absolute w-2 h-2 rounded-full bg-sky-400/50"
                style={{
                    top: `${gridSize * 2 - 4}px`,
                    left: `${gridSize * 3 - 4}px`,
                    boxShadow: '0 0 8px #38bdf8',
                }}
            />
            <div
                className="absolute w-2 h-2 rounded-full bg-sky-400/50"
                style={{
                    top: `${gridSize * 4 - 4}px`,
                    left: `${gridSize * 6 - 4}px`,
                    boxShadow: '0 0 8px #38bdf8',
                }}
            />
            <div
                className="absolute w-2 h-2 rounded-full bg-emerald-400/50"
                style={{
                    top: `${gridSize * 3 - 4}px`,
                    left: `${gridSize * 8 - 4}px`,
                    boxShadow: '0 0 8px #34d399',
                }}
            />
        </div>
    );
};

export default GridBackground;

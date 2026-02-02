import React, { useEffect, useRef } from 'react';

interface Sparkle {
    x: number;
    y: number;
    size: number;
    opacity: number;
    twinklePhase: number;
    twinkleSpeed: number;
    driftX: number;
    driftY: number;
    color: string;
    lifespan: number;
    age: number;
}

const FairyDust = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparklesRef = useRef<Sparkle[]>([]);
    const animationRef = useRef<number>(0);

    const sparkleColors = [
        '#FFD700', // Gold
        '#FFFFFF', // White
        '#FFB6C1', // Light pink
        '#87CEEB', // Sky blue
        '#E6E6FA', // Lavender
        '#FFFACD', // Lemon chiffon
        '#F0FFF0', // Honeydew
        '#FFF0F5', // Lavender blush
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const createSparkle = (): Sparkle => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4 + 1,
            opacity: Math.random() * 0.8 + 0.2,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.1 + 0.05,
            driftX: (Math.random() - 0.5) * 0.3,
            driftY: (Math.random() - 0.5) * 0.3,
            color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
            lifespan: Math.random() * 200 + 100,
            age: 0,
        });

        // Initialize sparkles
        const sparkleCount = 80;
        sparklesRef.current = [];
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = createSparkle();
            sparkle.age = Math.random() * sparkle.lifespan;
            sparklesRef.current.push(sparkle);
        }

        const drawSparkle = (ctx: CanvasRenderingContext2D, s: Sparkle) => {
            const twinkle = (Math.sin(s.twinklePhase) + 1) / 2;
            const currentOpacity = s.opacity * twinkle;
            const currentSize = s.size * (0.5 + twinkle * 0.5);

            const lifeFade = s.age < 20
                ? s.age / 20
                : s.age > s.lifespan - 20
                    ? (s.lifespan - s.age) / 20
                    : 1;

            const finalOpacity = currentOpacity * lifeFade;

            ctx.save();
            ctx.translate(s.x, s.y);

            // Outer glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 4);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.8})`);
            gradient.addColorStop(0.3, `rgba(255, 215, 0, ${finalOpacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 4, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Star shape
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const length = currentSize * 2;
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
            }
            ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity})`;
            ctx.lineWidth = currentSize * 0.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Center dot
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
            ctx.fill();

            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sparklesRef.current.forEach((s, index) => {
                s.x += s.driftX;
                s.y += s.driftY;
                s.twinklePhase += s.twinkleSpeed;
                s.age++;

                if (s.age >= s.lifespan || s.x < -50 || s.x > canvas.width + 50 || s.y < -50 || s.y > canvas.height + 50) {
                    sparklesRef.current[index] = createSparkle();
                }

                drawSparkle(ctx, s);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-20"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default FairyDust;

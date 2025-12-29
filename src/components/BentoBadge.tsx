"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ArrowRightIcon, X } from "lucide-react";

// AI Wand Icon Component
const AIWandIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M10.9381 11.0774L3.41101 18.6045C2.863 19.1525 2.863 20.041 3.41101 20.589C3.95902 21.137 4.84752 21.137 5.39553 20.589L12.9226 13.0619M10.9381 11.0774L12.9226 13.0619M10.9381 11.0774L11.6823 10.3332M12.9226 13.0619L13.6668 12.3177M11.6823 10.3332L11.7248 10.2906C12.1124 9.90313 12.7406 9.90313 13.1281 10.2906L13.7094 10.8719C14.0969 11.2594 14.0969 11.8876 13.7094 12.2751L13.6668 12.3177M11.6823 10.3332L13.6668 12.3177" />
        <path d="M18.2377 3.16707C18.3416 2.94431 18.6584 2.94431 18.7623 3.16707L19.1541 4.00647C19.3266 4.37618 19.6238 4.67336 19.9935 4.84591L20.8329 5.23766C21.0557 5.34162 21.0557 5.65838 20.8329 5.76234L19.9935 6.15409C19.6238 6.32664 19.3266 6.62381 19.1541 6.99353L18.7623 7.83293C18.6584 8.05569 18.3416 8.05569 18.2377 7.83293L17.8459 6.99353C17.6734 6.62381 17.3762 6.32664 17.0065 6.15409L16.1671 5.76234C15.9443 5.65838 15.9443 5.34162 16.1671 5.23766L17.0065 4.84591C17.3762 4.67336 17.6734 4.37618 17.8459 4.00647L18.2377 3.16707Z" />
        <path d="M18.2377 14.1671C18.3416 13.9443 18.6584 13.9443 18.7623 14.1671L19.1541 15.0065C19.3266 15.3762 19.6238 15.6734 19.9935 15.8459L20.8329 16.2377C21.0557 16.3416 21.0557 16.6584 20.8329 16.7623L19.9935 17.1541C19.6238 17.3266 19.3266 17.6238 19.1541 17.9935L18.7623 18.8329C18.6584 19.0557 18.3416 19.0557 18.2377 18.8329L17.8459 17.9935C17.6734 17.6238 17.3762 17.3266 17.0065 17.1541L16.1671 16.7623C15.9443 16.6584 15.9443 16.3416 16.1671 16.2377L17.0065 15.8459C17.3762 15.6734 17.6734 15.3762 17.8459 15.0065L18.2377 14.1671Z" />
        <path d="M7.23766 3.16707C7.34162 2.94431 7.65838 2.94431 7.76234 3.16707L8.15409 4.00647C8.32664 4.37618 8.62381 4.67336 8.99353 4.84591L9.83293 5.23766C10.0557 5.34162 10.0557 5.65838 9.83293 5.76234L8.99353 6.15409C8.62381 6.32664 8.32664 6.62381 8.15409 6.99353L7.76234 7.83293C7.65838 8.05569 7.34162 8.05569 7.23766 7.83293L6.84591 6.99353C6.67336 6.62381 6.37618 6.32664 6.00647 6.15409L5.16707 5.76234C4.94431 5.65838 4.94431 5.34162 5.16707 5.23766L6.00647 4.84591C6.37618 4.67336 6.67336 4.37618 6.84591 4.00647L7.23766 3.16707Z" />
    </svg>
);

// Replay Icon Component
const ReplayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.3884 3L17.3913 3.97574C17.8393 4.41165 18.0633 4.62961 17.9844 4.81481C17.9056 5 17.5888 5 16.9552 5H9.19422C5.22096 5 2 8.13401 2 12C2 13.4872 2.47668 14.8662 3.2895 16" />
        <path d="M7.61156 21L6.60875 20.0243C6.16074 19.5883 5.93673 19.3704 6.01557 19.1852C6.09441 19 6.4112 19 7.04478 19H14.8058C18.779 19 22 15.866 22 12C22 10.5128 21.5233 9.13383 20.7105 8" />
        <path d="M13 15L13 9.31633C13 9.05613 12.7178 8.90761 12.52 9.06373L11 10.2636" />
    </svg>
);

// Check Icon Component
const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.8606 5.39176C22.2875 6.49635 21.6888 7.2526 20.5301 7.99754C19.5951 8.5986 18.4039 9.24975 17.1417 10.363C15.9044 11.4543 14.6968 12.7687 13.6237 14.0625C12.5549 15.351 11.6465 16.586 11.0046 17.5005C10.5898 18.0914 10.011 18.9729 10.011 18.9729C9.60281 19.6187 8.86895 20.0096 8.08206 19.9998C7.295 19.99 6.57208 19.5812 6.18156 18.9251C5.18328 17.248 4.41296 16.5857 4.05891 16.3478C3.11158 15.7112 2 15.6171 2 14.1335C2 12.9554 2.99489 12.0003 4.22216 12.0003C5.08862 12.0323 5.89398 12.373 6.60756 12.8526C7.06369 13.1591 7.54689 13.5645 8.04948 14.0981C8.63934 13.2936 9.35016 12.3653 10.147 11.4047C11.3042 10.0097 12.6701 8.51309 14.1349 7.22116C15.5748 5.95115 17.2396 4.76235 19.0042 4.13381C20.1549 3.72397 21.4337 4.28718 21.8606 5.39176Z" />
    </svg>
);

// AI Bot Icon Component
const AIBotIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4V2" />
        <path d="M19 22C19 18.134 15.866 15 12 15C8.13401 15 5 18.134 5 22" />
        <path d="M9.5 7.5H9.50998M14.49 7.5H14.5" />
        <path d="M5.5 6.66667C5.5 6.04669 5.5 5.73669 5.56815 5.48236C5.75308 4.79218 6.29218 4.25308 6.98236 4.06815C7.23669 4 7.54669 4 8.16667 4H15.8333C16.4533 4 16.7633 4 17.0176 4.06815C17.7078 4.25308 18.2469 4.79218 18.4319 5.48236C18.5 5.73669 18.5 6.04669 18.5 6.66667C18.5 7.90663 18.5 8.52661 18.3637 9.03528C17.9938 10.4156 16.9156 11.4938 15.5353 11.8637C15.0266 12 14.4066 12 13.1667 12H10.8333C9.59337 12 8.97339 12 8.46472 11.8637C7.08436 11.4938 6.00617 10.4156 5.6363 9.03528C5.5 8.52661 5.5 7.90663 5.5 6.66667Z" />
    </svg>
);
import { Safari } from "@/components/ui/safari";

interface BentoCardProps {
    Icon?: React.ElementType;
    name: string;
    description: string;
    href?: string;
    cta?: string;
    className?: string;
    background?: React.ReactNode;
    children?: React.ReactNode;
    onCtaClick?: () => void;
}

export const BentoCard: React.FC<BentoCardProps> = ({
    Icon,
    name,
    description,
    href = "#",
    cta = "เรียนรู้เพิ่มเติม",
    className,
    background,
    children,
    onCtaClick,
}) => {
    const handleCtaClick = (e: React.MouseEvent) => {
        if (onCtaClick) {
            e.preventDefault();
            onCtaClick();
        }
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white",
                "hover:shadow-lg transition-all duration-500",
                className
            )}
        >
            <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
            />

            {/* Background Element */}
            <div className="absolute inset-0 overflow-hidden">
                {background}
            </div>

            {/* Icon at Top */}
            {Icon && (
                <div className="relative z-10 p-6 pb-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                        <Icon className="h-6 w-6 text-slate-800" />
                    </div>
                </div>
            )}

            {/* Spacer for background content */}
            <div className="flex-1" />

            {/* Content at Bottom */}
            <div className="relative z-10 p-6 pt-4">
                <h3 className="text-lg font-bold text-slate-950 tracking-tight">{name}</h3>
                <p className="max-w-lg text-slate-500 text-xs leading-relaxed mt-1">{description}</p>

                {/* CTA - Always visible */}
                <a
                    href={onCtaClick ? "#" : href}
                    onClick={handleCtaClick}
                    className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-slate-900 hover:text-slate-600 cursor-pointer transition-colors"
                >
                    {cta}
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>

            {children}
        </div>
    );
};

// Premium Food Demo Modal Component with Safari Browser
interface FoodDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FoodDemoModal: React.FC<FoodDemoModalProps> = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState<'idle' | 'scanning' | 'complete'>('idle');
    const [scanProgress, setScanProgress] = useState(0);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setPhase('idle');
            setScanProgress(0);
            const startTimer = setTimeout(() => {
                setPhase('scanning');
            }, 500);
            return () => clearTimeout(startTimer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (phase === 'scanning') {
            const interval = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setPhase('complete');
                        return 100;
                    }
                    return prev + 2;
                });
            }, 35);
            return () => clearInterval(interval);
        }
    }, [phase]);

    const handleReplay = () => {
        setPhase('idle');
        setScanProgress(0);
        setTimeout(() => setPhase('scanning'), 300);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />

            {/* Safari Browser Container */}
            <div
                className="relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-14 -right-4 z-50 w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-110"
                >
                    <X size={20} className="text-slate-900" />
                </button>

                {/* Safari Browser Frame */}
                <Safari url="app.vitawise.ai/food-analysis" className="shadow-2xl rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-white overflow-y-auto">
                        {/* Content Grid */}
                        <div className="grid lg:grid-cols-2 gap-6 p-6">

                            {/* Left: Food Image */}
                            <div className="relative">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <AIBotIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">AI วิเคราะห์อาหาร</h2>
                                        <p className="text-sm text-slate-400">ถ่ายรูปอาหาร รับผลวิเคราะห์ทันที</p>
                                    </div>
                                </div>

                                {/* Food Image Card */}
                                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                                    <img
                                        src="/images/tom-yum-noodles.png"
                                        alt="ก๋วยเตี๋ยวต้มยำ"
                                        className="w-full aspect-square object-cover"
                                        style={{
                                            filter: phase === 'scanning' ? 'brightness(0.9)' : 'brightness(1)',
                                            transition: 'filter 0.3s ease'
                                        }}
                                    />

                                    {/* Scanning Overlay */}
                                    {phase === 'scanning' && (
                                        <>
                                            <div
                                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                                                style={{
                                                    top: `${scanProgress}%`,
                                                    boxShadow: '0 0 30px 8px rgba(255, 255, 255, 0.6)',
                                                }}
                                            />
                                            <div className="absolute inset-6 pointer-events-none border-2 border-white/40 rounded-2xl" />
                                        </>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4">
                                        {phase === 'scanning' ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur rounded-full shadow-lg">
                                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm font-medium text-slate-700">กำลังวิเคราะห์... {scanProgress}%</span>
                                            </div>
                                        ) : phase === 'complete' ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-lg">
                                                <AIWandIcon className="w-5 h-5" />
                                                <span className="text-sm font-medium">วิเคราะห์เสร็จสิ้น!</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Results */}
                            <div className="flex flex-col justify-center">
                                {/* Food Info */}
                                <div className="mb-6">
                                    <h3 className="text-3xl font-bold text-slate-900 mb-1">ก๋วยเตี๋ยวต้มยำกุ้ง</h3>
                                    <p className="text-slate-400">1 ชาม · 350 กรัม</p>
                                </div>

                                {/* Calories */}
                                <div
                                    className="mb-5"
                                    style={{
                                        opacity: phase === 'complete' ? 1 : 0.2,
                                        transition: 'opacity 0.5s ease'
                                    }}
                                >
                                    <div className="text-5xl font-bold text-slate-900">485</div>
                                    <div className="text-lg text-slate-400">แคลอรี่</div>
                                </div>

                                {/* Macros Grid */}
                                <div
                                    className="grid grid-cols-3 gap-3 mb-5"
                                    style={{
                                        opacity: phase === 'complete' ? 1 : 0.2,
                                        transition: 'opacity 0.5s ease 0.2s'
                                    }}
                                >
                                    {[
                                        { label: 'โปรตีน', value: '28g', icon: '🥩', bg: 'bg-rose-50 border-rose-100' },
                                        { label: 'คาร์โบไฮเดรต', value: '52g', icon: '🍚', bg: 'bg-amber-50 border-amber-100' },
                                        { label: 'ไขมัน', value: '18g', icon: '🥑', bg: 'bg-emerald-50 border-emerald-100' },
                                    ].map((macro, idx) => (
                                        <div
                                            key={idx}
                                            className={`${macro.bg} border rounded-2xl p-4 text-center`}
                                            style={{
                                                transform: phase === 'complete' ? 'translateY(0)' : 'translateY(20px)',
                                                opacity: phase === 'complete' ? 1 : 0,
                                                transition: `all 0.5s ease ${idx * 100 + 300}ms`
                                            }}
                                        >
                                            <div className="text-2xl mb-2">{macro.icon}</div>
                                            <div className="text-xl font-bold text-slate-800">{macro.value}</div>
                                            <div className="text-xs text-slate-500">{macro.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Ingredients */}
                                <div
                                    className="mb-5"
                                    style={{
                                        opacity: phase === 'complete' ? 1 : 0.2,
                                        transition: 'opacity 0.5s ease 0.4s'
                                    }}
                                >
                                    <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">ส่วนประกอบที่พบ</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['กุ้ง', 'เส้นหมี่', 'เห็ด', 'มะนาว', 'พริก', 'น้ำซุป', 'ผักชี', 'ตะไคร้'].map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-full font-medium"
                                                style={{
                                                    transform: phase === 'complete' ? 'scale(1)' : 'scale(0.8)',
                                                    opacity: phase === 'complete' ? 1 : 0,
                                                    transition: `all 0.3s ease ${idx * 50 + 500}ms`
                                                }}
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleReplay}
                                        className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <ReplayIcon className="w-5 h-5" />
                                        ดูอีกครั้ง
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <CheckIcon className="w-5 h-5" />
                                        บันทึก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Safari>

                {/* Decorative Glow */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl" />
            </div >
        </div >
    );
};

// Health Dashboard Demo Modal Component
interface HealthDashboardDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Circular Progress Component
const CircularProgress: React.FC<{
    value: number;
    max: number;
    color: string;
    size?: number;
    strokeWidth?: number;
    icon: React.ReactNode;
    label: string;
    unit: string;
    delay?: number;
}> = ({ value, max, color, size = 100, strokeWidth = 8, icon, label, unit, delay = 0 }) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const [displayValue, setDisplayValue] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (animatedValue / max) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => {
            const duration = 1500;
            const steps = 60;
            const increment = value / steps;
            let current = 0;
            const interval = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setAnimatedValue(value);
                    setDisplayValue(value);
                    clearInterval(interval);
                } else {
                    setAnimatedValue(current);
                    setDisplayValue(Math.floor(current));
                }
            }, duration / steps);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background circle */}
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-100"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 ease-out"
                        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
                    />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="mb-0.5" style={{ color }}>{icon}</div>
                    <span className="text-lg font-bold text-gray-800">{displayValue}</span>
                </div>
            </div>
            <div className="text-center">
                <div className="text-xs font-medium text-gray-600">{label}</div>
                <div className="text-[10px] text-gray-400">{displayValue} / {max} {unit}</div>
            </div>
        </div>
    );
};

export const HealthDashboardDemoModal: React.FC<HealthDashboardDemoModalProps> = ({ isOpen, onClose }) => {
    const [healthScore, setHealthScore] = useState(0);
    const [showRecommendation, setShowRecommendation] = useState(false);

    // Demo data
    const healthData = {
        calories: { value: 1650, max: 2000 },
        exercise: { value: 45, max: 60 },
        sleep: { value: 7.5, max: 8 },
        water: { value: 1.8, max: 2 },
    };

    const targetScore = 83;

    useEffect(() => {
        if (isOpen) {
            setHealthScore(0);
            setShowRecommendation(false);

            // Animate health score
            setTimeout(() => {
                const duration = 2000;
                const steps = 60;
                const increment = targetScore / steps;
                let current = 0;
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= targetScore) {
                        setHealthScore(targetScore);
                        clearInterval(interval);
                    } else {
                        setHealthScore(Math.floor(current));
                    }
                }, duration / steps);
            }, 800);

            // Show recommendation after animations
            setTimeout(() => setShowRecommendation(true), 2500);
        }
    }, [isOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'ยอดเยี่ยม!';
        if (score >= 60) return 'ดีมาก';
        return 'พยายามต่อไป';
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Minimal */}
                <div className="relative px-5 pt-5 pb-6 bg-slate-900">
                    {/* Close button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>

                    {/* Header content */}
                    <div className="text-center text-white">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-medium tracking-wider uppercase mb-3">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                            Demo
                        </span>
                        <h2 className="text-lg font-semibold mb-0.5">สรุปสุขภาพวันนี้</h2>
                        <p className="text-xs text-white/50">27 ธันวาคม 2567</p>
                    </div>
                </div>

                {/* Health Score Card */}
                <div className="relative -mt-4 mx-4">
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Health Score</div>
                                <div className="flex items-baseline gap-0.5">
                                    <span className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
                                        {healthScore}
                                    </span>
                                    <span className="text-slate-300 text-sm font-medium">/100</span>
                                </div>
                            </div>
                            <div className={`text-right transition-all duration-500 ${showRecommendation ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                                <div className={`text-sm font-semibold ${getScoreColor(healthScore)}`}>
                                    {getScoreLabel(healthScore)}
                                </div>
                                <div className="text-[10px] text-slate-400">เกือบครบเป้าหมาย</div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${healthScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Minimal */}
                <div className="px-4 py-5">
                    <div className="grid grid-cols-4 gap-3">
                        <CircularProgress
                            value={healthData.calories.value}
                            max={healthData.calories.max}
                            color="#10b981"
                            size={64}
                            strokeWidth={5}
                            icon={<span className="text-sm">🔥</span>}
                            label="แคลอรี่"
                            unit="kcal"
                            delay={200}
                        />
                        <CircularProgress
                            value={healthData.exercise.value}
                            max={healthData.exercise.max}
                            color="#10b981"
                            size={64}
                            strokeWidth={5}
                            icon={<span className="text-sm">🏃</span>}
                            label="ออกกำลังกาย"
                            unit="นาที"
                            delay={400}
                        />
                        <CircularProgress
                            value={healthData.sleep.value}
                            max={healthData.sleep.max}
                            color="#10b981"
                            size={64}
                            strokeWidth={5}
                            icon={<span className="text-sm">💤</span>}
                            label="การนอน"
                            unit="ชม."
                            delay={600}
                        />
                        <CircularProgress
                            value={healthData.water.value}
                            max={healthData.water.max}
                            color="#10b981"
                            size={64}
                            strokeWidth={5}
                            icon={<span className="text-sm">💧</span>}
                            label="น้ำดื่ม"
                            unit="ลิตร"
                            delay={800}
                        />
                    </div>
                </div>

                {/* AI Recommendation - Minimal */}
                <div className={`px-4 pb-4 transition-all duration-500 ${showRecommendation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="bg-slate-50 rounded-xl p-3.5">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Insight</div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    ออกกำลังกายอีก 15 นาที และดื่มน้ำอีก 200ml จะครบเป้าหมาย
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-4">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400">
                            ⚡ นี่คือตัวอย่างการแสดงผล · ข้อมูลจริงจะอัปเดตอัตโนมัติ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// History Demo Modal Component
interface HistoryDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Demo data for different days
const historyData: Record<number, { calories: number; exercise: number; sleep: number; water: number; score: number }> = {
    22: { calories: 1920, exercise: 30, sleep: 7, water: 1.5, score: 72 },
    23: { calories: 2100, exercise: 0, sleep: 6.5, water: 1.2, score: 58 },
    24: { calories: 2400, exercise: 45, sleep: 8, water: 2.0, score: 85 },
    25: { calories: 2800, exercise: 0, sleep: 7.5, water: 1.8, score: 62 },
    26: { calories: 1750, exercise: 60, sleep: 8, water: 2.2, score: 92 },
    27: { calories: 1650, exercise: 45, sleep: 7.5, water: 1.8, score: 83 },
    28: { calories: 1200, exercise: 30, sleep: 0, water: 0.8, score: 45 },
};

export const HistoryDemoModal: React.FC<HistoryDemoModalProps> = ({ isOpen, onClose }) => {
    const [selectedDay, setSelectedDay] = useState(27);
    const [animatedScore, setAnimatedScore] = useState(0);

    const currentData = historyData[selectedDay] || historyData[27];

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setSelectedDay(27);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Animate score on day change
    useEffect(() => {
        if (!isOpen) return;
        setAnimatedScore(0);
        const timer = setTimeout(() => {
            const duration = 800;
            const steps = 30;
            const increment = currentData.score / steps;
            let current = 0;
            const interval = setInterval(() => {
                current += increment;
                if (current >= currentData.score) {
                    setAnimatedScore(currentData.score);
                    clearInterval(interval);
                } else {
                    setAnimatedScore(Math.floor(current));
                }
            }, duration / steps);
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedDay, isOpen, currentData.score]);

    if (!isOpen) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getStatusIcon = (value: number, target: number) => {
        const percent = (value / target) * 100;
        if (percent >= 90) return { icon: '✅', color: 'text-emerald-500' };
        if (percent >= 70) return { icon: '⚠️', color: 'text-amber-500' };
        return { icon: '❌', color: 'text-red-500' };
    };

    const days = [22, 23, 24, 25, 26, 27, 28];
    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative px-5 pt-5 pb-4 bg-slate-900">
                    {/* Close button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>

                    {/* Header content */}
                    <div className="text-center text-white">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-medium tracking-wider uppercase mb-3">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                            Demo
                        </span>
                        <h2 className="text-lg font-semibold mb-0.5">ประวัติสุขภาพ</h2>
                        <p className="text-xs text-white/50">ธันวาคม 2567</p>
                    </div>
                </div>

                {/* Mini Calendar */}
                <div className="px-4 py-4 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                        {dayNames.map((name, i) => (
                            <div key={i} className="w-10 text-center text-[10px] text-slate-400 font-medium">
                                {name}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center">
                        {days.map((day) => {
                            const dayData = historyData[day];
                            const isSelected = day === selectedDay;
                            const isToday = day === 27;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={cn(
                                        "relative w-10 h-10 rounded-xl text-sm font-medium transition-all",
                                        isSelected
                                            ? "bg-slate-900 text-white shadow-lg"
                                            : "text-slate-700 hover:bg-slate-100",
                                        isToday && !isSelected && "ring-2 ring-emerald-400 ring-offset-1"
                                    )}
                                >
                                    {day}
                                    {/* Score indicator */}
                                    {dayData && !isSelected && (
                                        <div className={cn(
                                            "absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                                            getScoreBg(dayData.score)
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Summary */}
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">วันที่ {selectedDay} ธ.ค.</div>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className={cn("text-2xl font-bold", getScoreColor(animatedScore))}>
                                    {animatedScore}
                                </span>
                                <span className="text-slate-300 text-sm">/100</span>
                            </div>
                        </div>
                        <div className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                            currentData.score >= 80 ? "bg-emerald-50 text-emerald-600" :
                                currentData.score >= 60 ? "bg-amber-50 text-amber-600" :
                                    "bg-red-50 text-red-600"
                        )}>
                            {currentData.score >= 80 ? 'ยอดเยี่ยม' : currentData.score >= 60 ? 'ดี' : 'ควรปรับปรุง'}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                        {[
                            { icon: '🔥', label: 'แคลอรี่', value: currentData.calories, target: 2000, unit: 'kcal' },
                            { icon: '🏃', label: 'ออกกำลังกาย', value: currentData.exercise, target: 60, unit: 'นาที' },
                            { icon: '💤', label: 'การนอน', value: currentData.sleep, target: 8, unit: 'ชม.' },
                            { icon: '💧', label: 'น้ำดื่ม', value: currentData.water, target: 2, unit: 'ลิตร' },
                        ].map((stat) => {
                            const status = getStatusIcon(stat.value, stat.target);
                            const percent = Math.min((stat.value / stat.target) * 100, 100);
                            return (
                                <div key={stat.label} className="flex items-center gap-3">
                                    <span className="text-lg">{stat.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-600">{stat.label}</span>
                                            <span className="text-xs text-slate-400">
                                                {stat.value} / {stat.target} {stat.unit}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    percent >= 90 ? "bg-emerald-400" :
                                                        percent >= 70 ? "bg-amber-400" : "bg-red-400"
                                                )}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm">{status.icon}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-4">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400">
                            ⚡ กดเลือกวันเพื่อดูข้อมูลย้อนหลัง
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// AI Chat Demo Modal Component
interface AIChatDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    text: string;
    image?: string;
}

// Simple quick suggestions
const quickSuggestions = [
    'วันนี้กินไปเท่าไหร่',
    'แนะนำอาหารเย็น',
    'ดื่มน้ำเท่าไหร่แล้ว',
    'เมื่อคืนนอนกี่ชม.',
];

// AI Response logic
const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('แคลอรี่') || q.includes('กิน') || q.includes('เท่าไหร่')) {
        return 'วันนี้กินไป 1,850 kcal จากเป้าหมาย 2,000 kcal เหลืออีก 150 kcal ครับ';
    }
    if (q.includes('ออกกำลังกาย') || q.includes('เผาผลาญ')) {
        return 'วันนี้ออกกำลังกายไป 45 นาที เผาผลาญได้ 320 kcal ครับ';
    }
    if (q.includes('น้ำ') || q.includes('ดื่ม')) {
        return 'วันนี้ดื่มน้ำไป 1.8 ลิตร จากเป้าหมาย 2.5 ลิตร อย่าลืมดื่มเพิ่มอีกนะครับ';
    }
    if (q.includes('นอน') || q.includes('หลับ') || q.includes('ชม')) {
        return 'เมื่อคืนนอน 7.5 ชั่วโมง คุณภาพการนอนดีครับ';
    }
    if (q.includes('แนะนำ') || q.includes('อาหาร')) {
        return 'แนะนำอาหารเย็น: สลัดอกไก่ (~300 kcal) หรือปลานึ่ง + ผักต้ม (~250 kcal) ครับ';
    }
    if (q.includes('โปรตีน')) {
        return 'วันนี้ได้โปรตีน 65g จากเป้า 120g แนะนำเพิ่มไข่ต้ม 2 ฟอง หรืออกไก่ 100g ครับ';
    }
    return 'ผมช่วยติดตามแคลอรี่, ออกกำลังกาย, น้ำดื่ม และการนอนได้นะครับ ลองถามได้เลย!';
};

export const AIChatDemoModal: React.FC<AIChatDemoModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '0', type: 'ai', text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ? ลองส่งรูปอาหารมาให้วิเคราะห์ได้นะครับ 📸' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [currentAIMessageId, setCurrentAIMessageId] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Demo food analysis results with tips
    const demoFoodAnalysis = [
        { name: 'ข้าวผัดกระเพรา', calories: 520, protein: 25, carbs: 58, fat: 22, tip: 'โซเดียมสูง ดื่มน้ำให้เพียงพอนะครับ' },
        { name: 'ส้มตำไทย', calories: 180, protein: 5, carbs: 28, fat: 8, tip: 'ดีต่อระบบย่อยอาหาร แต่ระวังความเผ็ดครับ' },
        { name: 'ต้มยำกุ้ง', calories: 285, protein: 22, carbs: 18, fat: 15, tip: 'โปรตีนสูง เหมาะกับคนออกกำลังกายครับ' },
        { name: 'ผัดไทย', calories: 450, protein: 18, carbs: 52, fat: 20, tip: 'คาร์บสูง เหมาะทานก่อนออกกำลังกายครับ' },
        { name: 'ข้าวมันไก่', calories: 580, protein: 28, carbs: 65, fat: 20, tip: 'โปรตีนดี แต่ไขมันสูง ทานแต่พอดีนะครับ' },
        { name: 'แกงเขียวหวาน', calories: 420, protein: 20, carbs: 35, fat: 25, tip: 'กะทิเยอะ ระวังไขมันอิ่มตัวครับ' },
        { name: 'ข้าวผัดหมู', calories: 480, protein: 22, carbs: 55, fat: 18, tip: 'สมดุลพอดี แนะนำเพิ่มผักด้วยครับ' },
        { name: 'ก๋วยเตี๋ยวน้ำใส', calories: 320, protein: 18, carbs: 42, fat: 10, tip: 'แคลอรี่ไม่สูง เหมาะกับมื้อกลางวันครับ' },
    ];

    // Not food responses (random)
    const notFoodResponses = [
        '😅 อุ๊ปส์! ดูเหมือนรูปนี้ไม่ใช่อาหารนะครับ ลองถ่ายรูปอาหารใหม่อีกครั้งได้เลยครับ 📸',
        '🤔 หืม... ผมมองไม่ชัดว่าเป็นอาหารอะไรเลยครับ ลองถ่ายให้ชัดขึ้นหรือเปลี่ยนมุมดูนะครับ',
        '🍽️ ดูเหมือนนี่ไม่ใช่อาหารนะครับ ผมวิเคราะห์ได้เฉพาะรูปอาหาร ลองส่งมาใหม่ได้เลย!',
        '📷 รูปนี้ไม่ชัดพอครับ หรืออาจไม่ใช่อาหาร ลองถ่ายใกล้ๆ อาหารอีกครั้งนะครับ',
    ];

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMessages([
                { id: '0', type: 'ai', text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ? ลองส่งรูปอาหารมาให้วิเคราะห์ได้นะครับ 📸' }
            ]);
            setInputValue('');
            setIsTyping(false);
            setDisplayedText('');
            setCurrentAIMessageId(null);
        }
    }, [isOpen]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Typewriter effect
    useEffect(() => {
        if (!currentAIMessageId) return;

        const currentMessage = messages.find(m => m.id === currentAIMessageId);
        if (!currentMessage || currentMessage.type !== 'ai') return;

        const fullText = currentMessage.text;
        if (displayedText.length < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(fullText.slice(0, displayedText.length + 1));
            }, 18);
            return () => clearTimeout(timeout);
        } else {
            setIsTyping(false);
            setCurrentAIMessageId(null);
        }
    }, [displayedText, currentAIMessageId, messages]);

    // Auto-scroll
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, displayedText]);

    const sendMessage = (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: text.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Keep focus on input
        inputRef.current?.focus();

        setTimeout(() => {
            const aiResponse = getAIResponse(text);
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: aiResponse
            };
            setMessages(prev => [...prev, aiMessage]);
            setDisplayedText('');
            setCurrentAIMessageId(aiMessage.id);

            // Refocus input after AI responds
            setTimeout(() => inputRef.current?.focus(), 50);
        }, 600);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || isTyping) return;

        // Read image as base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            setUploadedImage(imageUrl);

            // Add user message with image
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'user',
                text: '📷 ส่งรูปอาหาร',
                image: imageUrl
            };
            setMessages(prev => [...prev, userMessage]);
            setIsAnalyzing(true);
            setIsTyping(true);

            // Simulate AI analysis with 85% food / 15% not food
            setTimeout(() => {
                setIsAnalyzing(false);

                const isFood = Math.random() < 0.85; // 85% chance it's food
                let aiResponse: string;

                if (isFood) {
                    // Food detected
                    const randomFood = demoFoodAnalysis[Math.floor(Math.random() * demoFoodAnalysis.length)];
                    const confidence = Math.floor(Math.random() * 11) + 88; // 88-98%

                    aiResponse = `🍽️ วิเคราะห์แล้วครับ! (มั่นใจ ${confidence}%)\n\n📌 อาหาร: ${randomFood.name}\n🔥 แคลอรี่: ${randomFood.calories} kcal\n🥩 โปรตีน: ${randomFood.protein}g\n🍚 คาร์โบไฮเดรต: ${randomFood.carbs}g\n🥑 ไขมัน: ${randomFood.fat}g\n\n💡 ${randomFood.tip}\n\n✅ บันทึกลงระบบเรียบร้อยครับ`;
                } else {
                    // Not food detected
                    aiResponse = notFoodResponses[Math.floor(Math.random() * notFoodResponses.length)];
                }

                const aiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    text: aiResponse
                };
                setMessages(prev => [...prev, aiMessage]);
                setDisplayedText('');
                setCurrentAIMessageId(aiMessage.id);
            }, 2000);
        };
        reader.readAsDataURL(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const resetChat = () => {
        setMessages([
            { id: '0', type: 'ai', text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ? ลองส่งรูปอาหารมาให้วิเคราะห์ได้นะครับ 📸' }
        ]);
        setInputValue('');
        setIsTyping(false);
        setDisplayedText('');
        setCurrentAIMessageId(null);
        setUploadedImage(null);
        setIsAnalyzing(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

            {/* Chat Container */}
            <div
                className="relative w-full sm:w-[400px] sm:max-w-[95vw] animate-in slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main Chat Window */}
                <div className="bg-white sm:rounded-2xl overflow-hidden shadow-2xl">

                    {/* Header - Minimal */}
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center shadow-md">
                            {/* Activity/Heartbeat icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-6 h-6">
                                <path d="M85 50h-12a4 4 0 0 0-3.8 2.8L61 76a1 1 0 0 1-1.9 0L39 24a1 1 0 0 0-1.9 0l-8 23.2A4 4 0 0 1 25 50H15"
                                    stroke="white"
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-[15px] text-gray-900">Vita Wise</div>
                        </div>
                        {messages.length > 1 && (
                            <button
                                onClick={resetChat}
                                className="text-[13px] text-red-500 hover:text-red-600 font-medium transition-colors"
                            >
                                ล้าง
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="bg-gray-200 text-gray-600 p-1.5 rounded-md transition-all duration-300 hover:!bg-red-500 hover:!text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={chatContainerRef}
                        className="h-[55vh] sm:h-[420px] overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50"
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-2.5",
                                    msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                                )}
                            >
                                {/* Avatar */}
                                {msg.type === 'ai' ? (
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 via-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 ring-2 ring-white">
                                            {/* Cute Robot Icon */}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 15.5C2.89543 15.5 2 14.6046 2 13.5C2 12.3954 2.89543 11.5 4 11.5" />
                                                <path d="M20 15.5C21.1046 15.5 22 14.6046 22 13.5C22 12.3954 21.1046 11.5 20 11.5" />
                                                <path d="M7 7L7 4" />
                                                <path d="M17 7L17 4" />
                                                <circle cx="7" cy="3" r="1" />
                                                <circle cx="17" cy="3" r="1" />
                                                <path d="M13.5 7H10.5C7.67157 7 6.25736 7 5.37868 7.90898C4.5 8.81796 4.5 10.2809 4.5 13.2069C4.5 16.1329 4.5 17.5958 5.37868 18.5048C6.25736 19.4138 7.67157 19.4138 10.5 19.4138H11.5253C12.3169 19.4138 12.5962 19.5773 13.1417 20.1713C13.745 20.8283 14.6791 21.705 15.5242 21.9091C16.7254 22.1994 16.8599 21.7979 16.5919 20.6531C16.5156 20.327 16.3252 19.8056 16.526 19.5018C16.6385 19.3316 16.8259 19.2898 17.2008 19.2061C17.7922 19.074 18.2798 18.8581 18.6213 18.5048C19.5 17.5958 19.5 16.1329 19.5 13.2069C19.5 10.2809 19.5 8.81796 18.6213 7.90898C17.7426 7 16.3284 7 13.5 7Z" />
                                                <path d="M9.5 15C10.0701 15.6072 10.9777 16 12 16C13.0223 16 13.9299 15.6072 14.5 15" />
                                                <path d="M9.00896 11H9" />
                                                <path d="M15.009 11H15" />
                                            </svg>
                                            {/* Sparkle */}
                                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full shadow-sm flex items-center justify-center">
                                                <div className="w-1 h-1 bg-yellow-200 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md ring-2 ring-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/90" fill="currentColor">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                {/* Message Content */}
                                <div className={cn(
                                    "flex flex-col",
                                    msg.type === 'user' ? 'items-end' : 'items-start'
                                )}>
                                    {/* Name Label */}
                                    <span className={cn(
                                        "text-[11px] font-medium mb-1 px-1",
                                        msg.type === 'ai' ? "text-emerald-600" : "text-slate-500"
                                    )}>
                                        {msg.type === 'ai' ? 'วีต้า' : 'คุณ'}
                                    </span>

                                    {/* Image Preview */}
                                    {msg.image && (
                                        <div className="mb-2 rounded-xl overflow-hidden shadow-md border-2 border-white">
                                            <img
                                                src={msg.image}
                                                alt="Uploaded food"
                                                className="w-40 h-40 object-cover"
                                            />
                                        </div>
                                    )}

                                    <div
                                        className={cn(
                                            "max-w-[280px] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-line",
                                            msg.type === 'user'
                                                ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl rounded-tr-md shadow-md"
                                                : "bg-white text-gray-800 rounded-2xl rounded-tl-md shadow-sm border border-slate-100"
                                        )}
                                    >
                                        {msg.id === currentAIMessageId ? displayedText : msg.text}
                                        {msg.id === currentAIMessageId && displayedText.length < msg.text.length && (
                                            <span className="inline-block w-[2px] h-4 bg-emerald-400 ml-0.5 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing/Analyzing Indicator */}
                        {isTyping && !currentAIMessageId && (
                            <div className="flex gap-2.5">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 via-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 ring-2 ring-white">
                                        {/* Cute Robot Icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 15.5C2.89543 15.5 2 14.6046 2 13.5C2 12.3954 2.89543 11.5 4 11.5" />
                                            <path d="M20 15.5C21.1046 15.5 22 14.6046 22 13.5C22 12.3954 21.1046 11.5 20 11.5" />
                                            <path d="M7 7L7 4" />
                                            <path d="M17 7L17 4" />
                                            <circle cx="7" cy="3" r="1" />
                                            <circle cx="17" cy="3" r="1" />
                                            <path d="M13.5 7H10.5C7.67157 7 6.25736 7 5.37868 7.90898C4.5 8.81796 4.5 10.2809 4.5 13.2069C4.5 16.1329 4.5 17.5958 5.37868 18.5048C6.25736 19.4138 7.67157 19.4138 10.5 19.4138H11.5253C12.3169 19.4138 12.5962 19.5773 13.1417 20.1713C13.745 20.8283 14.6791 21.705 15.5242 21.9091C16.7254 22.1994 16.8599 21.7979 16.5919 20.6531C16.5156 20.327 16.3252 19.8056 16.526 19.5018C16.6385 19.3316 16.8259 19.2898 17.2008 19.2061C17.7922 19.074 18.2798 18.8581 18.6213 18.5048C19.5 17.5958 19.5 16.1329 19.5 13.2069C19.5 10.2809 19.5 8.81796 18.6213 7.90898C17.7426 7 16.3284 7 13.5 7Z" />
                                            <path d="M9.5 15C10.0701 15.6072 10.9777 16 12 16C13.0223 16 13.9299 15.6072 14.5 15" />
                                            <path d="M9.00896 11H9" />
                                            <path d="M15.009 11H15" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[11px] font-medium mb-1 px-1 text-emerald-600">วีต้า</span>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            {isAnalyzing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-sm text-gray-500">กำลังวิเคราะห์รูปอาหาร...</span>
                                                </>
                                            ) : (
                                                <div className="flex gap-1">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length <= 1 && !isTyping && (
                        <div className="px-4 pb-3 bg-gray-50/50">
                            <div className="flex flex-wrap gap-2">
                                {quickSuggestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(q)}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area - Minimal */}
                    <div className="p-3 border-t border-gray-100">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                            {/* Image Upload Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isTyping}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border",
                                    isTyping
                                        ? "bg-gray-50 border-gray-200 text-gray-300"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-95"
                                )}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 7L7.89443 5.21114C8.43234 4.13531 8.7013 3.5974 9.18461 3.2987C9.66791 3 10.2693 3 11.4721 3H12.5279C13.7307 3 14.3321 3 14.8154 3.2987C15.2987 3.5974 15.5677 4.13531 16.1056 5.21115L17 7C18.8692 7 19.8038 7 20.5 7.40192C20.9561 7.66523 21.3348 8.04394 21.5981 8.5C22 9.19615 22 10.1308 22 12V15C22 17.8284 22 19.2426 21.1213 20.1213C20.2426 21 18.8284 21 16 21H8C5.17157 21 3.75736 21 2.87868 20.1213C2 19.2426 2 17.8284 2 15V12C2 10.1308 2 9.19615 2.40192 8.5C2.66523 8.04394 3.04394 7.66523 3.5 7.40192C4.19615 7 5.13077 7 7 7ZM7 7H12" />
                                    <path d="M15.5 14C15.5 15.933 13.933 17.5 12 17.5C10.067 17.5 8.5 15.933 8.5 14C8.5 12.067 10.067 10.5 12 10.5C13.933 10.5 15.5 12.067 15.5 14Z" />
                                    <path d="M19 10V10.01" />
                                </svg>
                            </button>

                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="พิมพ์ข้อความ หรือส่งรูปอาหาร..."
                                disabled={isTyping}
                                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isTyping || !inputValue.trim()}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border",
                                    isTyping || !inputValue.trim()
                                        ? "bg-gray-50 border-gray-200 text-gray-300"
                                        : "bg-gray-900 border-gray-900 text-white hover:bg-gray-800 hover:border-gray-800 active:scale-95"
                                )}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9.49811 15L16.9981 7.5" />
                                    <path d="M8.00634 7.67888L15.327 4.21881C18.3688 2.78111 19.8897 2.06226 20.8598 2.78341C21.8299 3.50455 21.5527 5.14799 20.9984 8.43486L20.0435 14.0968C19.6811 16.246 19.4998 17.3205 18.6989 17.7891C17.8979 18.2577 16.8574 17.8978 14.7765 17.178L8.41077 14.9762C4.51917 13.6301 2.57337 12.9571 2.50019 11.6365C2.427 10.3159 4.28678 9.43692 8.00634 7.67888Z" />
                                    <path d="M9.49811 15.5V17.7274C9.49811 20.101 9.49811 21.2878 10.2083 21.4771C10.9185 21.6663 11.6664 20.6789 13.1622 18.7039L13.9981 17.5" />
                                </svg>
                            </button>
                        </form>

                        {/* Demo Notice */}
                        <div className="mt-2 text-center">
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                ⚡ นี่คือตัวอย่างการทำงาน ไม่ใช่ AI จริง · ระบบจริงจะตอบได้หลากหลายกว่านี้
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface BentoGridProps {
    children?: React.ReactNode;
    className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                "grid gap-4 lg:gap-6",
                "grid-cols-1 md:grid-cols-3",
                className
            )}
        >
            {children}
        </div>
    );
};

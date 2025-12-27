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

// AI Chat Demo Modal Component
interface AIChatDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    text: string;
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
        { id: '0', type: 'ai', text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [currentAIMessageId, setCurrentAIMessageId] = useState<string | null>(null);
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMessages([
                { id: '0', type: 'ai', text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?' }
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

    const resetChat = () => {
        setMessages([
            { id: '0', type: 'ai', text: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?' }
        ]);
        setInputValue('');
        setIsTyping(false);
        setDisplayedText('');
        setCurrentAIMessageId(null);
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
                        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                            <span className="text-white text-sm font-medium">V</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-[15px] text-gray-900">Vita Wise</div>
                        </div>
                        {messages.length > 1 && (
                            <button
                                onClick={resetChat}
                                className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ล้าง
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                                    "flex",
                                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] px-4 py-2.5 text-[15px] leading-relaxed",
                                        msg.type === 'user'
                                            ? "bg-gray-900 text-white rounded-2xl rounded-br-md"
                                            : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                                    )}
                                >
                                    {msg.id === currentAIMessageId ? displayedText : msg.text}
                                    {msg.id === currentAIMessageId && displayedText.length < msg.text.length && (
                                        <span className="inline-block w-[2px] h-4 bg-gray-400 ml-0.5 animate-pulse" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && !currentAIMessageId && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="พิมพ์ข้อความ..."
                                disabled={isTyping}
                                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isTyping || !inputValue.trim()}
                                className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                    isTyping || !inputValue.trim()
                                        ? "bg-gray-100 text-gray-400"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                )}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </button>
                        </form>
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

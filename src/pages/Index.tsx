import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Activity,
    ArrowRight,
    Brain,
    Calendar as CalendarIcon,
    Camera,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Dumbbell,
    Droplets,
    FileTextIcon,
    Flame,
    Globe,
    Heart,
    Key,
    LineChart,
    Lock,
    Moon,
    Server,
    Share2Icon,
    ShieldCheck,
    Smartphone,
    BellIcon,
    Target,
    UtensilsCrossed,
    Watch,
    Zap
} from "lucide-react";
import { tokenUtils } from "@/lib/utils";
import LaserFlow from "../components/LaserFlow";
import GradualBlur from "../components/GradualBlur";
import SpotlightCard from "@/components/SpotlightCard";
import MagicBento from "@/components/MagicBento";
import { Cover } from "@/components/ui/cover";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Send, Sparkles } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Calendar } from "@/components/ui/calendar";
import { BorderBeam } from "@/components/ui/border-beam";
import { Marquee } from "@/components/ui/marquee";
import { BentoCard, BentoGrid, FoodDemoModal, AIChatDemoModal } from "@/components/BentoBadge";
import { Footer } from "@/components/footer";
import { CallToAction } from "@/components/cta";
import { cn } from "@/lib/utils";
import { LinearGridBackground } from "@/components/ui/linear-grid-background";

// --- Types ---
interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    text: string;
    isTyping?: boolean;
}

// --- Pre-defined AI Responses ---
const AI_RESPONSES: Record<string, string> = {
    // Calorie related
    'แคลอรี่': 'วันนี้คุณกินไป 1,650 kcal จากเป้าหมาย 2,000 kcal ยังเหลืออีก 350 kcal ครับ 🎯 แนะนำให้กินโปรตีนเพิ่มเพื่อให้อิ่มนานขึ้น',
    'กินไปเท่าไหร่': 'วันนี้คุณกินไป 1,650 kcal จากเป้าหมาย 2,000 kcal ยังเหลืออีก 350 kcal ครับ 🎯',
    // Food recommendations
    'แนะนำอาหาร': 'แนะนำ: ไข่ต้ม 2 ฟอง (~140 kcal, โปรตีน 12g) หรือสลัดอกไก่ (~200 kcal) อิ่มท้องและโปรตีนสูงครับ 🥗',
    'อาหารเย็น': 'มื้อเย็นแนะนำ: ปลานึ่งมะนาว + ผักต้ม (~300 kcal) หรือข้าวกล้อง + ไก่ย่าง (~400 kcal) ครับ 🍽️',
    'กินอะไรดี': 'ดูจากเป้าหมายของคุณ แนะนำอาหารโปรตีนสูง เช่น อกไก่ย่าง, ปลาแซลมอน, หรือเต้าหู้ผัดผัก ครับ 💪',
    // Exercise
    'ออกกำลังกาย': 'วันนี้คุณยังไม่ได้ออกกำลังกาย ลองวิ่งเบาๆ 30 นาที (~250 kcal) หรือเดินเร็ว 1 ชม. (~200 kcal) ครับ 🏃',
    'วิ่ง': 'การวิ่ง 30 นาที เผาผลาญประมาณ 250-350 kcal ขึ้นกับความเร็ว แนะนำเริ่มจาก Jogging ก่อนครับ 🏃‍♂️',
    // Health
    'สุขภาพ': 'สัปดาห์นี้คุณทำได้ดีมาก! กินอาหารตามเป้า 5/7 วัน, ออกกำลังกาย 3 ครั้ง, ดื่มน้ำเฉลี่ย 2.1 ลิตร/วัน 🌟',
    'น้ำหนัก': 'น้ำหนักปัจจุบัน 68 kg ลดลง 0.5 kg จากสัปดาห์ที่แล้ว กำลังไปได้ดีครับ! เป้าหมาย 65 kg เหลืออีก 3 kg 📉',
    // Water
    'น้ำ': 'วันนี้ดื่มน้ำไป 1.5 ลิตร จากเป้าหมาย 2.5 ลิตร ยังเหลืออีก 1 ลิตร ดื่มเพิ่มนะครับ 💧',
    // Sleep
    'นอน': 'เมื่อคืนนอน 6.5 ชม. แนะนำให้นอนเพิ่มเป็น 7-8 ชม. เพื่อการฟื้นตัวที่ดีและควบคุมน้ำหนักได้ดีขึ้นครับ 😴',
    // Default
    'default': 'ผมพร้อมช่วยเรื่องสุขภาพของคุณครับ! ลองถามเกี่ยวกับแคลอรี่, อาหาร, ออกกำลังกาย, น้ำหนัก หรือการนอนได้เลย 🤖✨'
};

const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
        if (keyword !== 'default' && lowerMessage.includes(keyword)) {
            return response;
        }
    }
    return AI_RESPONSES['default'];
};

// --- Interactive AI Chat Card Component ---
const InteractiveAIChatCard = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', type: 'user', text: 'วันนี้กินแคลอรี่ไปเท่าไหร่แล้ว?' },
        { id: '2', type: 'ai', text: 'วันนี้กินไป 1,850 kcal จากเป้าหมาย 2,000 kcal ยังเหลืออีก 150 kcal ครับ 🎯' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [currentAIMessageId, setCurrentAIMessageId] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);

    // Track mouse position for glow effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        const card = cardRef.current;
        if (card) {
            card.addEventListener('mousemove', handleMouseMove);
            return () => card.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (!currentAIMessageId) return;

        const currentMessage = messages.find(m => m.id === currentAIMessageId);
        if (!currentMessage || currentMessage.type !== 'ai') return;

        const fullText = currentMessage.text;
        if (displayedText.length < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(fullText.slice(0, displayedText.length + 1));
            }, 20); // Speed of typing
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: inputValue.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const aiResponse = getAIResponse(userMessage.text);
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: aiResponse
            };
            setMessages(prev => [...prev, aiMessage]);
            setDisplayedText('');
            setCurrentAIMessageId(aiMessage.id);
        }, 600);
    };

    const handleQuickQuestion = (question: string) => {
        if (isTyping) return;
        setInputValue(question);
        // Auto submit
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: question
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        setTimeout(() => {
            const aiResponse = getAIResponse(question);
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: aiResponse
            };
            setMessages(prev => [...prev, aiMessage]);
            setDisplayedText('');
            setCurrentAIMessageId(aiMessage.id);
            setInputValue('');
        }, 600);
    };

    return (
        <li className="h-[550px] md:h-full md:max-h-[1000px] list-none md:[grid-area:1/8/3/13]">
            <div
                ref={cardRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative h-full rounded-2xl border border-slate-300 p-2 md:rounded-3xl md:p-3 bg-white overflow-hidden group"
            >
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 rounded-2xl md:rounded-3xl animate-spin-slow bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animationDuration: '8s' }} />
                    </div>
                </div>

                {/* Interactive Glow Effect Following Cursor */}
                {isHovered && (
                    <div
                        className="absolute w-64 h-64 rounded-full pointer-events-none transition-opacity duration-300"
                        style={{
                            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
                            left: `${mousePosition.x}px`,
                            top: `${mousePosition.y}px`,
                            transform: 'translate(-50%, -50%)',
                            filter: 'blur(40px)',
                        }}
                    />
                )}

                {/* Floating Particles Background */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-sky-400/30 to-purple-400/30 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${8 + Math.random() * 10}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>

                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />

                <div className="relative flex h-full flex-col overflow-hidden rounded-xl p-6 md:p-8 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/95 backdrop-blur-xl">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent shimmer-effect"
                            style={{
                                animation: 'shimmer 8s ease-in-out infinite',
                                transform: 'translateX(-100%) skewX(-20deg)',
                            }}
                        />
                    </div>

                    {/* Header with Enhanced Design */}
                    <div className="mb-4 flex items-center justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-sky-700 to-emerald-700 bg-clip-text text-transparent">
                                    คุยกับ AI ส่วนตัว
                                </h3>
                            </div>
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                                ลองพิมพ์คำถามได้เลย!
                                <span className="inline-block animate-bounce">👇</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-300 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800">
                                <path d="M2.5 16.5C2.5 17.4293 2.5 17.894 2.57686 18.2804C2.89249 19.8671 4.13288 21.1075 5.71964 21.4231C6.10603 21.5 6.57069 21.5 7.5 21.5M21.5 16.5C21.5 17.4293 21.5 17.894 21.4231 18.2804C21.1075 19.8671 19.8671 21.1075 18.2804 21.4231C17.894 21.5 17.4293 21.5 16.5 21.5M21.5 7.5C21.5 6.57069 21.5 6.10603 21.4231 5.71964C21.1075 4.13288 19.8671 2.89249 18.2804 2.57686C17.894 2.5 17.4293 2.5 16.5 2.5M2.5 7.5C2.5 6.57069 2.5 6.10603 2.57686 5.71964C2.89249 4.13288 4.13288 2.89249 5.71964 2.57686C6.10603 2.5 6.57069 2.5 7.5 2.5" />
                                <path d="M12 8.5V6.5M10 11.5V12M14 11.5V12M11 8.5H13C14.8856 8.5 15.8284 8.5 16.4142 9.08579C17 9.67157 17 10.6144 17 12.5C17 14.3856 17 15.3284 16.4142 15.9142C15.8284 16.5 14.8856 16.5 13 16.5H11C9.11438 16.5 8.17157 16.5 7.58579 15.9142C7 15.3284 7 14.3856 7 12.5C7 10.6144 7 9.67157 7.58579 9.08579C8.17157 8.5 9.11438 8.5 11 8.5Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Quick Questions with Enhanced Style */}
                    <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                        {['แนะนำอาหารเย็น', 'ออกกำลังกาย', 'น้ำหนัก'].map((q, index) => (
                            <button
                                key={q}
                                onClick={() => handleQuickQuestion(q)}
                                disabled={isTyping}
                                className="relative px-3 py-1.5 text-xs bg-gradient-to-r from-slate-50 to-slate-100 hover:from-sky-50 hover:to-emerald-50 text-slate-600 hover:text-slate-900 rounded-full border border-slate-300 hover:border-sky-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group/btn"
                                style={{
                                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <span className="relative z-10">{q}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-emerald-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                            </button>
                        ))}
                    </div>

                    {/* Chat Messages with Enhanced Design */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 flex flex-col gap-3 text-sm overflow-y-auto min-h-0 pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent relative z-10"
                    >
                        {messages.map((msg, index) => {
                            const isLastAI = msg.id === currentAIMessageId;
                            const showTypingText = isLastAI ? displayedText : msg.text;

                            return msg.type === 'user' ? (
                                <div
                                    key={msg.id}
                                    className="self-end bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[90%] shadow-lg shadow-sky-500/20 animate-in slide-in-from-right-2 duration-300 hover:shadow-xl hover:shadow-sky-500/30 transition-all break-words leading-relaxed"
                                    style={{
                                        animation: `slideInRight 0.4s ease-out`
                                    }}
                                >
                                    {msg.text}
                                </div>
                            ) : (
                                <div
                                    key={msg.id}
                                    className="self-start bg-gradient-to-br from-white to-slate-50 text-slate-700 px-4 py-4 rounded-2xl rounded-tl-sm border border-slate-300 max-w-[95%] shadow-md animate-in slide-in-from-left-2 duration-300 hover:shadow-lg transition-all relative"
                                    style={{
                                        animation: `slideInLeft 0.4s ease-out`
                                    }}
                                >
                                    {/* Shimmer on message */}
                                    {isLastAI && isTyping && (
                                        <div className="absolute inset-0 rounded-2xl rounded-tl-sm overflow-hidden pointer-events-none">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent animate-shimmer" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mb-2 text-slate-900 text-[10px] font-bold uppercase tracking-wider relative z-10">
                                        <Brain size={10} className="animate-pulse" />
                                        <span>AI RESPONSE</span>
                                        {/* Voice Wave Animation */}
                                        {isLastAI && isTyping && (
                                            <div className="flex items-center gap-0.5 ml-1">
                                                {[...Array(4)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-0.5 bg-emerald-500 rounded-full"
                                                        style={{
                                                            height: '8px',
                                                            animation: `wave 1s ease-in-out infinite`,
                                                            animationDelay: `${i * 0.1}s`
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="relative z-10 break-words overflow-wrap-anywhere whitespace-pre-wrap leading-loose pb-2">
                                        {showTypingText}
                                        {isLastAI && isTyping && (
                                            <span className="inline-block w-0.5 h-4 bg-gradient-to-b from-emerald-500 to-emerald-300 ml-0.5 animate-pulse" />
                                        )}
                                    </p>
                                </div>
                            );
                        })}

                        {/* Premium Typing Indicator */}
                        {isTyping && !currentAIMessageId && (
                            <div className="self-start bg-gradient-to-br from-white to-slate-50 text-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-300 shadow-md">
                                <div className="flex items-center gap-1.5">
                                    {[0, 150, 300].map((delay, i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 animate-bounce"
                                            style={{
                                                animationDelay: `${delay}ms`,
                                                boxShadow: '0 0 8px rgba(14, 165, 233, 0.4)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area with Enhanced Design */}
                    <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-slate-300/80 relative z-10">
                        <div className="relative flex items-center group/input">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="พิมพ์คำถามที่นี่..."
                                disabled={isTyping}
                                className="w-full bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm border-0 focus:border-0 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 focus:shadow-lg focus:shadow-sky-500/10 disabled:opacity-50 hover:border-sky-400"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping}
                                className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-sky-500/30 hover:scale-110 active:scale-95"
                            >
                                <Send size={16} className="transition-transform duration-300 group-hover/input:translate-x-0.5 group-hover/input:-translate-y-0.5" />
                            </button>
                        </div>
                    </form>

                    {/* Enhanced Glow Decorations */}
                    <div className="absolute top-1/2 right-[-50px] w-48 h-48 bg-gradient-to-br from-purple-200/30 via-pink-200/20 to-transparent rounded-full blur-[80px] pointer-events-none animate-pulse-slow" />
                    <div className="absolute bottom-0 left-[-30px] w-40 h-40 bg-gradient-to-tr from-sky-200/30 via-emerald-200/20 to-transparent rounded-full blur-[70px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }} />
                </div>
            </div>

            {/* Enhanced CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(200%) skewX(-20deg); }
                }
                
                @keyframes wave {
                    0%, 100% { height: 8px; }
                    50% { height: 16px; }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </li>
    );
};

// --- Components ---

const DropdownMenu = ({
    label,
    items
}: {
    label: string;
    items: { label: string; href: string; }[]
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className="relative group flex items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                aria-expanded={isOpen}
            >
                {/* Glassmorphism background */}
                <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Gradient border glow */}
                <div className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-sky-400/30 to-transparent blur-sm" />
                </div>

                <span className="relative z-10 group-hover:text-sky-400 transition-colors duration-300">
                    {label}
                </span>
                <ChevronDown
                    size={16}
                    className={`relative z-10 transition-all duration-300 ${isOpen ? 'rotate-180 text-sky-400' : 'text-slate-400'}`}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute top-full left-0 mt-1 min-w-[200px] rounded-lg border border-white/10 bg-[rgba(0,0,0,0.92)] backdrop-blur-xl shadow-[0_15px_14px_0px_#00000066] transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
            >
                <div className="p-1 flex flex-col gap-1">
                    {items.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className="block rounded-lg bg-transparent px-4 py-2.5 text-sm text-white transition-all duration-200 hover:bg-white/10 hover:text-sky-400"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                padding: scrolled ? '12px 16px' : '0px',
                transition: 'padding 800ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <div
                className="mx-auto backdrop-blur-xl"
                style={{
                    maxWidth: scrolled ? '1152px' : '100%',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderRadius: scrolled ? '16px' : '0px',
                    border: scrolled ? '1px solid rgba(226, 232, 240, 0.6)' : 'none',
                    borderBottom: scrolled ? 'none' : '1px solid rgba(241, 245, 249, 1)',
                    boxShadow: scrolled ? '0 10px 40px -10px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'all 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <div
                    className="px-4 md:px-6 flex items-center justify-between"
                    style={{
                        height: scrolled ? '56px' : '64px',
                        transition: 'height 600ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-sky-500 to-emerald-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white shadow-md">
                            <Activity size={18} className="fill-current sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Vita Wise AI</span>
                    </div>

                    {/* Mobile Menu Icon */}
                    <div className="flex md:hidden items-center gap-3">
                        <button className="p-2 text-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" x2="20" y1="6" y2="6"></line>
                                <line x1="4" x2="20" y1="12" y2="12"></line>
                                <line x1="4" x2="20" y1="18" y2="18"></line>
                            </svg>
                        </button>
                        <Button
                            size="sm"
                            asChild
                            className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-400 hover:to-emerald-400 rounded-full px-4 text-sm shadow-md border-0 font-medium"
                        >
                            <Link to="/register">เริ่มต้น</Link>
                        </Button>
                    </div>

                    {/* Desktop Navigation Menu */}
                    <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700">
                        <DropdownMenu
                            label="ฟีเจอร์"
                            items={[
                                { label: "บันทึกอาหาร & โภชนาการ", href: "#food-log" },
                                { label: "บันทึกการออกกำลังกาย", href: "#exercise-log" },
                                { label: "บันทึกการนอน & น้ำดื่ม", href: "#sleep-water" },
                                { label: "AI วิเคราะห์สุขภาพ", href: "#ai-analysis" },
                            ]}
                        />

                        <DropdownMenu
                            label="การทำงาน"
                            items={[
                                { label: "Dashboard ภาพรวม", href: "#dashboard" },
                                { label: "เป้าหมายสุขภาพ", href: "#health-goals" },
                                { label: "Chat AI ส่วนตัว", href: "#chat-ai" },
                            ]}
                        />

                        <DropdownMenu
                            label="AI วิเคราะห์"
                            items={[
                                { label: "วิเคราะห์รูปอาหาร", href: "#food-ai" },
                                { label: "คำแนะนำโภชนาการ", href: "#nutrition-advice" },
                                { label: "Health Score", href: "#health-score" },
                            ]}
                        />

                        <a
                            href="#pricing"
                            className="relative group px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                        >
                            <div className="absolute inset-0 z-0 bg-slate-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 group-hover:text-emerald-600 transition-colors duration-300">
                                ราคา
                            </span>
                        </a>
                    </div>

                    {/* Desktop Right Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all duration-200"
                        >
                            <Link to="/login">เข้าสู่ระบบ</Link>
                        </Button>
                        <Button
                            size="sm"
                            asChild
                            className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-400 hover:to-emerald-400 rounded-full px-5 text-sm shadow-md border-0 font-medium transition-all duration-200"
                        >
                            <Link to="/register">เริ่มต้นใช้งาน</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Expandable Health Tracking Card Component
const ExpandableHealthCard = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const workflowSteps = [
        { icon: UtensilsCrossed, title: "บันทึกอาหาร", desc: "ถ่ายรูปหรือพิมพ์ AI วิเคราะห์แคลอรี่อัตโนมัติ", color: "text-orange-500", bg: "bg-orange-50" },
        { icon: Dumbbell, title: "ออกกำลังกาย", desc: "บันทึกกิจกรรมและแคลอรี่ที่เผาผลาญ", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Moon, title: "การนอนหลับ", desc: "ติดตามชั่วโมงนอนและคุณภาพการพักผ่อน", color: "text-indigo-500", bg: "bg-indigo-50" },
        { icon: Droplets, title: "น้ำดื่ม", desc: "ติดตามปริมาณน้ำที่ดื่มในแต่ละวัน", color: "text-cyan-500", bg: "bg-cyan-50" },
        { icon: Target, title: "เป้าหมาย", desc: "ตั้งเป้าหมายและติดตามความคืบหน้า", color: "text-emerald-500", bg: "bg-emerald-50" },
    ];

    return (
        <li className="list-none md:[grid-area:1/1/2/8]" style={{ minHeight: isExpanded ? '450px' : '260px', transition: 'min-height 600ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="relative h-full rounded-2xl border border-slate-300 p-2 md:rounded-3xl md:p-3 bg-white">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-xl p-6 md:p-8 bg-white">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-center">
                        <Zap size={24} className="text-slate-800" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                            ติดตามสุขภาพครบวงจร<br />ในที่เดียว
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            บันทึกอาหาร, การออกกำลังกาย, การนอน, และน้ำดื่ม พร้อมตั้งเป้าหมายสุขภาพและติดตามความคืบหน้า ในหน้าจอเดียว
                        </p>
                    </div>

                    {/* Expandable Workflow Steps */}
                    <div
                        className="overflow-hidden"
                        style={{
                            maxHeight: isExpanded ? '300px' : '0px',
                            opacity: isExpanded ? 1 : 0,
                            transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                            marginTop: isExpanded ? '8px' : '0px'
                        }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {workflowSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-300"
                                    style={{
                                        opacity: isExpanded ? 1 : 0,
                                        transform: isExpanded ? 'translateY(0)' : 'translateY(10px)',
                                        transition: `all 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms`
                                    }}
                                >
                                    <div className={`w-9 h-9 rounded-lg ${step.bg} flex items-center justify-center flex-shrink-0`}>
                                        <step.icon size={18} className={step.color} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-800 text-sm">{step.title}</div>
                                        <div className="text-xs text-slate-500 truncate">{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <RainbowButton
                        variant="outline"
                        size="sm"
                        className="w-fit rounded-full text-slate-800 mt-4"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'ซ่อนรายละเอียด' : 'ดูการทำงาน'}
                        {isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                    </RainbowButton>
                </div>
            </div>
        </li>
    );
};

// AI Food Recognition Demo Card
const FoodRecognitionDemo = () => {
    const [phase, setPhase] = useState<'idle' | 'scanning' | 'complete'>('idle');
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        // Auto-start the demo
        const startTimer = setTimeout(() => {
            setPhase('scanning');
        }, 800);

        return () => clearTimeout(startTimer);
    }, []);

    useEffect(() => {
        if (phase === 'scanning') {
            const interval = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setPhase('complete');
                        return 100;
                    }
                    return prev + 1;
                });
            }, 60);
            return () => clearInterval(interval);
        }
    }, [phase]);

    // Reset and replay animation
    const handleReplay = () => {
        setPhase('idle');
        setScanProgress(0);
        setTimeout(() => setPhase('scanning'), 500);
    };

    const nutritionData = [
        { label: 'แคลอรี่', value: '485', unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-500' },
        { label: 'โปรตีน', value: '28', unit: 'g', color: 'text-red-500', bg: 'bg-red-500' },
        { label: 'คาร์โบไฮเดรต', value: '52', unit: 'g', color: 'text-amber-500', bg: 'bg-amber-500' },
        { label: 'ไขมัน', value: '18', unit: 'g', color: 'text-blue-500', bg: 'bg-blue-500' },
    ];

    return (
        <li className="min-h-[320px] list-none md:[grid-area:2/1/3/8]">
            <div className="relative h-full rounded-2xl border border-slate-300 p-2 md:rounded-3xl md:p-3 bg-white">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="relative flex h-full overflow-hidden rounded-xl bg-white">
                    {/* Left Content */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-slate-600 border border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-xs font-medium w-fit">
                            <Brain size={12} className="text-slate-900" />
                            <span>AI วิเคราะห์อาหาร</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                                ถ่ายรูป AI วิเคราะห์<br />แคลอรี่ทันที
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                เพียงถ่ายรูปอาหาร AI จะวิเคราะห์และแสดงค่าโภชนาการให้อัตโนมัติ
                            </p>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-slate-900 flex-shrink-0" />
                                <span>รองรับอาหารไทยและอาหารทั่วไป</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-slate-900 flex-shrink-0" />
                                <span>วิเคราะห์แคลอรี่และโภชนาการโดยประมาณ</span>
                            </li>
                        </ul>

                        {/* Replay Button */}
                        <RainbowButton
                            variant="outline"
                            size="sm"
                            onClick={handleReplay}
                            className="rounded-full text-slate-800"
                        >
                            <Camera size={14} />
                            <span>ดูอีกครั้ง</span>
                        </RainbowButton>
                    </div>

                    {/* Right - Premium Food Recognition Demo */}
                    <div className="hidden md:flex flex-1 items-center justify-center relative p-6">
                        {/* Phone-like Frame */}
                        <div className="relative w-[260px] bg-white rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-300 overflow-hidden">
                            {/* Food Image */}
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src="/images/tom-yum-noodles.png"
                                    alt="ก๋วยเตี๋ยวต้มยำ"
                                    className="w-full h-full object-cover"
                                    style={{
                                        transform: phase === 'complete' ? 'scale(1.02)' : 'scale(1)',
                                        transition: 'transform 0.6s ease',
                                        filter: phase === 'scanning' ? 'brightness(0.85)' : 'brightness(1)'
                                    }}
                                />

                                {/* Scanning Overlay */}
                                {phase === 'scanning' && (
                                    <>
                                        {/* Dark overlay with vignette */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

                                        {/* Grid overlay */}
                                        <div
                                            className="absolute inset-0 opacity-20 pointer-events-none"
                                            style={{
                                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                                backgroundSize: '20px 20px'
                                            }}
                                        />

                                        {/* Animated Corner Brackets */}
                                        <div className="absolute inset-4 pointer-events-none">
                                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg animate-pulse" />
                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg animate-pulse" style={{ animationDelay: '0.2s' }} />
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg animate-pulse" style={{ animationDelay: '0.4s' }} />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg animate-pulse" style={{ animationDelay: '0.6s' }} />
                                        </div>

                                        {/* Scan Line with glow */}
                                        <div
                                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                                            style={{
                                                top: `${scanProgress}%`,
                                                boxShadow: '0 0 30px 8px rgba(52, 211, 153, 0.5), 0 0 60px 20px rgba(52, 211, 153, 0.2)',
                                            }}
                                        />

                                        {/* AI Detection Points - appear at different progress stages */}
                                        {scanProgress > 20 && (
                                            <div className="absolute top-[25%] left-[30%] w-16 h-12 border border-emerald-400/60 rounded-md animate-pulse">
                                                <div className="absolute -top-2 left-1 px-1 bg-emerald-500 text-[6px] text-white rounded">กุ้ง</div>
                                            </div>
                                        )}
                                        {scanProgress > 40 && (
                                            <div className="absolute top-[35%] right-[25%] w-14 h-10 border border-cyan-400/60 rounded-md animate-pulse" style={{ animationDelay: '0.3s' }}>
                                                <div className="absolute -top-2 left-1 px-1 bg-cyan-500 text-[6px] text-white rounded">เส้น</div>
                                            </div>
                                        )}
                                        {scanProgress > 60 && (
                                            <div className="absolute bottom-[35%] left-[25%] w-12 h-10 border border-amber-400/60 rounded-md animate-pulse" style={{ animationDelay: '0.5s' }}>
                                                <div className="absolute -top-2 left-1 px-1 bg-amber-500 text-[6px] text-white rounded">เครื่องเทศ</div>
                                            </div>
                                        )}

                                        {/* Shimmer effect */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                                            style={{
                                                transform: `translateX(${(scanProgress * 3) - 100}%)`,
                                                transition: 'transform 100ms linear'
                                            }}
                                        />

                                        {/* Scanning Badge */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-slate-900 animate-pulse">
                                                <path d="M10.9381 11.0774L3.41101 18.6045C2.863 19.1525 2.863 20.041 3.41101 20.589C3.95902 21.137 4.84752 21.137 5.39553 20.589L12.9226 13.0619M10.9381 11.0774L12.9226 13.0619M10.9381 11.0774L11.6823 10.3332M12.9226 13.0619L13.6668 12.3177M11.6823 10.3332L11.7248 10.2906C12.1124 9.90313 12.7406 9.90313 13.1281 10.2906L13.7094 10.8719C14.0969 11.2594 14.0969 11.8876 13.7094 12.2751L13.6668 12.3177M11.6823 10.3332L13.6668 12.3177" />
                                                <path d="M18.2377 3.16707C18.3416 2.94431 18.6584 2.94431 18.7623 3.16707L19.1541 4.00647C19.3266 4.37618 19.6238 4.67336 19.9935 4.84591L20.8329 5.23766C21.0557 5.34162 21.0557 5.65838 20.8329 5.76234L19.9935 6.15409C19.6238 6.32664 19.3266 6.62381 19.1541 6.99353L18.7623 7.83293C18.6584 8.05569 18.3416 8.05569 18.2377 7.83293L17.8459 6.99353C17.6734 6.62381 17.3762 6.32664 17.0065 6.15409L16.1671 5.76234C15.9443 5.65838 15.9443 5.34162 16.1671 5.23766L17.0065 4.84591C17.3762 4.67336 17.6734 4.37618 17.8459 4.00647L18.2377 3.16707Z" />
                                                <path d="M18.2377 14.1671C18.3416 13.9443 18.6584 13.9443 18.7623 14.1671L19.1541 15.0065C19.3266 15.3762 19.6238 15.6734 19.9935 15.8459L20.8329 16.2377C21.0557 16.3416 21.0557 16.6584 20.8329 16.7623L19.9935 17.1541C19.6238 17.3266 19.3266 17.6238 19.1541 17.9935L18.7623 18.8329C18.6584 19.0557 18.3416 19.0557 18.2377 18.8329L17.8459 17.9935C17.6734 17.6238 17.3762 17.3266 17.0065 17.1541L16.1671 16.7623C15.9443 16.6584 15.9443 16.3416 16.1671 16.2377L17.0065 15.8459C17.3762 15.6734 17.6734 15.3762 17.8459 15.0065L18.2377 14.1671Z" />
                                                <path d="M7.23766 3.16707C7.34162 2.94431 7.65838 2.94431 7.76234 3.16707L8.15409 4.00647C8.32664 4.37618 8.62381 4.67336 8.99353 4.84591L9.83293 5.23766C10.0557 5.34162 10.0557 5.65838 9.83293 5.76234L8.99353 6.15409C8.62381 6.32664 8.32664 6.62381 8.15409 6.99353L7.76234 7.83293C7.65838 8.05569 7.34162 8.05569 7.23766 7.83293L6.84591 6.99353C6.67336 6.62381 6.37618 6.32664 6.00647 6.15409L5.16707 5.76234C4.94431 5.65838 4.94431 5.34162 5.16707 5.23766L6.00647 4.84591C6.37618 4.67336 6.67336 4.37618 6.84591 4.00647L7.23766 3.16707Z" />
                                            </svg>
                                            <span className="text-xs font-medium text-slate-700 whitespace-nowrap">กำลังวิเคราะห์ {scanProgress}%</span>
                                        </div>
                                    </>
                                )}

                                {/* Complete Badge */}
                                {phase === 'complete' && (
                                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-md flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
                                            <path d="M16 21.9995V21.4995C16 20.395 16.9321 19.5 17.9223 19.0106C18.8846 18.5349 19.6943 17.7507 19.7965 16.8308L20 14.9995L22 13.9995L19.5 10.2495C19.5 5.94601 16.2049 2.41209 12 2.03317M6.5 16.9957V21.9995M6.5 16.9957C5.46656 16.2668 4.60808 15.3063 4 14.1898M6.5 16.9957C7.25065 17.5253 8.09362 17.9326 9 18.189" />
                                            <path d="M8 4H6C5.05719 4 4.58579 4 4.29289 4.29289C4 4.58579 4 5.05719 4 6V8C4 8.94281 4 9.41421 4.29289 9.70711C4.58579 10 5.05719 10 6 10H8C8.94281 10 9.41421 10 9.70711 9.70711C10 9.41421 10 8.94281 10 8V6C10 5.05719 10 4.58579 9.70711 4.29289C9.41421 4 8.94281 4 8 4Z" />
                                            <path d="M5.5 9.99997V12M8.5 9.99997V12M5.5 1.99997V3.99997M8.5 1.99997V3.99997M4 5.49997H2M4 8.49997H2M12 5.49997H10M12 8.49997H10" />
                                        </svg>
                                        <span className="text-xs font-medium text-slate-700">วิเคราะห์แล้ว</span>
                                    </div>
                                )}
                            </div>

                            {/* Results Panel */}
                            <div className="p-5">
                                {/* Food Name & Calories */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900">ก๋วยเตี๋ยวต้มยำกุ้ง</h4>
                                        <p className="text-sm text-slate-500">1 ชาม · 350g</p>
                                    </div>
                                    <div
                                        className="text-right"
                                        style={{
                                            opacity: phase === 'complete' ? 1 : 0.3,
                                            transition: 'opacity 0.5s ease'
                                        }}
                                    >
                                        <div className="text-2xl font-bold text-slate-900">485</div>
                                        <div className="text-xs text-slate-500">kcal</div>
                                    </div>
                                </div>

                                {/* Nutrition Bar */}
                                <div
                                    className="flex gap-2"
                                    style={{
                                        opacity: phase === 'complete' ? 1 : 0.3,
                                        transition: 'opacity 0.5s ease 0.2s'
                                    }}
                                >
                                    {[
                                        { label: 'โปรตีน', value: 28, color: 'bg-rose-500', max: 50 },
                                        { label: 'คาร์บ', value: 52, color: 'bg-amber-500', max: 100 },
                                        { label: 'ไขมัน', value: 18, color: 'bg-sky-500', max: 50 },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex-1"
                                            style={{
                                                opacity: phase === 'complete' ? 1 : 0,
                                                transform: phase === 'complete' ? 'translateY(0)' : 'translateY(8px)',
                                                transition: `all 0.4s ease ${index * 100 + 300}ms`
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] text-slate-500">{item.label}</span>
                                                <span className="text-xs font-semibold text-slate-700">{item.value}g</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.color} rounded-full`}
                                                    style={{
                                                        width: phase === 'complete' ? `${(item.value / item.max) * 100}%` : '0%',
                                                        transition: `width 0.8s ease ${index * 100 + 400}ms`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -z-10 w-64 h-64 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full blur-3xl opacity-50" />
                    </div>
                </div>
            </div>
        </li>
    );
};

const NodeCard = ({ title, icon: Icon, iconColor, label, spotlightColor = "rgba(0, 229, 255, 0.15)", isActive = false }: any) => (
    <SpotlightCard
        className={`z-10 w-36 sm:w-48 p-5 bg-white border border-slate-300 shadow-sm flex flex-col items-center gap-4 transition-all duration-300 rounded-2xl group ${isActive ? 'ring-1 ring-slate-400 shadow-md' : 'hover:shadow-md hover:border-slate-400'}`}
        spotlightColor={spotlightColor}
    >
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
            <Icon size={22} className={iconColor || "text-slate-600"} />
        </div>
        <div className="text-center space-y-1">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none">{label}</div>
            <div className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>{title}</div>
        </div>
    </SpotlightCard>
);

const ConnectionLine = ({ position = "left" }: { position?: "left" | "right" }) => {
    const isLeft = position === "left";
    const animationName = isLeft ? "flowLeft" : "flowRight";

    return (
        <div className="hidden md:flex relative w-full h-full items-center justify-center pointer-events-none">
            {/* Main Connection Container - vertically centered */}
            <div className="relative w-full flex items-center" style={{ height: '2px' }}>

                {/* Static Base Line - very subtle */}
                <div
                    className="absolute inset-x-0 h-[1px]"
                    style={{
                        background: isLeft
                            ? 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.15) 20%, rgba(56, 189, 248, 0.25) 50%, rgba(56, 189, 248, 0.15) 80%, transparent 100%)'
                            : 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.15) 20%, rgba(16, 185, 129, 0.25) 50%, rgba(16, 185, 129, 0.15) 80%, transparent 100%)',
                    }}
                />

                {/* Soft Dashed Overlay */}
                <div
                    className="absolute inset-x-0 h-[1px] opacity-40"
                    style={{
                        backgroundImage: isLeft
                            ? 'repeating-linear-gradient(90deg, transparent 0px, transparent 6px, rgba(56, 189, 248, 0.3) 6px, rgba(56, 189, 248, 0.3) 12px)'
                            : 'repeating-linear-gradient(90deg, transparent 0px, transparent 6px, rgba(16, 185, 129, 0.3) 6px, rgba(16, 185, 129, 0.3) 12px)',
                    }}
                />

                {/* Single Flowing Particle - soft and subtle */}
                <div
                    className="absolute h-[2px] rounded-full"
                    style={{
                        width: '40px',
                        background: isLeft
                            ? 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), rgba(56, 189, 248, 0.7), rgba(56, 189, 248, 0.5), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.5), rgba(16, 185, 129, 0.7), rgba(16, 185, 129, 0.5), transparent)',
                        boxShadow: isLeft
                            ? '0 0 8px 1px rgba(56, 189, 248, 0.3)'
                            : '0 0 8px 1px rgba(16, 185, 129, 0.3)',
                        animation: `${animationName} 3s ease-in-out infinite`,
                    }}
                />

                {/* Small Trailing Dot */}
                <div
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                        background: isLeft
                            ? 'rgba(56, 189, 248, 0.6)'
                            : 'rgba(16, 185, 129, 0.6)',
                        boxShadow: isLeft
                            ? '0 0 4px 1px rgba(56, 189, 248, 0.3)'
                            : '0 0 4px 1px rgba(16, 185, 129, 0.3)',
                        animation: `${animationName} 3s ease-in-out infinite 0.8s`,
                    }}
                />

                {/* Small Arrow at end - very subtle */}
                <div
                    className="absolute right-0 opacity-50"
                    style={{
                        color: isLeft ? 'rgba(56, 189, 248, 0.6)' : 'rgba(16, 185, 129, 0.6)',
                    }}
                >
                    <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor">
                        <path d="M0 0 L6 4 L0 8 Z" />
                    </svg>
                </div>
            </div>

            {/* CSS Keyframes - smoother animation */}
            <style>{`
                @keyframes ${animationName} {
                    0% {
                        left: -5%;
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    85% {
                        opacity: 1;
                    }
                    100% {
                        left: 95%;
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

const HeroSection = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const leftCardRef = React.useRef<HTMLDivElement>(null);
    const centerCardRef = React.useRef<HTMLDivElement>(null);
    const rightCardRef = React.useRef<HTMLDivElement>(null);

    return (
        <section className="relative min-h-[85vh] md:h-[900px] overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">

            {/* Light Theme Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Structure Grid - Startup Visuals Style */}
                <svg
                    className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>

                {/* Soft gradient orbs - Restored */}
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-emerald-300/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
                <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />

                {/* LaserFlow Beam Effect */}
                <div className="absolute inset-0 opacity-70 mix-blend-multiply pointer-events-none">
                    <LaserFlow
                        color="#0ea5e9"
                        flowSpeed={0.4}
                        wispDensity={1.2}
                        horizontalBeamOffset={0.02}
                        verticalBeamOffset={-0.24}
                        fogIntensity={0.3}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 text-center relative z-10 pt-24 h-full flex flex-col items-center">

                {/* Header Content */}
                <div className="mb-8 md:mb-12 space-y-4 md:space-y-6 max-w-4xl mx-auto flex-1 flex flex-col justify-center md:block">
                    <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.2] font-heading px-2">
                        ดูแลสุขภาพครบวงจร <br />
                        {/* Gradient text on mobile, Cover animation on desktop */}
                        <span className="inline-block mt-1 sm:mt-3">
                            <span className="md:hidden text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                                ด้วย AI อัจฉริยะ
                            </span>
                            <span className="hidden md:inline-block">
                                <Cover className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500 inline-block">
                                    ด้วย AI อัจฉริยะ
                                </Cover>
                            </span>
                        </span>
                    </h1>

                    {/* Mobile Description & CTA - Light Theme */}
                    <div className="md:hidden space-y-6 px-2 mt-4">
                        <p className="text-slate-600 text-base leading-relaxed">
                            บันทึกอาหาร ออกกำลังกาย การนอน และน้ำดื่มได้อย่างง่ายดาย
                            พร้อม AI วิเคราะห์และให้คำแนะนำเฉพาะบุคคล เพื่อสุขภาพที่ดีขึ้นได้จริง
                        </p>

                        {/* Full-width CTA Buttons */}
                        <div className="flex flex-col gap-3 pt-2">
                            <Link to="/register" className="w-full">
                                <ShinyButton className="w-full rounded-xl py-6 text-base font-semibold">
                                    เริ่มต้นใช้งานฟรี
                                </ShinyButton>
                            </Link>
                            <Link to="/login" className="w-full">
                                <Button variant="outline" className="w-full rounded-xl py-6 text-base border-slate-300 text-slate-700 hover:bg-slate-100 bg-white">
                                    เข้าสู่ระบบ
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Workflow Visualization - Hidden on mobile, shown on md+ */}
                <div className="hidden md:block w-full max-w-6xl mt-auto relative z-20 transform translate-y-1">
                    {/* Glow effect for light theme */}
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-300/20 rounded-full blur-[100px] pointer-events-none" />

                    <SpotlightCard
                        className="rounded-t-3xl rounded-b-none border-t border-x border-b-0 border-slate-300 bg-white/90 shadow-xl backdrop-blur-xl p-8 pb-0 md:p-12 md:pb-0 !overflow-visible"
                        spotlightColor="rgba(56, 189, 248, 0.1)"
                    >
                        {/* Inner Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />

                        {/* Static Glow Border - Blue Light Frame */}
                        <div className="absolute inset-0 rounded-[inherit] border border-sky-400/60 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)] pointer-events-none z-10" />

                        {/* Top highlight line */}
                        <div className="absolute -inset-[1px] rounded-t-3xl border-t border-x border-sky-400/40 z-10 pointer-events-none"
                            style={{ maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)' }}
                        />

                        {/* Core Beam Line at Top */}
                        <div className="absolute -top-[1px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent z-20" />


                        <div ref={containerRef} className="relative z-10 w-full max-w-6xl mx-auto pb-8 md:pb-12">
                            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-6 w-full md:h-40">
                                {/* Left Card - Sources */}
                                <div ref={leftCardRef} className="flex-shrink-0 z-10">
                                    <NodeCard
                                        title="Connect"
                                        icon={Watch}
                                        label="SOURCES"
                                        iconColor="text-slate-800"
                                        spotlightColor="rgba(56, 189, 248, 0.1)"
                                    />
                                </div>

                                {/* Center Card - AI Engine */}
                                <div ref={centerCardRef} className="flex-shrink-0 z-20">
                                    <NodeCard
                                        title="Analyze"
                                        icon={Brain}
                                        label="ENGINE"
                                        iconColor="text-slate-800"
                                        spotlightColor="rgba(99, 102, 241, 0.15)"
                                        isActive={true}
                                    />
                                </div>

                                {/* Right Card - Outcome */}
                                <div ref={rightCardRef} className="flex-shrink-0 z-10">
                                    <NodeCard title="Plan" icon={ShieldCheck} label="OUTCOME" iconColor="text-slate-800" spotlightColor="rgba(16, 185, 129, 0.1)" />
                                </div>
                            </div>

                            {/* Animated Beams - Desktop only - Multiple beams for better effect */}
                            {/* Left to Center beams */}
                            <AnimatedBeam
                                containerRef={containerRef}
                                fromRef={leftCardRef}
                                toRef={centerCardRef}
                                duration={6}
                                pathColor="rgba(56, 189, 248, 0.2)"
                                pathWidth={2}
                                gradientStartColor="#38bdf8"
                                gradientStopColor="#6366f1"
                                className="hidden md:block"
                            />
                            <AnimatedBeam
                                containerRef={containerRef}
                                fromRef={leftCardRef}
                                toRef={centerCardRef}
                                duration={6}
                                delay={2}
                                pathColor="rgba(56, 189, 248, 0.2)"
                                pathWidth={2}
                                gradientStartColor="#38bdf8"
                                gradientStopColor="#818cf8"
                                className="hidden md:block"
                            />
                            <AnimatedBeam
                                containerRef={containerRef}
                                fromRef={leftCardRef}
                                toRef={centerCardRef}
                                duration={6}
                                delay={4}
                                pathColor="rgba(56, 189, 248, 0.2)"
                                pathWidth={2}
                                gradientStartColor="#22d3ee"
                                gradientStopColor="#6366f1"
                                className="hidden md:block"
                            />

                            {/* Center to Right beams */}
                            <AnimatedBeam
                                containerRef={containerRef}
                                fromRef={centerCardRef}
                                toRef={rightCardRef}
                                duration={6}
                                delay={1}
                                pathColor="rgba(16, 185, 129, 0.2)"
                                pathWidth={2}
                                gradientStartColor="#6366f1"
                                gradientStopColor="#10b981"
                                className="hidden md:block"
                            />
                            <AnimatedBeam
                                containerRef={containerRef}
                                fromRef={centerCardRef}
                                toRef={rightCardRef}
                                duration={6}
                                delay={3}
                                pathColor="rgba(16, 185, 129, 0.2)"
                                pathWidth={2}
                                gradientStartColor="#818cf8"
                                gradientStopColor="#34d399"
                                className="hidden md:block"
                            />
                            <AnimatedBeam
                                containerRef={containerRef}
                                fromRef={centerCardRef}
                                toRef={rightCardRef}
                                duration={6}
                                delay={5}
                                pathColor="rgba(16, 185, 129, 0.2)"
                                pathWidth={2}
                                gradientStartColor="#a78bfa"
                                gradientStopColor="#10b981"
                                className="hidden md:block"
                            />

                            {/* Mobile Connection Lines */}
                            <div className="md:hidden flex flex-col items-center gap-4 absolute top-0 left-1/2 -translate-x-1/2 h-full justify-center pointer-events-none">
                                <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500/30 via-sky-400/60 to-sky-400/30" />
                                <div className="w-0.5 h-12 bg-gradient-to-b from-sky-400/30 via-emerald-400/60 to-emerald-500/30" />
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </div>

            {/* Gradual Blur Effect at Bottom */}
            <GradualBlur
                target="parent"
                position="bottom"
                height="12rem"
                strength={30}
                divCount={8}
                curve="bezier"
                exponential={true}
                opacity={1}
                zIndex={50}
            />
        </section>
    );
};

const FeatureSection = ({
    title,
    desc,
    reverse = false,
    icon: Icon,
    imageContent
}: {
    title: string,
    desc: string,
    reverse?: boolean,
    icon: any,
    imageContent: React.ReactNode
}) => (
    <section id="features" className="py-24 lg:py-32 border-t border-white/5 bg-slate-950 relative overflow-hidden">
        <div className={`container mx-auto px-4 md:px-6 flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>

            {/* Content Side */}
            <div className="flex-1 space-y-8 text-center lg:text-left relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 text-sky-400 shadow-sm mb-2">
                    <Icon size={28} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">{title}</h2>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">{desc}</p>
                </div>

                <ul className="space-y-4 pt-2 inline-block text-left bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                    {[
                        'บันทึกอาหารพร้อมวิเคราะห์รูปภาพด้วย AI',
                        'ติดตามแคลอรี่ โปรตีน คาร์บ ไขมันอัตโนมัติ',
                        'ตั้งเป้าหมายและติดตามความคืบหน้า'
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 size={12} />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Visual Side */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
                {imageContent}
            </div>

        </div>
    </section >
);

const featuresBentoCards = [
    {
        color: '#0f172a',
        title: 'บันทึกอาหาร',
        description: 'บันทึกมื้ออาหาร คำนวณแคลอรี่/โปรตีน/คาร์บ/ไขมันอัตโนมัติ',
        label: 'FOOD LOG'
    },
    {
        color: '#1e293b',
        title: 'AI วิเคราะห์รูปอาหาร',
        description: 'ถ่ายรูปอาหารแล้ว AI วิเคราะห์โภชนาการให้ทันที',
        label: 'FOOD AI'
    },
    {
        color: '#0f172a',
        title: 'ออกกำลังกาย',
        description: 'บันทึกการออกกำลังกาย ติดตามแคลอรี่ที่เผาผลาญ',
        label: 'EXERCISE'
    },
    {
        color: '#172554',
        title: 'การนอนหลับ',
        description: 'บันทึกเวลานอน/ตื่น วิเคราะห์คุณภาพการนอน',
        label: 'SLEEP'
    },
    {
        color: '#064e3b',
        title: 'น้ำดื่ม',
        description: 'ติดตามปริมาณน้ำดื่มรายวัน พร้อมเตือนเป้าหมาย',
        label: 'WATER'
    },
    {
        color: '#312e81',
        title: 'เป้าหมายสุขภาพ',
        description: 'ตั้งเป้าหมายลดน้ำหนัก/เพิ่มกล้าม/วิ่ง ติดตามความคืบหน้า',
        label: 'GOALS'
    }
];

const Index = () => {
    const navigate = useNavigate();
    const [isFoodDemoOpen, setIsFoodDemoOpen] = useState(false);
    const [isAIChatDemoOpen, setIsAIChatDemoOpen] = useState(false);

    useEffect(() => {
        if (tokenUtils.isLoggedIn()) {
            navigate("/dashboard");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background text-foreground font-prompt selection:bg-primary/20 scroll-smooth">
            <Navbar />

            <main>
                <HeroSection />

                <div className="w-full bg-[#f9f9f9]">
                    <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-between border-x border-dashed border-slate-300 py-16">
                        <div
                            className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen"
                            style={{
                                height: '2px',
                                background: 'repeating-linear-gradient(90deg, #cbd5e1 0, #cbd5e1 3px, transparent 3px, transparent 6px)'
                            }}
                        />

                        <div className="container mx-auto px-4 py-8">
                            {/* Bento Grid - Magic UI Style Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">

                                {/* Card 1: ติดตามสุขภาพครบวงจร (Spanning 2 columns on lg) */}
                                <BentoCard
                                    Icon={Zap}
                                    name="ติดตามสุขภาพครบวงจร"
                                    description="ดูแลครบทุกด้าน: อาหาร, ออกกำลังกาย, การนอน และน้ำดื่มในที่เดียว"
                                    href="#"
                                    cta="ดูการทำงาน"
                                    className="md:col-span-2 lg:col-span-1 min-h-[280px]"
                                    background={
                                        <Marquee
                                            pauseOnHover
                                            className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
                                        >
                                            {[
                                                { name: "อาหารเช้า", body: "โอ๊ตมีล + กล้วย + นมไขมันต่ำ = 350 kcal" },
                                                { name: "ออกกำลังกาย", body: "วิ่งเหยาะๆ 30 นาที เผาผลาญ 280 kcal" },
                                                { name: "น้ำดื่ม", body: "ดื่มน้ำไป 2.1 ลิตร จากเป้า 2.5 ลิตร" },
                                                { name: "การนอน", body: "นอน 7.5 ชม. คุณภาพการนอนดี" },
                                                { name: "อาหารกลางวัน", body: "ข้าวผัดไก่ + ไข่ดาว = 520 kcal" },
                                            ].map((f, idx) => (
                                                <figure
                                                    key={idx}
                                                    className={cn(
                                                        "relative w-36 cursor-pointer overflow-hidden rounded-xl border p-4",
                                                        "border-slate-300 bg-white/80 hover:bg-white",
                                                        "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none hover:shadow-md"
                                                    )}
                                                >
                                                    <div className="flex flex-col">
                                                        <figcaption className="text-sm font-medium text-slate-800">
                                                            {f.name}
                                                        </figcaption>
                                                    </div>
                                                    <blockquote className="mt-2 text-xs text-slate-500">{f.body}</blockquote>
                                                </figure>
                                            ))}
                                        </Marquee>
                                    }
                                />

                                {/* Card 2: AI Chat Card */}
                                <BentoCard
                                    Icon={BellIcon}
                                    name="คุยกับ AI ส่วนตัว"
                                    description="ปรึกษาปัญหาสุขภาพได้ตลอด 24 ชม."
                                    href="#"
                                    cta="ลองใช้งาน"
                                    className="md:col-span-1 lg:col-span-2 min-h-[280px]"
                                    onCtaClick={() => setIsAIChatDemoOpen(true)}
                                    background={
                                        <div className="absolute inset-0 top-10 flex flex-col gap-2 p-4 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
                                            {/* AI Chat Demo Messages */}
                                            {[
                                                { type: 'user', text: 'วันนี้กินแคลอรี่ไปเท่าไหร่?' },
                                                { type: 'ai', text: 'วันนี้กินไป 1,850 kcal จากเป้าหมาย 2,000 kcal 🎯' },
                                                { type: 'user', text: 'แนะนำอาหารเย็นหน่อย' },
                                            ].map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "max-w-[80%] px-3 py-2 rounded-xl text-xs transition-all duration-300",
                                                        msg.type === 'user'
                                                            ? "self-end bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-tr-sm"
                                                            : "self-start bg-white border border-slate-300 text-slate-700 rounded-tl-sm"
                                                    )}
                                                >
                                                    {msg.text}
                                                </div>
                                            ))}
                                        </div>
                                    }
                                />

                                {/* Card 3: AI Food Recognition */}
                                <BentoCard
                                    Icon={Camera}
                                    name="AI วิเคราะห์แคลอรี่"
                                    description="เพียงถ่ายรูปอาหาร รู้ค่าโภชนาการทันที"
                                    href="#"
                                    cta="ดูตัวอย่าง"
                                    className="md:col-span-2 min-h-[280px]"
                                    onCtaClick={() => setIsFoodDemoOpen(true)}
                                    background={
                                        <div className="absolute right-4 top-10 w-[200px] h-[160px] rounded-xl overflow-hidden shadow-xl border border-slate-300 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 group-hover:scale-105">
                                            <img
                                                src="/images/tom-yum-noodles.png"
                                                alt="ก๋วยเตี๋ยวต้มยำ"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Scanning overlay effect */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 animate-pulse" />
                                            <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur rounded-lg px-2 py-1.5 flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-800">ก๋วยเตี๋ยวต้มยำกุ้ง</span>
                                                <span className="text-xs font-bold text-orange-500">485 kcal</span>
                                            </div>
                                        </div>
                                    }
                                />

                                {/* Card 4: Calendar - Filter by Date */}
                                <BentoCard
                                    Icon={CalendarIcon}
                                    name="ดูประวัติสุขภาพ"
                                    description="ดูข้อมูลสุขภาพย้อนหลังตามวันที่ต้องการ"
                                    className="md:col-span-1 min-h-[280px]"
                                    href="#"
                                    cta="ดูประวัติ"
                                    background={
                                        <Calendar
                                            mode="single"
                                            selected={new Date(2024, 11, 25)}
                                            className="absolute top-10 right-0 origin-top scale-[0.85] rounded-xl border border-slate-300 bg-white shadow-sm [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 group-hover:scale-90"
                                        />
                                    }
                                />

                            </div>
                        </div>

                        <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b border-dashed border-slate-300" />
                    </div>
                </div>
                <CallToAction />

            </main>


            <div className="w-full">
                <Footer />
            </div>

            {/* Food Demo Modal */}
            <FoodDemoModal
                isOpen={isFoodDemoOpen}
                onClose={() => setIsFoodDemoOpen(false)}
            />

            {/* AI Chat Demo Modal */}
            <AIChatDemoModal
                isOpen={isAIChatDemoOpen}
                onClose={() => setIsAIChatDemoOpen(false)}
            />
        </div>
    );
};

export default Index;


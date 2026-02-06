import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TextShimmer from "@/components/ui/text-shimmer";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useRef, useMemo } from "react";
import {
    Check, Copy, AlertTriangle, Info, Lightbulb, CheckCircle2, Sparkles,
    ChevronDown, ChevronRight, Brain, ThumbsUp, ThumbsDown, RefreshCw, Loader2,
    Volume2, VolumeX, Pencil, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectMessageType, type MessageType } from "@/utils/aiMessageFormatter";
import DecryptedText from "@/components/DecryptedText";

interface Message {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
    image?: string | null;
    deliveryStatus?: "sending" | "sent" | "failed";
    errorMessage?: string;
}

interface ChatMessageProps {
    message: Message;
    isStreaming?: boolean;
    isLastMessage?: boolean;
    onRegenerate?: () => void;
    onEdit?: (messageId: string, newContent: string) => void;
    onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
    onSendPrompt?: (prompt: string) => void;
    onRetry?: (messageId: string) => void;
}

function getMessageTypeMeta(type: MessageType): { label: string; icon: React.ReactNode } | null {
    switch (type) {
        case "health_advice":
            return { label: "คำแนะนำสุขภาพ", icon: <Sparkles className="h-3.5 w-3.5" /> };
        case "analysis":
            return { label: "การวิเคราะห์", icon: <Brain className="h-3.5 w-3.5" /> };
        case "warning":
            return { label: "ข้อควรระวัง", icon: <AlertTriangle className="h-3.5 w-3.5" /> };
        case "recommendation":
            return { label: "คำแนะนำ", icon: <Lightbulb className="h-3.5 w-3.5" /> };
        case "summary":
            return { label: "สรุป", icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
        default:
            return null;
    }
}

// Message Actions Component - Like/Dislike, Copy, Regenerate, TTS
function MessageActions({
    content,
    onRegenerate,
    onFeedback,
    messageId
}: {
    content: string;
    onRegenerate?: () => void;
    onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
    messageId: string;
}) {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleCopy = async () => {
        try {
            // Remove think tags for copying
            const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            await navigator.clipboard.writeText(cleanContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleFeedback = (type: 'like' | 'dislike') => {
        setFeedback(prev => prev === type ? null : type);
        onFeedback?.(messageId, type);
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // Clean content for TTS
        const cleanContent = content
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .replace(/[*#`]/g, '')
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanContent);
        utterance.lang = 'th-TH';
        utterance.rate = 1;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    return (
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border/70">
            {/* Like */}
            <button
                onClick={() => handleFeedback('like')}
                className={cn(
                    "p-1.5 rounded-md transition-colors",
                    feedback === 'like'
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
                title="ชอบคำตอบนี้"
            >
                <ThumbsUp className="w-4 h-4" />
            </button>

            {/* Dislike */}
            <button
                onClick={() => handleFeedback('dislike')}
                className={cn(
                    "p-1.5 rounded-md transition-colors",
                    feedback === 'dislike'
                        ? "text-red-600 bg-red-50 dark:bg-red-500/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
                title="ไม่ชอบคำตอบนี้"
            >
                <ThumbsDown className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-border mx-0.5" />

            {/* Copy */}
            <button
                onClick={handleCopy}
                className={cn(
                    "p-1.5 rounded-md transition-colors",
                    copied
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
                title="คัดลอก"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Regenerate */}
            {onRegenerate && (
                <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                    title="สร้างคำตอบใหม่"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            )}

            {/* TTS - Text to Speech */}
            <button
                onClick={handleSpeak}
                className={cn(
                    "p-1.5 rounded-md transition-colors",
                    isSpeaking
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-500/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
                title={isSpeaking ? "หยุดอ่าน" : "อ่านออกเสียง"}
            >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
        </div>
    );
}

// User Message Actions - Copy, Edit
function UserMessageActions({
    content,
    onEdit,
    messageId
}: {
    content: string;
    onEdit?: (messageId: string, newContent: string) => void;
    messageId: string;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-2 mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
            {/* Copy */}
            <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                title="คัดลอก"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Edit */}
            {onEdit && (
                <button
                    onClick={() => onEdit(messageId, content)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    title="แก้ไข"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

// Format timestamp for display
function formatTimestamp(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const time = date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (isToday) {
        return time;
    }

    return `${date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ${time}`;
}

// Suggested Follow-up Prompts Component
function SuggestedPrompts({
    onSendPrompt,
    messageType
}: {
    onSendPrompt?: (prompt: string) => void;
    messageType: string;
}) {
    // Generate contextual suggestions based on message type
    const getSuggestions = () => {
        switch (messageType) {
            case 'health_advice':
                return ['อธิบายเพิ่มเติม', 'ขอตัวอย่างอาหาร', 'วิธีออกกำลังกาย'];
            case 'analysis':
                return ['สรุปสั้นๆ', 'แนะนำวิธีปรับปรุง', 'ขอข้อมูลเพิ่ม'];
            case 'recommendation':
                return ['ทำอย่างไรได้บ้าง', 'มีทางเลือกอื่นไหม', 'เริ่มต้นจากไหน'];
            case 'warning':
                return ['ควรทำอย่างไร', 'อันตรายแค่ไหน', 'ป้องกันได้อย่างไร'];
            default:
                return ['บอกเพิ่มเติม', 'สรุปให้หน่อย', 'มีคำแนะนำอื่นไหม'];
        }
    };

    const suggestions = getSuggestions();

    if (!onSendPrompt) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.map((suggestion, idx) => (
                <button
                    key={idx}
                    onClick={() => onSendPrompt(suggestion)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md
                        bg-background text-muted-foreground border border-border
                        hover:text-foreground hover:bg-muted/50 hover:border-border/80
                        transition-colors"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}

// Minimal Thinking Indicator - TextShimmer
function ThinkingIndicator() {
    return (
        <div className="flex items-center gap-1.5 py-1">
            <TextShimmer className="font-mono text-sm" duration={1}>
                Thinking...
            </TextShimmer>
        </div>
    );
}

// Logic to separate "Thought" content from "Main" content
// Convention: <think>thought content</think> main content
function parseThoughtContent(content: string) {
    const thinkStart = content.indexOf('<think>');
    const thinkEnd = content.indexOf('</think>');

    if (thinkStart === -1) {
        return { thought: null, mainContent: content, isThinking: false };
    }

    if (thinkEnd === -1) {
        // Still thinking (streaming in progress)
        const thought = content.substring(thinkStart + 7);
        return { thought, mainContent: "", isThinking: true };
    }

    // Finished thinking
    const thought = content.substring(thinkStart + 7, thinkEnd);
    const mainContent = content.substring(thinkEnd + 8);
    return { thought, mainContent, isThinking: false };
}

// Collapsible Reasoning Component - Claude/Antigravity style
function ReasoningAccordion({ content, isThinking }: { content: string, isThinking: boolean }) {
    const [isOpen, setIsOpen] = useState(false); // Default collapsed
    const [thinkingTime, setThinkingTime] = useState(0);
    const startTimeRef = useRef<number>(Date.now());

    // Timer for "Thinking for Xs"
    useEffect(() => {
        if (!isThinking) return;

        startTimeRef.current = Date.now();
        const interval = setInterval(() => {
            setThinkingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [isThinking]);

    return (
        <div className="my-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-full text-left py-1"
            >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {isThinking ? (
                    <TextShimmer className="font-medium text-sm" duration={1}>
                        {`Thinking for ${thinkingTime}s`}
                    </TextShimmer>
                ) : (
                    <span className="font-medium">Thought for {thinkingTime}s</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pl-5 pt-2 pb-1 text-sm text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
                            {/* Thought content */}
                            {content && (
                                <div className="mb-3 whitespace-pre-wrap">
                                    {content}
                                </div>
                            )}

                            {/* "Thinking." indicator at the bottom */}
                            {isThinking && (
                                <div className="text-slate-500 dark:text-slate-400">
                                    Thinking<span className="animate-pulse">.</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Smooth Streaming Text Component with DecryptedText effect
function StreamingContent({
    content,
    messageType
}: {
    content: string;
    messageType: MessageType;
}) {
    const markdownComponents = useMemo(() => createMarkdownComponents(messageType), [messageType]);

    // For short messages (like greetings), use DecryptedText effect
    const isShortMessage = content.length < 150 && !content.includes('\n') && !content.includes('*');

    if (isShortMessage) {
        return (
            <div className="streaming-text-container">
                <DecryptedText
                    text={content}
                    animateOn="view"
                    speed={30}
                    maxIterations={8}
                    sequential={true}
                    revealDirection="start"
                    className="text-gray-700 dark:text-gray-300"
                    encryptedClassName="text-emerald-500/60 dark:text-emerald-400/60"
                />
                {/* Smooth blinking cursor */}
                <span className="inline-flex items-center ml-0.5">
                    <span className="w-0.5 h-4 bg-emerald-500 rounded-full animate-cursor-blink" />
                </span>
            </div>
        );
    }

    // For longer messages with markdown, use standard rendering
    return (
        <div className="streaming-text-container animate-in fade-in duration-150">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
            {/* Smooth blinking cursor */}
            <span className="inline-flex items-center ml-0.5">
                <span className="w-0.5 h-4 bg-emerald-500 rounded-full animate-cursor-blink" />
            </span>
        </div>
    );
}

// Custom Markdown Components for professional AI message rendering
const createMarkdownComponents = (messageType: MessageType): Partial<Components> => ({
    // Headings with visual hierarchy
    h1: ({ children }) => (
        <h1 className="text-base font-semibold text-foreground mb-3 mt-5 pb-1.5 border-b border-border first:mt-0">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-[15px] font-semibold text-foreground mb-2.5 mt-4 first:mt-0 flex items-center gap-2">
            <span className="w-0.5 h-4 bg-muted-foreground/40 rounded-full flex-shrink-0"></span>
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-sm font-semibold text-foreground mb-2 mt-3.5 first:mt-0">
            {children}
        </h3>
    ),

    // Paragraphs with proper spacing
    p: ({ children }) => (
        <p className="my-2 leading-7 text-[15px] text-foreground/90 first:mt-0 last:mb-0">
            {children}
        </p>
    ),

    // Enhanced unordered lists
    ul: ({ children }) => (
        <ul className="my-3 list-disc pl-5 space-y-1.5 marker:text-muted-foreground/70 first:mt-0 last:mb-0">
            {children}
        </ul>
    ),

    // Enhanced ordered lists
    ol: ({ children }) => (
        <ol className="my-3 list-decimal pl-5 space-y-1.5 marker:text-muted-foreground/70 first:mt-0 last:mb-0">
            {children}
        </ol>
    ),

    li: ({ children }) => (
        <li className="text-[15px] leading-7 text-foreground/90">
            {children}
        </li>
    ),

    // Inline code
    code: ({ children, className, ...props }) => {
        const isInline = !className;
        if (isInline) {
            return (
                <code className="bg-muted/70 text-foreground px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-border">
                    {children}
                </code>
            );
        }
        return (
            <code className={cn("font-mono text-sm", className)} {...props}>
                {children}
            </code>
        );
    },

    // Code blocks
    pre: ({ children }) => (
        <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto my-3 text-sm border border-slate-800 first:mt-0 last:mb-0">
            {children}
        </pre>
    ),

    // Blockquotes as callout boxes
    blockquote: ({ children }) => {
        // Parse content to detect callout type
        const content = String(children);
        let icon = <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
        let bgClass = "bg-blue-50/70 dark:bg-blue-950/25 border-blue-300 dark:border-blue-900/60";

        if (content.includes('⚠️') || content.includes('คำเตือน') || content.includes('warning')) {
            icon = <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
            bgClass = "bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-900/60";
        } else if (content.includes('💡') || content.includes('เคล็ดลับ') || content.includes('tip')) {
            icon = <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
            bgClass = "bg-yellow-50/70 dark:bg-yellow-950/25 border-yellow-300 dark:border-yellow-900/60";
        } else if (content.includes('✅') || content.includes('สำเร็จ') || content.includes('success')) {
            icon = <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
            bgClass = "bg-green-50/70 dark:bg-green-950/25 border-green-300 dark:border-green-900/60";
        }

        return (
            <blockquote className={cn(
                "border-l-2 pl-3.5 pr-3 py-2.5 my-3 rounded-r-lg flex items-start gap-2 first:mt-0 last:mb-0",
                bgClass
            )}>
                {icon}
                <div className="flex-1 text-sm text-foreground/90">{children}</div>
            </blockquote>
        );
    },

    // Links
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
        >
            {children}
        </a>
    ),

    // Strong/Bold text
    strong: ({ children }) => (
        <strong className="font-semibold text-foreground">
            {children}
        </strong>
    ),

    // Emphasis/Italic
    em: ({ children }) => (
        <em className="italic text-muted-foreground">
            {children}
        </em>
    ),

    // Horizontal rule as section divider
    hr: () => (
        <hr className="my-4 border-border" />
    ),

    // Tables
    table: ({ children }) => (
        <div className="overflow-x-auto my-3 rounded-xl border border-border first:mt-0 last:mb-0">
            <table className="min-w-full divide-y divide-border">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-muted/40">
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody className="bg-background divide-y divide-border">
            {children}
        </tbody>
    ),
    tr: ({ children }) => (
        <tr>{children}</tr>
    ),
    th: ({ children }) => (
        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-2 text-sm text-foreground/90">
            {children}
        </td>
    ),
});

function TypewriterContent({ content, messageType }: { content: string; messageType: MessageType }) {
    const [displayedContent, setDisplayedContent] = useState("");
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayedContent("");

        const intervalId = setInterval(() => {
            setDisplayedContent((prev) => {
                if (indexRef.current >= content.length) {
                    clearInterval(intervalId);
                    return content;
                }
                // Speed up by adding multiple characters at once
                const chunkSize = Math.min(3, content.length - indexRef.current);
                const nextChars = content.slice(indexRef.current, indexRef.current + chunkSize);
                indexRef.current += chunkSize;
                return prev + nextChars;
            });
        }, 8); // Slightly faster for smoother experience

        return () => clearInterval(intervalId);
    }, [content]);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={createMarkdownComponents(messageType)}
        >
            {displayedContent}
        </ReactMarkdown>
    );
}

export function ChatMessage({
    message,
    isStreaming = false,
    isLastMessage = false,
    onRegenerate,
    onEdit,
    onFeedback,
    onSendPrompt,
    onRetry
}: ChatMessageProps) {
    const isAi = message.sender === "ai";
    const isUser = message.sender === "user";
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);

    // Reset edited content when message content changes externally
    useEffect(() => {
        setEditedContent(message.content);
    }, [message.content]);

    const handleSaveEdit = () => {
        if (onEdit && editedContent.trim() !== message.content) {
            onEdit(message.id, editedContent);
        }
        setIsEditing(false);
    };

    // Detect message type for styling
    // Parsing thought content
    const { thought, mainContent, isThinking } = parseThoughtContent(message.content);

    // Use mainContent for message type detection
    const messageType = isAi ? detectMessageType(mainContent || "") : 'general';
    const typeMeta = isAi ? getMessageTypeMeta(messageType) : null;
    const markdownComponents = createMarkdownComponents(messageType);

    // Check if message is "new" (created within last 5 seconds) to apply animation
    // Don't animate if this is a streaming message (we handle that differently)
    // Check if message is "new" (created within last 5 seconds) to apply animation
    // Don't animate if this is a streaming message (we handle that differently)
    const isNewMessage = useRef(new Date().getTime() - new Date(message.timestamp).getTime() < 5000).current;
    const shouldAnimate = isAi && isNewMessage && !isStreaming && !isThinking;
    const showUserDeliveryState =
        isUser &&
        !!message.deliveryStatus &&
        (message.deliveryStatus !== "sent" || isLastMessage);

    return (
        <div
            className={cn(
                "flex gap-3 items-start group",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {/* Message Bubble */}
            <div
                className={cn(
                    "relative rounded-2xl max-w-[80%]",
                    isUser
                        ? isEditing
                            ? "w-full max-w-[min(620px,92vw)] bg-transparent text-foreground p-0 shadow-none"
                            : "bg-blue-500 text-white rounded-[24px] px-5 py-3 shadow-sm"
                        : isStreaming && !message.content
                            ? "px-3 py-2" // Minimal padding, no border for thinking state
                            : "bg-background/95 dark:bg-slate-900/70 text-foreground rounded-2xl border border-border px-5 py-4 shadow-sm"
                )}
            >
                {/* Message Type Indicator for AI messages */}
                {isAi && typeMeta && !isStreaming && message.content && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/80">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            {typeMeta.icon}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground tracking-wide">
                            {typeMeta.label}
                        </span>
                    </div>
                )}

                {/* Show image if present */}
                {message.image && (
                    <img
                        src={message.image}
                        alt="Attached"
                        className="max-w-full h-auto rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ maxHeight: "200px" }}
                        onClick={() => window.open(message.image!, '_blank')}
                    />
                )}

                {/* Render message with enhanced markdown for AI, plain for user */}
                {isAi ? (
                    <div className="text-sm leading-relaxed ai-message-content">
                        {/* Reasoning/Thought Block - Show if thought exists OR if we are just starting to stream (no content yet) */}
                        {(thought !== null || (isStreaming && !mainContent)) && (
                            <ReasoningAccordion
                                content={thought || ""}
                                isThinking={isThinking || (isStreaming && !mainContent)}
                            />
                        )}

                        {/* Streaming: show content with smooth animation */}
                        {isStreaming ? (
                            mainContent ? (
                                <StreamingContent content={mainContent} messageType={messageType} />
                            ) : null
                        ) : shouldAnimate ? (
                            <TypewriterContent content={mainContent} messageType={messageType} />
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {mainContent}
                            </ReactMarkdown>
                        )}
                    </div>
                ) : isEditing ? (
                    <div className="w-full rounded-2xl border border-border/70 bg-background/95 dark:bg-slate-900/80 p-3.5 shadow-sm relative z-10">
                        <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveEdit();
                                }
                            }}
                            className="min-h-[84px] w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-muted-foreground/70"
                            placeholder="แก้ไขข้อความ..."
                        />
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="px-1 text-[11px] text-muted-foreground/80">
                                Ctrl/⌘ + Enter เพื่อบันทึก
                            </span>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditedContent(message.content);
                                        setIsEditing(false);
                                    }}
                                    className="h-8 rounded-full px-4 text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={!editedContent.trim() || editedContent === message.content}
                                    className="h-8 rounded-full px-4 font-medium"
                                >
                                    บันทึก
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {showUserDeliveryState && (
                            <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-[11px] text-white/85">
                                {message.deliveryStatus === "sending" && (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin text-white/80" />
                                        <span>กำลังส่ง...</span>
                                    </>
                                )}
                                {message.deliveryStatus === "sent" && (
                                    <>
                                        <Check className="h-3 w-3 text-white/80" />
                                        <span>ส่งแล้ว</span>
                                    </>
                                )}
                                {message.deliveryStatus === "failed" && (
                                    <>
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-200" />
                                        <span className="text-red-100">
                                            {message.errorMessage || "ส่งไม่สำเร็จ"}
                                        </span>
                                        {onRetry && (
                                            <button
                                                onClick={() => onRetry(message.id)}
                                                className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/10 px-2 py-0.5 text-white transition-colors hover:bg-white/20"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                ลองใหม่
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        <div className="absolute -bottom-8 right-0">
                            <UserMessageActions
                                content={message.content}
                                messageId={message.id}
                                onEdit={!message.image ? () => setIsEditing(true) : undefined}
                            />
                        </div>
                    </>
                )}

                {/* Message Actions for AI messages - hide during streaming */}
                {isAi && !shouldAnimate && !isStreaming && message.content && (
                    <MessageActions
                        content={message.content}
                        messageId={message.id}
                        onRegenerate={onRegenerate}
                        onFeedback={onFeedback}
                    />
                )}

                {/* Suggested Follow-ups - only for last AI message */}
                {isAi && isLastMessage && !isStreaming && !shouldAnimate && message.content && (
                    <SuggestedPrompts
                        onSendPrompt={onSendPrompt}
                        messageType={messageType}
                    />
                )}

            </div>
        </div>
    );
}

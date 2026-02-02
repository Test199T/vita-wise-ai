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
    ChevronDown, ChevronRight, Brain, ThumbsUp, ThumbsDown, RefreshCw,
    Volume2, VolumeX, Pencil, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectMessageType, MESSAGE_EMOJIS, type MessageType } from "@/utils/aiMessageFormatter";
import DecryptedText from "@/components/DecryptedText";

interface Message {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
    image?: string | null;
}

interface ChatMessageProps {
    message: Message;
    isStreaming?: boolean;
    isLastMessage?: boolean;
    onRegenerate?: () => void;
    onEdit?: (messageId: string, newContent: string) => void;
    onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
    onSendPrompt?: (prompt: string) => void;
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
        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            {/* Like */}
            <button
                onClick={() => handleFeedback('like')}
                className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    feedback === 'like'
                        ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                title="ชอบคำตอบนี้"
            >
                <ThumbsUp className="w-4 h-4" />
            </button>

            {/* Dislike */}
            <button
                onClick={() => handleFeedback('dislike')}
                className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    feedback === 'dislike'
                        ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                title="ไม่ชอบคำตอบนี้"
            >
                <ThumbsDown className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Copy */}
            <button
                onClick={handleCopy}
                className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    copied
                        ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                title="คัดลอก"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Regenerate */}
            {onRegenerate && (
                <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    title="สร้างคำตอบใหม่"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            )}

            {/* TTS - Text to Speech */}
            <button
                onClick={handleSpeak}
                className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    isSpeaking
                        ? "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className="px-3 py-1.5 text-xs font-medium rounded-full 
                        bg-gray-100 dark:bg-gray-700 
                        text-gray-600 dark:text-gray-300
                        hover:bg-emerald-100 dark:hover:bg-emerald-900/30
                        hover:text-emerald-700 dark:hover:text-emerald-400
                        border border-gray-200 dark:border-gray-600
                        hover:border-emerald-300 dark:hover:border-emerald-700
                        transition-all duration-200"
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
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6 pb-2 border-b border-gray-200 dark:border-gray-700 first:mt-0">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-5 flex items-center gap-2 first:mt-0">
            <span className="w-1 h-5 bg-emerald-500 rounded-full flex-shrink-0"></span>
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4 first:mt-0">
            {children}
        </h3>
    ),

    // Paragraphs with proper spacing
    p: ({ children }) => (
        <p className="my-2 leading-relaxed text-gray-700 dark:text-gray-300 first:mt-0 last:mb-0">
            {children}
        </p>
    ),

    // Enhanced unordered lists
    ul: ({ children }) => (
        <ul className="my-3 space-y-2 first:mt-0 last:mb-0">
            {children}
        </ul>
    ),

    // Enhanced ordered lists
    ol: ({ children }) => (
        <ol className="my-3 space-y-2 list-none first:mt-0 last:mb-0 counter-reset-item">
            {children}
        </ol>
    ),

    // List items with custom bullets
    li: ({ children, ...props }) => {
        // Check if it's inside an ordered list by looking at parent context
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const node: any = props.node;
        const isOrdered = node?.position?.start?.column === 1 &&
            /^\d+\./.test(node?.value || '');

        return (
            <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                <div className="flex-1">{children}</div>
            </li>
        );
    },

    // Inline code
    code: ({ children, className, ...props }) => {
        const isInline = !className;
        if (isInline) {
            return (
                <code className="bg-gray-100 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700">
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
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 text-sm border border-gray-700 first:mt-0 last:mb-0">
            {children}
        </pre>
    ),

    // Blockquotes as callout boxes
    blockquote: ({ children }) => {
        // Parse content to detect callout type
        const content = String(children);
        let icon = <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
        let bgClass = "bg-blue-50 dark:bg-blue-950/30 border-blue-400";

        if (content.includes('⚠️') || content.includes('คำเตือน') || content.includes('warning')) {
            icon = <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
            bgClass = "bg-amber-50 dark:bg-amber-950/30 border-amber-400";
        } else if (content.includes('💡') || content.includes('เคล็ดลับ') || content.includes('tip')) {
            icon = <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
            bgClass = "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400";
        } else if (content.includes('✅') || content.includes('สำเร็จ') || content.includes('success')) {
            icon = <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
            bgClass = "bg-green-50 dark:bg-green-950/30 border-green-400";
        }

        return (
            <blockquote className={cn(
                "border-l-4 pl-4 pr-3 py-3 my-3 rounded-r-lg flex items-start gap-2 first:mt-0 last:mb-0",
                bgClass
            )}>
                {icon}
                <div className="flex-1 text-sm">{children}</div>
            </blockquote>
        );
    },

    // Links
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        >
            {children}
        </a>
    ),

    // Strong/Bold text
    strong: ({ children }) => (
        <strong className="font-semibold text-gray-900 dark:text-gray-100">
            {children}
        </strong>
    ),

    // Emphasis/Italic
    em: ({ children }) => (
        <em className="italic text-gray-600 dark:text-gray-400">
            {children}
        </em>
    ),

    // Horizontal rule as section divider
    hr: () => (
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
    ),

    // Tables
    table: ({ children }) => (
        <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-gray-700 first:mt-0 last:mb-0">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-gray-50 dark:bg-gray-800">
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {children}
        </tbody>
    ),
    tr: ({ children }) => (
        <tr>{children}</tr>
    ),
    th: ({ children }) => (
        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
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
    onSendPrompt
}: ChatMessageProps) {
    const isAi = message.sender === "ai";
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
    const markdownComponents = createMarkdownComponents(messageType);

    // Check if message is "new" (created within last 5 seconds) to apply animation
    // Don't animate if this is a streaming message (we handle that differently)
    // Check if message is "new" (created within last 5 seconds) to apply animation
    // Don't animate if this is a streaming message (we handle that differently)
    const isNewMessage = useRef(new Date().getTime() - new Date(message.timestamp).getTime() < 5000).current;
    const shouldAnimate = isAi && isNewMessage && !isStreaming && !isThinking;

    return (
        <div
            className={cn(
                "flex gap-3 items-start group",
                message.sender === "user" ? "justify-end" : "justify-start"
            )}
        >
            {/* Message Bubble */}
            <div
                className={cn(
                    "relative rounded-2xl max-w-[80%]",
                    message.sender === "user"
                        ? "bg-blue-500 text-white rounded-[24px] px-5 py-3 shadow-sm"
                        : isStreaming && !message.content
                            ? "px-3 py-2" // Minimal padding, no border for thinking state
                            : "bg-white dark:bg-gray-800 text-foreground rounded-tl-md border border-gray-100 dark:border-gray-700 px-5 py-4 shadow-sm"
                )}
            >
                {/* Message Type Indicator for AI messages */}
                {isAi && messageType !== 'general' && messageType !== 'greeting' && !isStreaming && message.content && (
                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm">{MESSAGE_EMOJIS[messageType]}</span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {messageType === 'health_advice' && 'คำแนะนำสุขภาพ'}
                            {messageType === 'analysis' && 'การวิเคราะห์'}
                            {messageType === 'warning' && 'ข้อควรระวัง'}
                            {messageType === 'recommendation' && 'คำแนะนำ'}
                            {messageType === 'summary' && 'สรุป'}
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
                    <div className="w-full min-w-[300px] bg-[#373737] p-4 rounded-[26px] shadow-lg border border-white/5 relative z-10">
                        <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="bg-transparent text-white border-0 focus-visible:ring-0 resize-none mb-3 min-h-[60px] p-0 text-base shadow-none placeholder:text-gray-500"
                            placeholder="แก้ไขข้อความ..."
                        />
                        <div className="flex justify-end gap-2 items-center">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditing(false)}
                                className="bg-[#505050] hover:bg-[#606060] text-white rounded-full px-5 h-9 font-normal transition-colors border-0"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                className="bg-white hover:bg-gray-200 text-black rounded-full px-5 h-9 font-medium transition-colors border-0"
                            >
                                ส่ง
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm leading-relaxed">{message.content}</p>
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

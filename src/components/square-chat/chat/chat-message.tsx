import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useRef, useMemo } from "react";
import { Check, Copy, AlertTriangle, Info, Lightbulb, CheckCircle2, Sparkles } from "lucide-react";
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
}

// Minimal Thinking Indicator - Just 3 dots
function ThinkingIndicator() {
    return (
        <div className="flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
        const isOrdered = props.node?.position?.start?.column === 1 && 
                          /^\d+\./.test(props.node?.value || '');
        
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

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
    const isAi = message.sender === "ai";
    const [copied, setCopied] = useState(false);
    
    // Detect message type for styling
    const messageType = isAi ? detectMessageType(message.content) : 'general';
    const markdownComponents = createMarkdownComponents(messageType);
    
    // Check if message is "new" (created within last 5 seconds) to apply animation
    // Don't animate if this is a streaming message (we handle that differently)
    const isNewMessage = useRef(new Date().getTime() - new Date(message.timestamp).getTime() < 5000).current;
    const shouldAnimate = isAi && isNewMessage && !isStreaming;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

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
                        ? "bg-blue-500 text-white rounded-tr-md px-5 py-4 shadow-sm"
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
                        {/* Streaming: show content with smooth animation */}
                        {isStreaming ? (
                            message.content ? (
                                <StreamingContent content={message.content} messageType={messageType} />
                            ) : (
                                <ThinkingIndicator />
                            )
                        ) : shouldAnimate ? (
                            <TypewriterContent content={message.content} messageType={messageType} />
                        ) : (
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                )}

                {/* Copy Button for AI messages - hide during streaming */}
                {isAi && !shouldAnimate && !isStreaming && message.content && (
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "absolute -bottom-2 -right-2 p-1.5 rounded-full",
                            "bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600",
                            "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                            "opacity-0 group-hover:opacity-100 transition-all duration-200",
                            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        )}
                        title="คัดลอกข้อความ"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

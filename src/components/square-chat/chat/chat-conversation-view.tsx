import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatInputBox } from "./chat-input-box";
import { ImageData } from "@/store/chat-store";

interface Message {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
    image?: string | null;
}

interface ChatConversationViewProps {
    messages: Message[];
    message: string;
    onMessageChange: (value: string) => void;
    onSend: (content: string, imageData?: ImageData) => void;
    onReset: () => void;
    isLoading?: boolean;
    isStreaming?: boolean;
    streamingMessageId?: string | null;
    isLoadingMore?: boolean;
    hasMoreMessages?: boolean;
    onLoadMore?: () => void;
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
}

export function ChatConversationView({
    messages,
    message,
    onMessageChange,
    onSend,
    onReset,
    isLoading = false,
    isStreaming = false,
    streamingMessageId = null,
    isLoadingMore = false,
    hasMoreMessages = false,
    onLoadMore,
    selectedModel = "square-3",
    onModelChange = () => { },
}: ChatConversationViewProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const prevScrollHeightRef = useRef<number>(0);

    // Auto scroll to bottom
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior });
        }
    };

    // Scroll on new messages (only when at bottom or new message)
    useEffect(() => {
        // Only scroll if we are already near bottom or it's a new message
        // For simplicity, just scroll smoothly on updates
        scrollToBottom();
    }, [messages, isLoading]);

    // Initial scroll
    useEffect(() => {
        scrollToBottom("auto");
    }, []);

    // Maintain scroll position after loading more messages
    useEffect(() => {
        if (!isLoadingMore && prevScrollHeightRef.current > 0) {
            const container = scrollContainerRef.current;
            if (container) {
                const newScrollHeight = container.scrollHeight;
                const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
                container.scrollTop = scrollDiff;
                prevScrollHeightRef.current = 0;
            }
        }
    }, [isLoadingMore, messages]);

    // Infinite scroll handler - load more when scrolling to top
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || isLoadingMore || !hasMoreMessages || !onLoadMore) return;

        // Check if scrolled to near top (within 100px)
        if (container.scrollTop < 100) {
            // Save current scroll height to restore position after load
            prevScrollHeightRef.current = container.scrollHeight;
            onLoadMore();
        }
    }, [isLoadingMore, hasMoreMessages, onLoadMore]);

    // Add scroll listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="flex h-full min-h-0 flex-col bg-transparent overflow-hidden">
            {/* Messages Area - Ensure flexible height and scrolling */}
            <div
                ref={scrollContainerRef}
                data-lenis-prevent
                className="flex-1 overflow-y-scroll px-4 md:px-8 py-8 min-h-0 overscroll-contain"
            >
                <div className="max-w-[720px] mx-auto space-y-6 pb-4">
                    {/* Loading more indicator at top */}
                    {isLoadingMore && (
                        <div className="flex justify-center py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" />
                                <span>กำลังโหลดข้อความเก่า...</span>
                            </div>
                        </div>
                    )}

                    {/* Load more button (fallback) */}
                    {hasMoreMessages && !isLoadingMore && onLoadMore && (
                        <div ref={topRef} className="flex justify-center py-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onLoadMore}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                โหลดข้อความเก่า
                            </Button>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            isStreaming={isStreaming && msg.id === streamingMessageId}
                        />
                    ))}
                    {isLoading && !isStreaming && (
                        <div className="flex justify-start px-2 py-2">
                            <div className="size-3 rounded-full bg-black dark:bg-white animate-pulse"></div>
                        </div>
                    )}
                    <div ref={bottomRef} className="h-1" />
                </div>
            </div>

            <div className="px-4 md:px-8 py-4 bg-background/50 backdrop-blur-sm z-10">
                <div className="max-w-[720px] mx-auto">
                    <ChatInputBox
                        message={message}
                        onMessageChange={onMessageChange}
                        onSend={(content, file) => {
                            onSend(content || "", file);
                            // Force immediate scroll
                            setTimeout(scrollToBottom, 100);
                        }}
                        selectedModel={selectedModel}
                        onModelChange={onModelChange}
                        isLoading={isLoading}
                        showTools={false}
                        placeholder="Message Square AI..."
                    />

                    <div className="text-center mt-3">
                        <p className="text-xs text-muted-foreground/50 font-light tracking-wide">
                            Square AI can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

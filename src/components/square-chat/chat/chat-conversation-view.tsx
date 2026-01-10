import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusIcon, ArrowUpIcon, Mic, X, Image as ImageIcon } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { cn } from "@/lib/utils";

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
    onSend: (content: string, file?: File) => void;
    onReset: () => void;
    isLoading?: boolean;
    isStreaming?: boolean;
    streamingMessageId?: string | null;
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
}: ChatConversationViewProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [showFileMenu, setShowFileMenu] = useState(false);

    // Auto scroll to bottom
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior });
        }
    };

    // Scroll on new messages
    useEffect(() => {
        // Only scroll if we are already near bottom or it's a new message
        // For simplicity, just scroll smoothly on updates
        scrollToBottom();
    }, [messages, isLoading]);

    // Initial scroll
    useEffect(() => {
        scrollToBottom("auto");
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                setUploadedFile(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const clearFile = () => {
        setUploadedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendClick = () => {
        if ((message.trim() || uploadedFile) && !isLoading) {
            onSend(message, uploadedFile || undefined);
            clearFile();
            // Force immediate scroll
            setTimeout(scrollToBottom, 100);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            // Stop listening but don't clear - wait for user action
            recognition?.stop();
            return;
        }

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.lang = 'th-TH';
            newRecognition.interimResults = true; // Show interim results
            newRecognition.continuous = true; // Keep listening
            newRecognition.maxAlternatives = 1;

            newRecognition.onstart = () => setIsListening(true);
            newRecognition.onend = () => {
                // Don't auto-clear, keep the state
            };
            newRecognition.onresult = (event: any) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                onMessageChange(transcript);
            };
            newRecognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            newRecognition.start();
            setRecognition(newRecognition);
        } else {
            alert("Speech recognition is not supported in this browser.");
        }
    };

    const cancelListening = () => {
        recognition?.stop();
        setIsListening(false);
        setRecognition(null);
        onMessageChange(''); // Clear the message
    };

    const confirmListening = () => {
        recognition?.stop();
        setIsListening(false);
        setRecognition(null);
        // Just keep the message, don't auto-send
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-transparent overflow-hidden">
            {/* Messages Area - Ensure flexible height and scrolling */}
            <div
                ref={scrollContainerRef}
                data-lenis-prevent
                className="flex-1 overflow-y-scroll px-4 md:px-8 py-8 min-h-0 overscroll-contain"
            >
                <div className="max-w-[720px] mx-auto space-y-6 pb-4">
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
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mb-2 relative w-fit animate-in fade-in zoom-in duration-200">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-16 w-16 object-cover rounded-xl border border-white/20 shadow-md"
                            />
                            <button
                                onClick={clearFile}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    )}

                    {/* Glassmorphism Capsule */}
                    <div className="relative flex items-end gap-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl p-2 rounded-[32px] border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <input
                            type="file"
                            ref={cameraInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                        />

                        {/* Plus Button with Menu */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-10 rounded-full shrink-0 text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 hover:text-foreground mb-0.5 ml-1 transition-all duration-200 hover:scale-110"
                                disabled={isLoading}
                                onClick={() => setShowFileMenu(!showFileMenu)}
                            >
                                <PlusIcon className="size-5" />
                            </Button>

                            {/* File Menu Dropdown */}
                            {showFileMenu && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-border overflow-hidden min-w-[180px] z-50">
                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setShowFileMenu(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span>เพิ่มไฟล์</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            cameraInputRef.current?.click();
                                            setShowFileMenu(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm transition-colors border-t border-border"
                                    >
                                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>กล้อง</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Input Area or Waveform */}
                        {isListening ? (
                            <div className="flex-1 flex items-center justify-center gap-0.5 px-4">
                                {[...Array(60)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-0.5 bg-red-500 rounded-full"
                                        style={{
                                            height: `${Math.sin(i * 0.5) * 15 + Math.random() * 25 + 5}px`,
                                            animation: `pulse ${0.3 + Math.random() * 0.4}s ease-in-out infinite`,
                                            animationDelay: `${i * 0.01}s`
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Textarea
                                placeholder="Message Square AI..."
                                value={message}
                                onChange={(e) => onMessageChange(e.target.value)}
                                className="min-h-[50px] max-h-[200px] w-full resize-none border-0 bg-transparent px-2 py-3.5 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 leading-relaxed font-light"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendClick();
                                    }
                                }}
                                disabled={isLoading}
                                rows={1}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "auto";
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                            />
                        )}

                        {/* Action Buttons */}
                        {isListening ? (
                            <>
                                {/* Cancel Button */}
                                <Button
                                    size="icon"
                                    onClick={cancelListening}
                                    className="size-10 rounded-full shrink-0 mb-0.5 transition-all duration-300 shadow-md bg-gray-500 hover:bg-gray-600 text-white"
                                >
                                    <X className="size-5" />
                                </Button>
                                {/* Confirm Button */}
                                <Button
                                    size="icon"
                                    onClick={confirmListening}
                                    className="size-10 rounded-full shrink-0 mb-0.5 mr-1 transition-all duration-300 shadow-md bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="icon"
                                onClick={message.trim() || uploadedFile ? handleSendClick : toggleListening}
                                disabled={isLoading}
                                className={cn(
                                    "size-10 rounded-full shrink-0 mb-0.5 mr-1 transition-all duration-300 shadow-md",
                                    (message.trim() || uploadedFile)
                                        ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transform hover:scale-105"
                                        : "bg-black/5 dark:bg-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/20"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (message.trim() || uploadedFile) ? (
                                    <ArrowUpIcon className="size-5" />
                                ) : (
                                    <Mic className="size-5" />
                                )}
                            </Button>
                        )}
                    </div>

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

import {
    SparklesIcon,
    ChevronDownIcon,
    CheckIcon,
    PlusIcon,
    ArrowUpIcon,
    Mic,
    CircleDashedIcon,
    X,
    Loader2,
    SquareIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/square-chat/ui/logo";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef, useState, useEffect } from "react";
import { ImageData } from "@/store/chat-store";

const aiModels = [
    { id: "square-3", label: "Square AI 3.0", icon: SparklesIcon },
    { id: "square-turbo", label: "Square AI Turbo", icon: SparklesIcon },
    { id: "square-pro", label: "Square AI Pro", icon: SparklesIcon },
    { id: "square-ultra", label: "Square AI Ultra", icon: SparklesIcon },
];

interface ChatInputBoxProps {
    message: string;
    onMessageChange: (value: string) => void;
    onSend: (message?: string, imageData?: ImageData) => void;
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    showTools?: boolean;
    placeholder?: string;
    isLoading?: boolean;
    isStreaming?: boolean;
    onStop?: () => void;
}

export function ChatInputBox({
    message,
    onMessageChange,
    onSend,
    selectedModel,
    onModelChange,
    showTools = true,
    placeholder = "Ask anything...",
    isLoading = false,
    isStreaming = false,
    onStop,
}: ChatInputBoxProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileMenuRef = useRef<HTMLDivElement>(null);
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [showFileMenu, setShowFileMenu] = useState(false);

    // Close file menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
                setShowFileMenu(false);
            }
        };

        if (showFileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFileMenu]);

    // Handle paste from clipboard - converts to base64 for API
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        console.log("Paste event detected", e.clipboardData?.items?.length);

        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log("Paste item type:", item.type);

            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    console.log("Image pasted:", file.name);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        setImagePreview(base64);
                        setImageData({
                            type: 'base64',
                            base64: base64,
                            previewUrl: base64,
                        });
                    };
                    reader.readAsDataURL(file);
                }
                break;
            }
        }
    };

    // Handle file select from input - keeps as File for upload
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
                setImageData({
                    type: 'file',
                    file: file,
                    previewUrl: previewUrl,
                });
            }
        }
    };

    const clearFile = () => {
        setImageData(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendClick = () => {
        if (message.trim() || imageData) {
            onSend(message, imageData || undefined);
            clearFile();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognition?.stop();
            return;
        }

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.lang = 'th-TH';
            newRecognition.interimResults = true;
            newRecognition.continuous = true;
            newRecognition.maxAlternatives = 1;

            newRecognition.onstart = () => setIsListening(true);
            newRecognition.onend = () => {
                // Keep state
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
        onMessageChange('');
    };

    const confirmListening = () => {
        recognition?.stop();
        setIsListening(false);
        setRecognition(null);
        // Just keep the message, don't auto-send
    };

    return (
        <div className="space-y-4 max-w-[720px] mx-auto w-full px-4">
            {/* Image Preview */}
            {imagePreview && (
                <div className="mb-2 relative w-fit animate-in fade-in zoom-in duration-200">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-xl border border-white/20 shadow-md"
                    />
                    <button
                        onClick={clearFile}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
                    >
                        <X className="size-3" />
                    </button>
                </div>
            )}

            {/* Main Input Container - ChatGPT Style */}
            <div className="group relative">
                {/* ChatGPT-style container */}
                <div
                    className="relative flex items-end gap-2 bg-white dark:bg-[#303030] p-2 shadow-md transition-all duration-200 ease-in-out"
                    style={{ borderRadius: '26px' }}
                >
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
                    <div className="relative" ref={fileMenuRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-full shrink-0 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-foreground transition-all duration-200"
                            onClick={() => setShowFileMenu(!showFileMenu)}
                        >
                            <PlusIcon className="size-5" />
                        </Button>

                        {/* File Menu Dropdown */}
                        {showFileMenu && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#303030] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[180px] z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm transition-colors border-t border-gray-200 dark:border-gray-700"
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
                        <div className="flex-1 flex items-center justify-center gap-0.5 min-h-[40px] px-4">
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
                            placeholder={
                                isStreaming
                                    ? "กำลังตอบ... กด Stop เพื่อหยุด"
                                    : isLoading
                                        ? "กำลังสร้างการสนทนา..."
                                        : placeholder
                            }
                            value={message}
                            onChange={(e) => onMessageChange(e.target.value)}
                            disabled={isLoading}
                            className="min-h-[40px] max-h-[200px] w-full resize-none border-0 bg-transparent px-2 py-2 text-base font-normal focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 leading-relaxed disabled:opacity-50"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                                    e.preventDefault();
                                    handleSendClick();
                                }
                            }}
                            onPaste={handlePaste}
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
                                className="size-9 rounded-full shrink-0 transition-all duration-200 bg-gray-500 hover:bg-gray-600 text-white"
                            >
                                <X className="size-5" />
                            </Button>
                            {/* Confirm Button */}
                            <Button
                                size="icon"
                                onClick={confirmListening}
                                className="size-9 rounded-full shrink-0 transition-all duration-200 bg-green-500 hover:bg-green-600 text-white"
                            >
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            {/* Mic Button */}
                            {!isLoading && ('webkitSpeechRecognition' in window) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleListening}
                                    className="size-9 rounded-full shrink-0 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-foreground"
                                >
                                    <Mic className="size-5" />
                                </Button>
                            )}

                            {/* Send Button */}
                            {isStreaming && onStop ? (
                                <Button
                                    size="icon"
                                    onClick={onStop}
                                    className="size-9 rounded-full shrink-0 transition-all duration-200 bg-red-500 text-white hover:bg-red-600"
                                    aria-label="Stop generating"
                                >
                                    <SquareIcon className="size-4 fill-current" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    onClick={handleSendClick}
                                    disabled={isLoading || (!message.trim() && !imageData)}
                                    className={cn(
                                        "size-9 rounded-full shrink-0 transition-all duration-200",
                                        isLoading
                                            ? "bg-foreground text-background"
                                            : (message.trim() || imageData)
                                                ? "bg-foreground text-background hover:opacity-70"
                                                : "bg-gray-300 dark:bg-gray-600 text-muted-foreground cursor-not-allowed opacity-30"
                                    )}
                                >
                                    {isLoading ? (
                                        <Loader2 className="size-5 animate-spin" />
                                    ) : (
                                        <ArrowUpIcon className="size-5" />
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Tools & Health Quick Actions */}
            {showTools && (
                <div className="flex items-center justify-between px-2 opacity-80 hover:opacity-100 transition-opacity duration-200">
                    {/* Health Quick Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSend("บันทึกอาหารวันนี้")}
                            className="gap-1.5 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs px-3 font-medium border border-orange-200 dark:border-orange-800"
                        >
                            <span>🍎</span>
                            <span>อาหาร</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSend("บันทึกการดื่มน้ำวันนี้")}
                            className="gap-1.5 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs px-3 font-medium border border-blue-200 dark:border-blue-800"
                        >
                            <span>💧</span>
                            <span>น้ำ</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSend("บันทึกการนอนหลับ")}
                            className="gap-1.5 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs px-3 font-medium border border-purple-200 dark:border-purple-800"
                        >
                            <span>😴</span>
                            <span>การนอน</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSend("สรุปสุขภาพวันนี้")}
                            className="gap-1.5 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs px-3 font-medium border border-emerald-200 dark:border-emerald-800"
                        >
                            <span>📊</span>
                            <span>สรุป</span>
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 h-8 rounded-full hover:bg-secondary/30 px-3 text-xs font-normal text-muted-foreground backdrop-blur-sm"
                            >
                                <Logo className="size-4 opacity-70" />
                                <span>
                                    {aiModels.find((m) => m.id === selectedModel)?.label}
                                </span>
                                <ChevronDownIcon className="size-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white/90 dark:bg-black/90 backdrop-blur-md border-white/20">
                            {aiModels.map((model) => {
                                const ModelIcon = model.icon;
                                const isSelected = selectedModel === model.id;
                                return (
                                    <DropdownMenuItem
                                        key={model.id}
                                        onClick={() => onModelChange(model.id)}
                                        className="gap-2"
                                    >
                                        <ModelIcon className="size-4" />
                                        <span className="flex-1">{model.label}</span>
                                        {isSelected && <CheckIcon className="size-4" />}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}

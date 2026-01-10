import {
    SparklesIcon,
    ChevronDownIcon,
    CheckIcon,
    PlusIcon,
    ArrowUpIcon,
    Mic,
    CircleDashedIcon,
    X,
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
import { useRef, useState } from "react";

const aiModels = [
    { id: "square-3", label: "Square AI 3.0", icon: SparklesIcon },
    { id: "square-turbo", label: "Square AI Turbo", icon: SparklesIcon },
    { id: "square-pro", label: "Square AI Pro", icon: SparklesIcon },
    { id: "square-ultra", label: "Square AI Ultra", icon: SparklesIcon },
];

interface ChatInputBoxProps {
    message: string;
    onMessageChange: (value: string) => void;
    onSend: (message?: string, file?: File) => void;
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    showTools?: boolean;
    placeholder?: string;
}

export function ChatInputBox({
    message,
    onMessageChange,
    onSend,
    selectedModel,
    onModelChange,
    showTools = true,
    placeholder = "Ask anything...",
}: ChatInputBoxProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [showFileMenu, setShowFileMenu] = useState(false);

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
        if (message.trim() || uploadedFile) {
            onSend(message, uploadedFile || undefined);
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

            {/* Main Capsule Input with Glassmorphism */}
            <div className="relative flex items-end gap-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl p-2 rounded-[32px] border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-white/5">
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
                        placeholder={placeholder}
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        className="min-h-[50px] max-h-[200px] w-full resize-none border-0 bg-transparent px-2 py-3.5 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 leading-relaxed font-light"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendClick();
                            }
                        }}
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
                        disabled={!message.trim() && !uploadedFile && !isListening && !('webkitSpeechRecognition' in window)}
                        className={cn(
                            "size-10 rounded-full shrink-0 mb-0.5 mr-1 transition-all duration-300 shadow-md",
                            (message.trim() || uploadedFile)
                                ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transform hover:scale-105"
                                : "bg-black/5 dark:bg-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/20"
                        )}
                    >
                        {(message.trim() || uploadedFile) ? (
                            <ArrowUpIcon className="size-5" />
                        ) : (
                            <Mic className="size-5" />
                        )}
                    </Button>
                )}
            </div>

            {/* Bottom Tools & Model Selection (Optional) */}
            {showTools && (
                <div className="flex items-center justify-between px-2 opacity-70 hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-8 rounded-full bg-secondary/30 hover:bg-secondary/50 text-xs px-3 font-normal backdrop-blur-sm"
                        >
                            <CircleDashedIcon className="size-3.5" />
                            <span>Deep Search</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-8 rounded-full bg-secondary/30 hover:bg-secondary/50 text-xs px-3 font-normal backdrop-blur-sm"
                        >
                            <SparklesIcon className="size-3.5" />
                            <span>Think</span>
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

import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChatSidebar } from "@/components/square-chat/chat/chat-sidebar";
import { ChatMain } from "@/components/square-chat/chat/chat-main";
import { ThemeToggle } from "@/components/square-chat/theme-toggle";
import { Sheet, SheetContent } from "@/components/square-chat/ui/sheet";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/square-chat/ui/grid-pattern";
import { MenuIcon, MessageSquareX, ShieldX, ServerCrash, RefreshCw, ArrowLeft } from "lucide-react";
import { tokenUtils } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChatStore, SessionErrorType } from "@/store/chat-store";

// Error display component
function ChatErrorDisplay({
    errorType,
    errorMessage,
    onRetry,
    onGoBack
}: {
    errorType: SessionErrorType;
    errorMessage: string;
    onRetry?: () => void;
    onGoBack: () => void;
}) {
    const getErrorIcon = () => {
        switch (errorType) {
            case 'not_found':
                return <MessageSquareX className="size-16 text-muted-foreground" />;
            case 'forbidden':
                return <ShieldX className="size-16 text-destructive" />;
            case 'server_error':
            case 'invalid_id':
            default:
                return <ServerCrash className="size-16 text-orange-500" />;
        }
    };

    const getErrorTitle = () => {
        switch (errorType) {
            case 'not_found':
                return 'ไม่พบการสนทนานี้';
            case 'forbidden':
                return 'ไม่มีสิทธิ์เข้าถึง';
            case 'invalid_id':
                return 'รหัสการสนทนาไม่ถูกต้อง';
            case 'server_error':
            default:
                return 'เกิดข้อผิดพลาด';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            {getErrorIcon()}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">{getErrorTitle()}</h2>
                <p className="text-muted-foreground max-w-md">{errorMessage}</p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onGoBack} className="gap-2">
                    <ArrowLeft className="size-4" />
                    กลับไปหน้า Chat
                </Button>
                {errorType === 'server_error' && onRetry && (
                    <Button onClick={onRetry} className="gap-2">
                        <RefreshCw className="size-4" />
                        ลองใหม่
                    </Button>
                )}
            </div>
        </div>
    );
}

// Loading skeleton component
function ChatLoadingSkeleton() {
    return (
        <div className="flex flex-col h-full p-8 gap-4">
            <div className="flex items-center gap-3 animate-pulse">
                <div className="size-10 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 mt-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`animate-pulse space-y-2 ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                            <div className={`h-16 bg-muted rounded-2xl ${i % 2 === 0 ? 'w-64' : 'w-48'}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ChatPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { sessionId } = useParams<{ sessionId?: string }>();
    const { toast } = useToast();
    const {
        fetchSessions,
        setSessionFromUrl,
        fetchMessages,
        resetConversation,
        sessionError,
        clearSessionError,
        isLoadingMessages,
    } = useChatStore();

    // Validate session ID format (should be a UUID)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValidSessionId = (id: string | undefined): boolean => {
        if (!id) return false;
        return UUID_REGEX.test(id);
    };

    // Fetch sessions only once on mount
    useEffect(() => {
        if (tokenUtils.isLoggedIn()) {
            fetchSessions();
        }
    }, []); // Empty dependency array = only run once on mount

    // Handle URL-based session navigation
    useEffect(() => {
        // Handle trailing slash redirect
        if (location.pathname === '/chat/') {
            navigate('/chat', { replace: true });
            return;
        }

        if (!tokenUtils.isLoggedIn()) {
            toast({
                title: "กรุณาเข้าสู่ระบบ",
                description: "คุณต้องเข้าสู่ระบบก่อนใช้งาน Chat AI",
                variant: "destructive",
            });
            // Store the intended destination for redirect after login
            const returnUrl = location.pathname;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return;
        }

        // Clear any previous errors
        clearSessionError();

        // Handle URL-based session
        if (sessionId) {
            // Validate session ID format
            if (!isValidSessionId(sessionId)) {
                // Invalid ID format - redirect to /chat
                toast({
                    title: "รหัสไม่ถูกต้อง",
                    description: "รหัสการสนทนาไม่ถูกต้อง",
                    variant: "destructive",
                });
                navigate('/chat', { replace: true });
                return;
            }

            // Check current state BEFORE updating - to determine if we need to fetch messages
            const currentState = useChatStore.getState();
            const isAlreadyOnThisSession = currentState.selectedSessionId === sessionId;
            const hasMessagesForThisSession = isAlreadyOnThisSession && currentState.messages.length > 0;
            // Check if currently streaming - if so, don't interrupt with a fetch
            const isCurrentlyStreaming = currentState.isSending || currentState.isStreaming;

            console.log("🔄 Session navigation:", {
                urlSessionId: sessionId,
                currentSelectedId: currentState.selectedSessionId,
                isAlreadyOnThisSession,
                hasMessagesForThisSession,
                isCurrentlyStreaming,
                messagesCount: currentState.messages.length,
            });

            // Set the session from URL
            setSessionFromUrl(sessionId);

            // Only skip fetch if:
            // 1. We're already on this session with messages (navigating back to same session)
            // 2. OR we're currently streaming (don't interrupt active stream)
            const shouldSkipFetch = hasMessagesForThisSession || isCurrentlyStreaming;

            console.log("📥 Should fetch messages:", !shouldSkipFetch);

            if (!shouldSkipFetch) {
                fetchMessages(sessionId);
            }
        } else {
            // New chat mode - reset conversation
            resetConversation();
        }
    }, [sessionId, location.pathname, navigate, toast, setSessionFromUrl, fetchMessages, resetConversation, clearSessionError]);

    const handleGoBack = () => {
        clearSessionError();
        navigate('/chat');
    };

    const handleRetry = () => {
        if (sessionId && isValidSessionId(sessionId)) {
            clearSessionError();
            fetchMessages(sessionId);
        }
    };

    // Render error state
    const renderContent = () => {
        if (sessionError) {
            return (
                <ChatErrorDisplay
                    errorType={sessionError.type}
                    errorMessage={sessionError.message}
                    onRetry={sessionError.type === 'server_error' ? handleRetry : undefined}
                    onGoBack={handleGoBack}
                />
            );
        }

        if (isLoadingMessages && sessionId) {
            return <ChatLoadingSkeleton />;
        }

        return <ChatMain />;
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="hidden md:block w-64 border-r border-border">
                <ChatSidebar />
            </div>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent
                    side="left"
                    className="w-64 p-0 border-none [&>button]:hidden"
                >
                    <ChatSidebar />
                </SheetContent>
            </Sheet>

            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                <div className="flex md:hidden items-center justify-between border-b border-border px-4 h-14 bg-background z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <MenuIcon className="size-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="hidden md:flex absolute top-4 right-4 gap-2 z-20">
                    <ThemeToggle />
                </div>

                <div className="flex-1 min-h-0 overflow-hidden relative">
                    <GridPattern className="pointer-events-none absolute inset-0" />

                    <div className="relative z-10 h-full min-h-0 overflow-hidden">
                        {renderContent()}
                    </div>
                </div>
            </div >
        </div >
    );
}

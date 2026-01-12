import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    SearchIcon,
    HomeIcon,
    SparklesIcon,
    Target,
    BarChart3,
    Apple,
    ZapIcon,
    MessageCircleDashedIcon,
    BoxIcon,
    ChevronDownIcon,
    UsersIcon,
    CheckIcon,
    MoreVerticalIcon,
    PencilIcon,
    Trash2Icon,
    Plus,
    LogOut,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/square-chat/ui/logo";
import { useChatStore } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import { tokenUtils } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatSearchDialog } from "./chat-search-dialog";

const iconMap = {
    zap: ZapIcon,
    "message-circle-dashed": MessageCircleDashedIcon,

    box: BoxIcon,
};

export function ChatSidebar() {
    const navigate = useNavigate();
    const { profile } = useProfile();
    const { profilePicture } = useProfilePicture();

    const {
        sessions,
        selectedSessionId,
        isLoadingSessions,
        selectSession,
        fetchSessions,
        createSession,
        deleteSession,
    } = useChatStore();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isChatsCollapsed, setIsChatsCollapsed] = useState(false);
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);

    // Fetch sessions on mount
    useEffect(() => {
        fetchSessions();
    }, []);

    const handleNewChat = async () => {
        selectSession(null); // Reset to welcome screen
        navigate("/chat"); // Navigate to new chat URL
    };

    const handleLogout = () => {
        tokenUtils.removeToken();
        navigate("/login");
    };

    const handleSelectSession = (sessionId: string) => {
        navigate(`/chat/${sessionId}`);
    };

    const handleDeleteSession = async (sessionId: string) => {
        await deleteSession(sessionId);
        // If deleted session was selected, navigate to new chat
        if (selectedSessionId === sessionId) {
            navigate("/chat");
        }
    };

    return (
        <div className="flex h-full w-full flex-col bg-sidebar border-r border-sidebar-border">
            {/* Header with user profile */}
            <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2.5 px-2 h-10"
                        >
                            <Logo className="size-6" />
                            <span className="font-semibold text-sm">Square AI</span>
                            <div className="ml-auto flex items-center gap-1.5">
                                <Avatar className="size-5">
                                    <AvatarImage src={profilePicture || ""} alt="User" />
                                    <AvatarFallback className="text-xs">
                                        {profile?.first_name?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <ChevronDownIcon className="size-3" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                        <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                            <User className="size-4" />
                            <span>{profile?.first_name || "โปรไฟล์"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                            <LogOut className="size-4" />
                            <span>ออกจากระบบ</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* New Chat Button */}
            <div className="p-3">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleNewChat}
                >
                    <Plus className="size-4" />
                    <span className="text-sm">New Chat</span>
                </Button>
            </div>

            {/* Search Button */}
            <div className="px-3 pb-3">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-[34px] bg-muted/50 hover:bg-muted"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <SearchIcon className="size-4" />
                    <span className="text-sm text-muted-foreground">Search chats...</span>
                </Button>
            </div>

            {/* Navigation Links */}
            <div className="px-3 pb-3 space-y-1">
                <button
                    onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-accent/50 rounded-md transition-colors group"
                >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Menu
                    </p>
                    <svg
                        className={cn(
                            "size-4 text-muted-foreground transition-transform duration-200",
                            isNavCollapsed && "-rotate-90"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {!isNavCollapsed && (
                    <div className="space-y-1 pt-1">
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                            <Link to="/dashboard">
                                <HomeIcon className="size-4" />
                                <span className="text-sm">Dashboard</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                            <Link to="/ai-insights">
                                <SparklesIcon className="size-4" />
                                <span className="text-sm">AI Insights</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                            <Link to="/health-goals">
                                <Target className="size-4" />
                                <span className="text-sm">Health Goals</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                            <Link to="/exercise-log">
                                <BarChart3 className="size-4" />
                                <span className="text-sm">Exercise Log</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                            <Link to="/food-log">
                                <Apple className="size-4" />
                                <span className="text-sm">Food Log</span>
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Chat Sessions */}
            <div className="flex-1 overflow-y-auto no-scrollbar" data-lenis-prevent>
                <div className="p-3 space-y-4">
                    <div className="space-y-1">
                        <button
                            onClick={() => setIsChatsCollapsed(!isChatsCollapsed)}
                            className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-accent/50 rounded-md transition-colors group"
                        >
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Recent Chats
                            </p>
                            <svg
                                className={cn(
                                    "size-4 text-muted-foreground transition-transform duration-200",
                                    isChatsCollapsed && "-rotate-90"
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {!isChatsCollapsed && (
                            <>

                                {isLoadingSessions ? (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                        กำลังโหลด...
                                    </div>
                                ) : sessions.length === 0 ? (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                        ยังไม่มีการสนทนา
                                    </div>
                                ) : (
                                    sessions.map((session) => {
                                        const Icon =
                                            iconMap[session.icon as keyof typeof iconMap] ||
                                            MessageCircleDashedIcon;
                                        const isActive = selectedSessionId === session.id;
                                        return (
                                            <div
                                                key={session.id}
                                                className={cn(
                                                    "group/item relative flex items-center rounded-md overflow-hidden",
                                                    isActive && "bg-sidebar-accent"
                                                )}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "flex-1 justify-start gap-2 px-2 text-left h-auto py-1.5 min-w-0 pr-8",
                                                        isActive ? "hover:bg-sidebar-accent" : "hover:bg-accent"
                                                    )}
                                                    onClick={() => handleSelectSession(session.id)}
                                                >
                                                    <Icon className="size-4 shrink-0" />
                                                    <span className="text-sm truncate min-w-0">
                                                        {session.title}
                                                    </span>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="absolute right-1 size-7 opacity-0 group-hover/item:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                                                        >
                                                            <MoreVerticalIcon className="size-4" />
                                                            <span className="sr-only">More</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        className="w-48"
                                                        side="right"
                                                        align="start"
                                                    >
                                                        <DropdownMenuItem>
                                                            <PencilIcon className="size-4 text-muted-foreground" />
                                                            <span>Rename</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteSession(session.id)}
                                                        >
                                                            <Trash2Icon className="size-4" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        );
                                    })
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>


            {/* Search Dialog */}
            <ChatSearchDialog
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
            />
        </div>
    );
}

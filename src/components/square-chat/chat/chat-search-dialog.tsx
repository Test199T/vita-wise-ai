import { useState, useMemo } from "react";
import { SearchIcon, SquarePen, MessageCircle, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store/chat-store";
import { cn } from "@/lib/utils";

interface ChatSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChatSearchDialog({ open, onOpenChange }: ChatSearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const { sessions, selectSession } = useChatStore();

    // Filter sessions based on search query
    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return sessions;
        return sessions.filter(session =>
            session.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sessions, searchQuery]);

    // Categorize sessions by date
    const categorizedSessions = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const categories = {
            today: [] as typeof sessions,
            yesterday: [] as typeof sessions,
            older: [] as typeof sessions,
        };

        filteredSessions.forEach(session => {
            const sessionDate = new Date(session.updatedAt);
            const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

            if (sessionDay.getTime() === today.getTime()) {
                categories.today.push(session);
            } else if (sessionDay.getTime() === yesterday.getTime()) {
                categories.yesterday.push(session);
            } else {
                categories.older.push(session);
            }
        });

        return categories;
    }, [filteredSessions]);

    const handleSelectChat = (sessionId: string) => {
        selectSession(sessionId);
        onOpenChange(false);
        setSearchQuery("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background/95 backdrop-blur-sm border-border/50 max-h-[90vh] flex flex-col [&>button]:hidden">
                <DialogHeader className="p-0 shrink-0">
                    {/* Search Header */}
                    <div className="relative flex items-center border-b border-border/50 px-4 py-3">
                        <SearchIcon className="absolute left-7 size-5 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาแชท..."
                            className="pl-12 pr-10 h-11 bg-transparent border-0 focus-visible:ring-0 text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute right-4 p-1.5 rounded-md hover:bg-accent transition-colors"
                        >
                            <X className="size-5 text-muted-foreground" />
                        </button>
                    </div>
                </DialogHeader>

                {/* Search Results - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {/* New Chat Option */}
                    <div className="px-4 pt-4 pb-2">
                        <button
                            onClick={() => {
                                selectSession(null);
                                onOpenChange(false);
                                setSearchQuery("");
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                        >
                            <div className="flex items-center justify-center size-8 rounded-full bg-muted">
                                <SquarePen className="size-4 text-foreground" />
                            </div>
                            <span className="font-medium">แชทใหม่</span>
                        </button>
                    </div>

                    {/* Today's Chats */}
                    {categorizedSessions.today.length > 0 && (
                        <div className="px-4 pb-4">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                                วันนี้
                            </h3>
                            <div className="space-y-1">
                                {categorizedSessions.today.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => handleSelectChat(session.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                                    >
                                        <MessageCircle className="size-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm truncate">{session.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Yesterday's Chats */}
                    {categorizedSessions.yesterday.length > 0 && (
                        <div className="px-4 pb-4">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                                เมื่อวาน
                            </h3>
                            <div className="space-y-1">
                                {categorizedSessions.yesterday.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => handleSelectChat(session.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                                    >
                                        <MessageCircle className="size-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm truncate">{session.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Older Chats */}
                    {categorizedSessions.older.length > 0 && (
                        <div className="px-4 pb-4">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                                เก่ากว่า
                            </h3>
                            <div className="space-y-1">
                                {categorizedSessions.older.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => handleSelectChat(session.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                                    >
                                        <MessageCircle className="size-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm truncate">{session.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {filteredSessions.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                {searchQuery ? "ไม่พบผลลัพธ์" : "ยังไม่มีการสนทนา"}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

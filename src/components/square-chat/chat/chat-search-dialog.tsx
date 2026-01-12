import { useState, useEffect, useCallback } from "react";
import { SearchIcon, SquarePen, MessageCircle, X, Filter, Calendar, Image, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "@/store/chat-store";
import { useAnalyticsStore, SearchMessage } from "@/store/chat-analytics-store";
import { cn } from "@/lib/utils";

interface ChatSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChatSearchDialog({ open, onOpenChange }: ChatSearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [messageType, setMessageType] = useState<"all" | "text" | "image">("all");

    const { sessions, selectSession } = useChatStore();
    const { searchResults, isSearching, searchMessages, clearSearch } = useAnalyticsStore();
    const navigate = useNavigate();

    // Debounced search
    const handleSearch = useCallback(() => {
        if (searchQuery.trim().length >= 2) {
            searchMessages({
                query: searchQuery,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                messageType: messageType !== "all" ? messageType : undefined,
            });
        } else {
            clearSearch();
        }
    }, [searchQuery, startDate, endDate, messageType, searchMessages, clearSearch]);

    // Search on query change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    // Clear on close
    useEffect(() => {
        if (!open) {
            setSearchQuery("");
            setShowFilters(false);
            setStartDate("");
            setEndDate("");
            setMessageType("all");
            clearSearch();
        }
    }, [open, clearSearch]);

    const handleSelectSession = (sessionId: string) => {
        // Navigate to chat with session
        navigate(`/chat/${sessionId}`);
        onOpenChange(false);
        setSearchQuery("");
    };

    const handleNewChat = () => {
        navigate("/chat");
        onOpenChange(false);
        setSearchQuery("");
    };

    // Highlight search term in text
    const highlightText = (text: string, query: string) => {
        if (!query.trim()) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // When not searching, show sessions filtered locally
    const filteredSessions = sessions.filter(session =>
        !searchQuery.trim() || session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] p-0 gap-0 bg-background/95 backdrop-blur-sm border-border/50 max-h-[85vh] flex flex-col [&>button]:hidden">
                <DialogHeader className="p-0 shrink-0">
                    {/* Search Header */}
                    <div className="relative flex items-center border-b border-border/50 px-4 py-3">
                        <SearchIcon className="absolute left-7 size-5 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาข้อความ..."
                            className="pl-12 pr-24 h-11 bg-transparent border-0 focus-visible:ring-0 text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <div className="absolute right-4 flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "h-8 px-2",
                                    showFilters && "bg-accent"
                                )}
                            >
                                <Filter className="size-4" />
                            </Button>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-1.5 rounded-md hover:bg-accent transition-colors"
                            >
                                <X className="size-5 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="px-4 py-3 border-b border-border/50 bg-muted/30 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-8 w-36 text-sm"
                                    placeholder="วันที่เริ่ม"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-8 w-36 text-sm"
                                    placeholder="วันที่สิ้นสุด"
                                />
                            </div>
                            <Select value={messageType} onValueChange={(v) => setMessageType(v as any)}>
                                <SelectTrigger className="h-8 w-32 text-sm">
                                    <SelectValue placeholder="ประเภท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    <SelectItem value="text">ข้อความ</SelectItem>
                                    <SelectItem value="image">มีรูปภาพ</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="h-8"
                            >
                                {isSearching ? <Loader2 className="size-4 animate-spin" /> : "ค้นหา"}
                            </Button>
                        </div>
                    )}
                </DialogHeader>

                {/* Search Results - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {/* New Chat Option */}
                    <div className="px-4 pt-4 pb-2">
                        <button
                            onClick={handleNewChat}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                        >
                            <div className="flex items-center justify-center size-8 rounded-full bg-muted">
                                <SquarePen className="size-4 text-foreground" />
                            </div>
                            <span className="font-medium">แชทใหม่</span>
                        </button>
                    </div>

                    {/* Loading State */}
                    {isSearching && (
                        <div className="px-4 py-8 flex justify-center">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* API Search Results */}
                    {!isSearching && searchResults && searchResults.messages.length > 0 && (
                        <div className="px-4 pb-4">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                                ผลการค้นหา ({searchResults.pagination.total} รายการ)
                            </h3>
                            <div className="space-y-2">
                                {searchResults.messages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => handleSelectSession(msg.sessionId)}
                                        className="w-full flex flex-col gap-1 px-3 py-3 rounded-lg hover:bg-accent transition-colors text-left border border-border/30"
                                    >
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {msg.hasImage && <Image className="size-3" />}
                                            <span className="font-medium text-foreground">{msg.sessionTitle}</span>
                                            <span>•</span>
                                            <span>{formatDate(msg.timestamp)}</span>
                                        </div>
                                        <p className="text-sm line-clamp-2">
                                            {highlightText(msg.content, searchQuery)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            {searchResults.pagination.hasMore && (
                                <p className="text-center text-xs text-muted-foreground mt-3">
                                    แสดง {searchResults.messages.length} จาก {searchResults.pagination.total} รายการ
                                </p>
                            )}
                        </div>
                    )}

                    {/* No Search Results */}
                    {!isSearching && searchResults && searchResults.messages.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                ไม่พบผลลัพธ์สำหรับ "{searchQuery}"
                            </p>
                        </div>
                    )}

                    {/* Local Session List (when not searching API) */}
                    {!searchResults && !isSearching && filteredSessions.length > 0 && (
                        <div className="px-4 pb-4">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                                แชทล่าสุด
                            </h3>
                            <div className="space-y-1">
                                {filteredSessions.slice(0, 10).map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => handleSelectSession(session.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                                    >
                                        <MessageCircle className="size-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm truncate">{session.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Sessions */}
                    {!searchResults && !isSearching && filteredSessions.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                ยังไม่มีการสนทนา
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

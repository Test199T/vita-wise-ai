import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatSidebar } from "@/components/square-chat/chat/chat-sidebar";
import { ChatMain } from "@/components/square-chat/chat/chat-main";
import { ThemeToggle } from "@/components/square-chat/theme-toggle";
import { Sheet, SheetContent } from "@/components/square-chat/ui/sheet";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/square-chat/ui/grid-pattern";
import { MenuIcon } from "lucide-react";
import { tokenUtils } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChatStore } from "@/store/chat-store";

export default function ChatPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { fetchSessions } = useChatStore();

    // Check auth and fetch sessions on mount
    useEffect(() => {
        if (!tokenUtils.isLoggedIn()) {
            toast({
                title: "กรุณาเข้าสู่ระบบ",
                description: "คุณต้องเข้าสู่ระบบก่อนใช้งาน Chat AI",
                variant: "destructive",
            });
            navigate("/login");
            return;
        }

        // Fetch sessions
        fetchSessions();
    }, [navigate, toast, fetchSessions]);

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
                        <ChatMain />
                    </div>
                </div>
            </div >
        </div >
    );
}

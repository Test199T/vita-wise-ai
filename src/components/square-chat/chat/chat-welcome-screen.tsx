import { Button } from "@/components/ui/button";
import { Logo } from "@/components/square-chat/ui/logo";
import { cn } from "@/lib/utils";
import {
    ActivityIcon,
    UtensilsIcon,
    DumbbellIcon,
    MoonIcon,
} from "lucide-react";
import { ChatInputBox } from "./chat-input-box";
import DecryptedText from "@/components/DecryptedText";

const suggestions = [
    {
        id: "analyze",
        label: "วิเคราะห์สุขภาพ",
        message: "ช่วยวิเคราะห์สุขภาพเบื้องต้นให้หน่อย",
        icon: ActivityIcon
    },
    {
        id: "food",
        label: "แนะนำอาหาร",
        message: "ช่วยแนะนำเมนูอาหารเพื่อสุขภาพสำหรับวันนี้",
        icon: UtensilsIcon
    },
    {
        id: "exercise",
        label: "แผนออกกำลังกาย",
        message: "ช่วยออกแบบตารางออกกำลังกายสำหรับผู้เริ่มต้น",
        icon: DumbbellIcon
    },
    {
        id: "sleep",
        label: "ปรึกษาการนอน",
        message: "ฉันมีปัญหาเรื่องการนอนหลับ ช่วยแนะนำหน่อย",
        icon: MoonIcon
    },
];

interface ChatWelcomeScreenProps {
    message: string;
    onMessageChange: (value: string) => void;
    onSend: (message?: string, file?: File) => void;
    selectedMode: string;
    onModeChange: (modeId: string) => void;
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}

export function ChatWelcomeScreen({
    message,
    onMessageChange,
    onSend,
    selectedMode,
    onModeChange,
    selectedModel,
    onModelChange,
}: ChatWelcomeScreenProps) {
    return (
        <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
            <div className="w-full max-w-[640px] space-y-9 -mt-12">
                <div className="flex justify-center">
                    <div className="flex items-center justify-center size-8 rounded-full">
                        <Logo className="size-20" />
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        <DecryptedText
                            text="สวัสดี! ฉันคือผู้ช่วย AI สุขภาพของคุณ"
                            animateOn="view"
                            speed={40}
                            maxIterations={15}
                            sequential={true}
                            revealDirection="start"
                            className="text-foreground"
                            encryptedClassName="text-foreground"
                        />
                    </h1>
                    <p className="text-2xl text-foreground">
                        <DecryptedText
                            text="วันนี้ให้ฉันช่วยดูแลเรื่องอะไรดี?"
                            animateOn="view"
                            speed={35}
                            maxIterations={12}
                            sequential={true}
                            revealDirection="start"
                            className="text-foreground"
                            encryptedClassName="text-foreground"
                        />
                    </p>
                </div>

                <ChatInputBox
                    message={message}
                    onMessageChange={onMessageChange}
                    onSend={onSend}
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    showTools={true}
                />

                <div className="flex flex-wrap items-center justify-center gap-2">
                    {suggestions.map((item) => (
                        <Button
                            key={item.id}
                            variant="outline"
                            className="gap-2 bg-background/50 hover:bg-accent hover:text-accent-foreground border-border/50"
                            onClick={() => onSend(item.message)}
                        >
                            <item.icon className="size-4 text-primary" />
                            <span>{item.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Square AI can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}

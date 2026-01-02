import {
    Activity,
    UtensilsCrossed,
    Dumbbell,
    Moon,
    Droplets,
    Target,
    LayoutDashboard,
    MessageSquare,
    Camera,
    Apple,
    Heart,
    FileText,
    Shield,
    HelpCircle,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavLinkItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    description?: string;
};

export const featureLinks: NavLinkItem[] = [
    {
        label: "บันทึกอาหาร & โภชนาการ",
        href: "#food-log",
        description: "ถ่ายรูปหรือพิมพ์ AI วิเคราะห์แคลอรี่อัตโนมัติ",
        icon: UtensilsCrossed,
    },
    {
        label: "บันทึกการออกกำลังกาย",
        href: "#exercise-log",
        description: "บันทึกกิจกรรมและแคลอรี่ที่เผาผลาญ",
        icon: Dumbbell,
    },
    {
        label: "บันทึกการนอน & น้ำดื่ม",
        href: "#sleep-water",
        description: "ติดตามชั่วโมงนอนและปริมาณน้ำ",
        icon: Moon,
    },
    {
        label: "ตั้งเป้าหมายสุขภาพ",
        href: "#health-goals",
        description: "กำหนดเป้าหมายและติดตามความคืบหน้า",
        icon: Target,
    },
];

export const workflowLinks: NavLinkItem[] = [
    {
        label: "Dashboard ภาพรวม",
        href: "#dashboard",
        description: "ดูสรุปสุขภาพรายวันและรายสัปดาห์",
        icon: LayoutDashboard,
    },
    {
        label: "Chat AI ส่วนตัว",
        href: "#chat-ai",
        description: "สอบถามเรื่องสุขภาพกับ AI ตลอด 24 ชม.",
        icon: MessageSquare,
    },
    {
        label: "วิเคราะห์รูปอาหาร",
        href: "#food-ai",
        description: "ถ่ายรูปแล้วรู้แคลอรี่ทันที",
        icon: Camera,
    },
    {
        label: "คำแนะนำโภชนาการ",
        href: "#nutrition-advice",
        description: "รับคำแนะนำเฉพาะบุคคล",
        icon: Apple,
    },
];

export const companyLinks: NavLinkItem[] = [
    {
        label: "เกี่ยวกับเรา",
        href: "#about",
        description: "เรียนรู้เพิ่มเติมเกี่ยวกับทีมของเรา",
        icon: Users,
    },
    {
        label: "Health Score",
        href: "#health-score",
        description: "ระบบคะแนนสุขภาพอัจฉริยะ",
        icon: Heart,
    },
];

export const companyLinks2: NavLinkItem[] = [
    {
        label: "เงื่อนไขการใช้งาน",
        href: "#terms",
        icon: FileText,
    },
    {
        label: "นโยบายความเป็นส่วนตัว",
        href: "#privacy",
        icon: Shield,
    },
    {
        label: "ศูนย์ช่วยเหลือ",
        href: "#help",
        icon: HelpCircle,
    },
];

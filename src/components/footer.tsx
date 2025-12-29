import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Activity,
    FacebookIcon,
    GithubIcon,
    InstagramIcon,
    LinkedinIcon,
    TwitterIcon,
    YoutubeIcon,
} from "lucide-react";

export function Footer() {
    const company = [
        {
            title: "เกี่ยวกับเรา",
            href: "#",
        },
        {
            title: "ติดต่อเรา",
            href: "#",
        },
        {
            title: "นโยบายความเป็นส่วนตัว",
            href: "#",
        },
        {
            title: "เงื่อนไขการใช้งาน",
            href: "#",
        },
    ];

    const resources = [
        {
            title: "ฟีเจอร์",
            href: "#",
        },
        {
            title: "ราคา",
            href: "#",
        },
        {
            title: "บทความสุขภาพ",
            href: "#",
        },
        {
            title: "คำถามที่พบบ่อย (FAQ)",
            href: "#",
        },
    ];

    const socialLinks = [
        {
            icon: FacebookIcon,
            link: "#",
        },
        {
            icon: GithubIcon,
            link: "#",
        },
        {
            icon: InstagramIcon,
            link: "#",
        },
        {
            icon: LinkedinIcon,
            link: "#",
        },
        {
            icon: TwitterIcon,
            link: "#",
        },
        {
            icon: YoutubeIcon,
            link: "#",
        },
    ];
    return (
        <footer className="relative w-full bg-[#f9f9f9]">
            <div
                className={cn(
                    "mx-auto max-w-6xl lg:border-x-dashed-wide bg-[#f9f9f9]",
                    "dark:bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)]"
                )}
            >
                <div className="absolute -translate-x-1/2 left-1/2 top-0 w-screen border-t border-dashed border-slate-300" />
                <div className="grid max-w-6xl grid-cols-6 gap-6 p-4">
                    <div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-sky-400 to-teal-500 p-2 rounded-xl text-white shadow-md">
                                <Activity size={20} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-slate-900 text-lg">Vita Wise AI</span>
                        </div>
                        <p className="max-w-sm text-balance font-prompt text-muted-foreground text-sm">
                            เพื่อนคู่คิดสุขภาพของคุณ ใช้งานง่าย วิเคราะห์แม่นยำด้วย AI เพื่อสุขภาพที่ดีขึ้นอย่างยั่งยืน
                        </p>
                        <div className="flex gap-2">
                            {socialLinks.map((item, index) => (
                                <Button
                                    key={`social-${item.link}-${index}`}
                                    size="icon"
                                    variant="outline"
                                    className="w-8 h-8 rounded-full"
                                >
                                    <a href={item.link} target="_blank">
                                        <item.icon className="size-3.5" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-muted-foreground text-xs font-semibold">บริการ</span>
                        <div className="mt-2 flex flex-col gap-2">
                            {resources.map(({ href, title }) => (
                                <a
                                    className="w-max text-sm hover:underline text-slate-600"
                                    href={href}
                                    key={title}
                                >
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-muted-foreground text-xs font-semibold">บริษัท</span>
                        <div className="mt-2 flex flex-col gap-2">
                            {company.map(({ href, title }) => (
                                <a
                                    className="w-max text-sm hover:underline text-slate-600"
                                    href={href}
                                    key={title}
                                >
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute -translate-x-1/2 left-1/2 w-screen border-t border-dashed border-slate-300" />
                <div className="flex max-w-6xl flex-col justify-between gap-2 py-4 px-4">
                    <p className="text-center font-light text-muted-foreground text-sm">
                        &copy; {new Date().getFullYear()} Vita Wise AI Health Automation. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

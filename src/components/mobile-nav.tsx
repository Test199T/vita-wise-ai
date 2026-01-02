import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuIcon, XIcon } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { featureLinks, workflowLinks } from "@/components/nav-links";
import { LinkItem } from "@/components/link-item";
import { Link } from "react-router-dom";

export function MobileNav() {
    const [open, setOpen] = React.useState(false);
    const { isMobile, isTablet } = useMediaQuery();
    const shouldShow = isMobile || isTablet;

    // Disable body scroll when open
    React.useEffect(() => {
        if (open && shouldShow) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open, shouldShow]);

    return (
        <>
            <Button
                aria-controls="mobile-menu"
                aria-expanded={open}
                aria-label="Toggle menu"
                className="md:hidden relative"
                onClick={() => setOpen(!open)}
                size="icon"
                variant="outline"
            >
                <div
                    className={cn(
                        "transition-all absolute",
                        open ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                >
                    <XIcon aria-hidden="true" className="size-4" />
                </div>
                <div
                    className={cn(
                        "transition-all absolute",
                        open ? "scale-0 opacity-0" : "scale-100 opacity-100"
                    )}
                >
                    <MenuIcon aria-hidden="true" className="size-4" />
                </div>
            </Button>
            {open &&
                createPortal(
                    <div
                        className={cn(
                            "bg-white/95 backdrop-blur-md",
                            "fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-t border-slate-200 md:hidden"
                        )}
                        id="mobile-menu"
                    >
                        <div
                            className={cn(
                                "animate-in fade-in-0 zoom-in-95 duration-200",
                                "size-full overflow-y-auto overflow-x-hidden p-4"
                            )}
                        >
                            <div className="flex w-full flex-col gap-y-1">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-2">ฟีเจอร์</span>
                                {featureLinks.map((link) => (
                                    <LinkItem key={`feature-${link.label}`} {...link} />
                                ))}

                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-2 mt-2">การทำงาน</span>
                                {workflowLinks.map((link) => (
                                    <LinkItem key={`workflow-${link.label}`} {...link} />
                                ))}

                                <a
                                    href="#pricing"
                                    className="flex items-center gap-3 rounded-lg p-3 mt-2 hover:bg-slate-50 transition-colors"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="text-sm font-medium text-slate-900">ราคา</span>
                                </a>
                            </div>

                            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-6">
                                <Button className="w-full" variant="outline" asChild>
                                    <Link to="/login" onClick={() => setOpen(false)}>เข้าสู่ระบบ</Link>
                                </Button>
                                <Button className="w-full bg-slate-900 hover:bg-slate-800" asChild>
                                    <Link to="/register" onClick={() => setOpen(false)}>เริ่มต้นใช้งาน</Link>
                                </Button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

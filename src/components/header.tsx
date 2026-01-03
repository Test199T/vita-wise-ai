"use client";

import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
    const scrolled = useScroll(10);


    return (
        <div className="fixed top-4 left-0 right-0 z-[99] flex justify-center px-4">
            <nav className={cn(
                "flex h-16 w-full max-w-[1240px] items-center justify-between rounded-2xl px-4 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)",
                scrolled
                    ? "bg-white/75 backdrop-blur-2xl backdrop-saturate-200 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04),0_20px_40px_-10px_rgba(56,189,248,0.15),0_20px_40px_-10px_rgba(139,92,246,0.15)] ring-1 ring-white/60 supports-[backdrop-filter]:bg-white/50"
                    : "bg-transparent border border-dashed border-slate-300/60 shadow-none hover:bg-sky-50/20 hover:border-sky-300/50 hover:shadow-[0_0_20px_-5px_rgba(14,165,233,0.15)] hover:backdrop-blur-sm"
            )}>
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center group">
                        <div className="relative w-11 h-11 flex items-center justify-center">
                            {/* Base gradient layer */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-teal-600" />
                            {/* Secondary color mesh */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-tl from-violet-500/40 via-transparent to-rose-400/30" />
                            {/* Animated glow pulse */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 animate-pulse" />
                            {/* Top shine */}
                            <div className="absolute inset-x-1 top-1 h-3 rounded-t-lg bg-gradient-to-b from-white/40 to-transparent" />
                            {/* Inner shadow for depth */}
                            <div className="absolute inset-[1px] rounded-[11px] shadow-inner shadow-black/10" />
                            {/* Icon */}
                            <Activity size={24} className="relative text-white drop-shadow-md" strokeWidth={2.5} />
                        </div>
                    </Link>



                    <DesktopNav />
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <Button variant="ghost" className="h-8 text-slate-600 hover:text-slate-900 text-xs font-medium px-3 border border-dashed border-slate-400 rounded-xl hover:border-slate-800 hover:shadow-sm hover:bg-transparent" asChild>
                        <Link to="/login">เข้าสู่ระบบ</Link>
                    </Button>
                    <Button className="h-8 bg-slate-900 hover:bg-slate-800 text-xs font-medium px-4 rounded-xl shadow-md" asChild>
                        <Link to="/register">เริ่มต้นใช้งาน</Link>
                    </Button>
                </div>

                <MobileNav />
            </nav>
        </div>
    );
}

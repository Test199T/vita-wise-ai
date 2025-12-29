import { Link } from "react-router-dom";
import { ShinyButton } from "@/components/ui/shiny-button";
import { HeroHighlight } from "@/components/ui/hero-highlight";

export function CallToAction() {
    return (
        <section className="w-full bg-[#f9f9f9]">
            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center border-x-dashed-wide py-24 text-center">
                {/* Top Full-Width Border */}


                <div className="w-full px-4 md:px-12">
                    <HeroHighlight
                        containerClassName="relative w-full overflow-hidden rounded-[2.5rem] border border-dashed border-slate-300 !bg-white/50 !h-auto"
                        className="py-16 md:py-24"
                    >
                        {/* Background Gradients - Subtle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/40 via-sky-100/40 to-transparent blur-3xl rounded-full pointer-events-none opacity-60" />

                        <div className="relative z-10 space-y-8 max-w-3xl mx-auto px-4">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight font-heading">
                                ไม่มีขีดจำกัดในการ <br className="hidden sm:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                                    ดูแลสุขภาพ
                                </span>{" "}
                                ด้วย AI
                            </h2>

                            <div className="text-base md:text-xl text-slate-600 leading-relaxed font-light font-prompt px-2">
                                <p>
                                    "สุขภาพดีขึ้นได้จริง โดยไม่ต้องพยายามจนเกินไป" <br className="hidden sm:block" />
                                    <span className="text-slate-500">สงสัยใช่ไหม? </span>
                                    <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                                        ลองพิสูจน์
                                    </strong>
                                    <span className="text-slate-500"> ด้วยตัวคุณเอง</span>
                                </p>
                            </div>

                            <div className="pt-4">
                                <Link to="/register">
                                    <ShinyButton className="px-8 py-4 text-base font-semibold min-w-[200px]">
                                        เริ่มต้นใช้งานฟรี
                                    </ShinyButton>
                                </Link>
                            </div>
                        </div>
                    </HeroHighlight>
                </div>

                {/* Bottom Full-Width Border */}
                <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b-dashed-wide" />
            </div>
        </section>
    );
}

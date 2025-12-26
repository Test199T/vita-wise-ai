import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ShinyButton } from "@/components/ui/shiny-button";

export function CallToAction() {
    return (
        <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24 px-4">
            <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-between gap-y-6 rounded-2xl md:rounded-[2.5rem] border border-slate-200 bg-white px-4 py-12 md:py-20 shadow-xl overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-100/50 blur-[80px] md:blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-sky-100/50 blur-[80px] md:blur-[120px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6 md:space-y-8">
                    <div className="space-y-4 md:space-y-6">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight font-heading">
                            ไม่มีขีดจำกัดในการ <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                                ดูแลสุขภาพ
                            </span>{" "}
                            ด้วย AI
                        </h2>
                        <div className="text-sm md:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed font-light font-prompt px-2">
                            <p>
                                "สุขภาพดีขึ้นได้จริง โดยไม่ต้องพยายามจนเกินไป" <br className="hidden sm:block" />
                                <span className="text-slate-500">สงสัยใช่ไหม? </span>
                                <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500 cursor-pointer hover:opacity-80 transition-opacity">
                                    ลองพิสูจน์
                                </strong>
                                <span className="text-slate-500"> ด้วยตัวคุณเอง</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center pt-2">
                        <Link to="/register">
                            <ShinyButton className="px-6 py-3 text-sm font-semibold">
                                เริ่มต้นใช้งานฟรี
                            </ShinyButton>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

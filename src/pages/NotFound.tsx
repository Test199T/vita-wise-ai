import { useLocation, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function NotFound() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Add noindex meta tag
    const meta = document.createElement('meta');
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
        const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

        setMousePos({
          x: Math.max(-1, Math.min(1, deltaX)) * 6,
          y: Math.max(-1, Math.min(1, deltaY)) * 4
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 30%, #f0fdfa 70%, #ecfdf5 100%)'
      }}
    >
      {/* Dreamy atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(186,230,253,0.6) 100%)',
              left: `${10 + (i * 7)}%`,
              top: `${15 + (i % 4) * 20}%`,
              boxShadow: '0 0 6px rgba(186,230,253,0.8)'
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Soft clouds */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-16 rounded-full opacity-40"
          style={{ background: 'radial-gradient(ellipse, white 0%, transparent 70%)' }}
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-40 h-20 rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, white 0%, transparent 70%)' }}
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Ethereal glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #bae6fd 0%, #99f6e4 50%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl mx-auto flex flex-col items-center"
      >
        {/* Cute Ghost Mascot */}
        <div className="relative mb-8">
          {/* Ghost's ethereal glow */}
          <motion.div
            className="absolute inset-0 -z-10 scale-125 blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(186,230,253,0.5) 0%, rgba(153,246,228,0.3) 50%, transparent 70%)'
            }}
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1.2, 1.4, 1.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Main Ghost */}
          <motion.div
            className="relative"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {/* Ghost Body */}
            <div
              className="relative w-40 h-48 flex flex-col items-center pt-8"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 50%, rgba(226,232,240,0.7) 100%)',
                borderRadius: '80px 80px 30px 30px',
                boxShadow: `
                  0 20px 50px rgba(148,163,184,0.15),
                  0 8px 25px rgba(148,163,184,0.1),
                  inset 0 -20px 40px rgba(148,163,184,0.1),
                  inset 0 10px 30px rgba(255,255,255,1)
                `,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 70% 85%, 55% 100%, 40% 85%, 25% 100%, 10% 85%, 0% 100%)'
              }}
            >
              {/* Ghost face highlight */}
              <div
                className="absolute top-6 left-6 w-12 h-10 rounded-full opacity-80"
                style={{
                  background: 'radial-gradient(ellipse, rgba(255,255,255,1) 0%, transparent 70%)'
                }}
              />

              {/* Confused Eyes */}
              <div className="flex gap-6 items-center justify-center mt-4">
                {/* Left Eye */}
                <div
                  className="w-10 h-12 rounded-[50%] flex items-center justify-center relative"
                  style={{
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.3), inset 0 2px 4px rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Pupil with confused look */}
                  <motion.div
                    className="absolute rounded-full bg-white"
                    style={{ width: '16px', height: '16px' }}
                    animate={{
                      x: mousePos.x,
                      y: mousePos.y
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-sky-200 rounded-full opacity-80" />
                  </motion.div>

                  {/* Worried eyebrow */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full rotate-[15deg]"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, #cbd5e1 50%, transparent 100%)' }}
                  />
                </div>

                {/* Right Eye */}
                <div
                  className="w-10 h-12 rounded-[50%] flex items-center justify-center relative"
                  style={{
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.3), inset 0 2px 4px rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Pupil */}
                  <motion.div
                    className="absolute rounded-full bg-white"
                    style={{ width: '16px', height: '16px' }}
                    animate={{
                      x: mousePos.x,
                      y: mousePos.y
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-sky-200 rounded-full opacity-80" />
                  </motion.div>

                  {/* Worried eyebrow */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full -rotate-[15deg]"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, #cbd5e1 50%, transparent 100%)' }}
                  />
                </div>
              </div>

              {/* Blush */}
              <div className="flex justify-between w-28 mt-1">
                <motion.div
                  className="w-6 h-3 rounded-full"
                  style={{ background: 'radial-gradient(ellipse, rgba(251,191,198,0.6) 0%, transparent 70%)' }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-6 h-3 rounded-full"
                  style={{ background: 'radial-gradient(ellipse, rgba(251,191,198,0.6) 0%, transparent 70%)' }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
              </div>

              {/* Confused "O" Mouth */}
              <motion.div
                className="mt-2 w-5 h-6 rounded-full border-2 border-slate-400"
                style={{ background: 'linear-gradient(180deg, #475569 0%, #334155 100%)' }}
                animate={{
                  scaleY: [1, 1.2, 1, 0.9, 1],
                  scaleX: [1, 0.9, 1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Ghost's little arms holding magnifying glass */}
              <div className="absolute top-1/2 -right-8 transform translate-y-2">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Arm */}
                  <div
                    className="w-8 h-4 rounded-full -rotate-45"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(226,232,240,0.8) 100%)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  {/* Magnifying glass */}
                  <div className="absolute -right-4 -top-2">
                    <Search className="w-5 h-5 text-teal-500/70" />
                  </div>
                </motion.div>
              </div>

              {/* Left arm waving */}
              <motion.div
                className="absolute top-1/2 -left-6 w-6 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(226,232,240,0.8) 100%)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
                animate={{ rotate: [20, 40, 20] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Question marks floating around */}
            <motion.span
              className="absolute -top-4 -right-2 text-2xl"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5],
                rotate: [0, 10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ❓
            </motion.span>
            <motion.span
              className="absolute top-8 -left-6 text-lg"
              animate={{
                y: [0, -5, 0],
                opacity: [0.3, 0.7, 0.3],
                rotate: [0, -15, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              ❔
            </motion.span>
          </motion.div>

          {/* 404 Badge */}
          <motion.div
            className="absolute -right-6 bottom-8 px-3 py-1.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,250,0.9) 100%)',
              boxShadow: '0 8px 25px rgba(20,184,166,0.15), 0 4px 10px rgba(0,0,0,0.05)',
              border: '1px solid rgba(153,246,228,0.5)'
            }}
            animate={{
              y: [0, -5, 0],
              rotate: [8, 12, 8]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="text-base font-bold"
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              404
            </span>
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 max-w-sm text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-700 tracking-tight">
            อ๊ะ! หาหน้านี้ไม่เจออ่ะ~ 👻
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mx-auto">
            น้องผีหลงทางจัง...<br />
            หน้าที่คุณตามหาอาจจะหายไปแล้ว<br />
            หรือลิงก์อาจผิดพลาด
          </p>

          <div className="flex items-center justify-center pt-3">
            <Link to="/">
              <RainbowButton className="h-11 px-7 min-w-[180px] font-semibold shadow-lg shadow-teal-500/15 group">
                <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                พาน้องกลับบ้าน
              </RainbowButton>
            </Link>
          </div>

          <div className="pt-4 opacity-40 hover:opacity-100 transition-opacity">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/80 border border-sky-100 text-xs text-slate-400 font-mono">
              <span>หาไม่เจอ:</span>
              <span className="max-w-[200px] truncate">{location.pathname}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

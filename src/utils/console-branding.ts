/**
 * Console Branding & Security Warning for Production
 * แสดงข้อความใน Console สำหรับ Production Environment
 * 
 * ✨ Premium Console Experience - Responsive & Beautiful
 */

// Dynamic console access - terser จะไม่ลบเพราะไม่ใช่ direct console.log call
const _console = (typeof window !== 'undefined' ? window : globalThis).console;

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 STYLES - Premium gradient & visual effects
// ═══════════════════════════════════════════════════════════════════════════════

const styles = {
    // Logo box - gradient background
    logoBox: [
        'background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'border: 2px solid #14b8a6',
        'border-radius: 12px',
        'padding: 20px 30px',
        'font-family: "SF Mono", Monaco, monospace',
        'font-size: 14px',
        'font-weight: bold',
        'color: #14b8a6',
        'text-shadow: 0 0 20px rgba(20, 184, 166, 0.5)',
        'line-height: 1.4',
    ].join(';'),

    // Brand name - gold gradient
    brandName: [
        'background: linear-gradient(90deg, #FFD700, #FFA500, #FF8C00)',
        '-webkit-background-clip: text',
        '-webkit-text-fill-color: transparent',
        'background-clip: text',
        'font-family: system-ui, -apple-system, sans-serif',
        'font-size: 28px',
        'font-weight: 800',
        'letter-spacing: -0.5px',
        'padding: 8px 0',
    ].join(';'),

    // Tagline
    tagline: [
        'color: #14b8a6',
        'font-family: system-ui, -apple-system, sans-serif',
        'font-size: 14px',
        'font-weight: 500',
        'padding: 4px 0',
    ].join(';'),

    // Badge style
    badge: [
        'background: linear-gradient(135deg, #14b8a6, #0d9488)',
        'color: white',
        'padding: 6px 14px',
        'border-radius: 20px',
        'font-size: 11px',
        'font-weight: 600',
        'font-family: system-ui, -apple-system, sans-serif',
    ].join(';'),

    // Warning box
    warningBox: [
        'background: linear-gradient(135deg, #451a03 0%, #78350f 100%)',
        'border: 1px solid #f59e0b',
        'border-radius: 8px',
        'padding: 12px 20px',
        'color: #fbbf24',
        'font-size: 13px',
        'font-family: system-ui, -apple-system, sans-serif',
        'line-height: 1.6',
    ].join(';'),

    // Info text
    info: [
        'color: #94a3b8',
        'font-size: 12px',
        'font-family: system-ui, -apple-system, sans-serif',
        'line-height: 1.6',
    ].join(';'),

    // Link style  
    link: [
        'color: #60a5fa',
        'font-size: 12px',
        'font-family: system-ui, -apple-system, sans-serif',
    ].join(';'),

    // Dev mode badge
    devMode: [
        'background: linear-gradient(90deg, #14b8a6, #0d9488)',
        'color: white',
        'padding: 10px 20px',
        'border-radius: 8px',
        'font-weight: bold',
        'font-size: 14px',
        'font-family: system-ui, -apple-system, sans-serif',
    ].join(';'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 CONSOLE BRANDING - Main function
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * แสดงข้อความ Branding และ Security Warning ใน Console
 */
export function showConsoleBranding(): void {
    const isProduction = import.meta.env.PROD;

    if (!isProduction) {
        _console.log(
            '%c🌿 Vita Wise AI — Development Mode',
            styles.devMode
        );
        return;
    }

    try {
        // ━━━ Compact Logo Box ━━━
        _console.log(
            `%c
  ╭──────────────────────────────────────╮
  │                                      │
  │   ██╗   ██╗██╗████████╗ █████╗       │
  │   ██║   ██║██║╚══██╔══╝██╔══██╗      │
  │   ██║   ██║██║   ██║   ███████║      │
  │   ╚██╗ ██╔╝██║   ██║   ██╔══██║      │
  │    ╚████╔╝ ██║   ██║   ██║  ██║      │
  │     ╚═══╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝      │
  │                                      │
  │   ██╗    ██╗██╗███████╗███████╗      │
  │   ██║    ██║██║██╔════╝██╔════╝      │
  │   ██║ █╗ ██║██║███████╗█████╗        │
  │   ██║███╗██║██║╚════██║██╔══╝        │
  │   ╚███╔███╔╝██║███████║███████╗      │
  │    ╚══╝╚══╝ ╚═╝╚══════╝╚══════╝      │
  │                                      │
  ╰──────────────────────────────────────╯
            `,
            styles.logoBox
        );

        // ━━━ Brand Name ━━━
        _console.log('%c✨ VITA WISE AI', styles.brandName);

        // ━━━ Tagline ━━━
        _console.log('%c🌿 AI-Powered Health & Wellness Platform', styles.tagline);
        _console.log('%c   ดูแลสุขภาพครบวงจรด้วย AI อัจฉริยะ', styles.tagline);

        _console.log('');

        // ━━━ Security Warning ━━━
        _console.log(
            `%c⚠️  ข้อควรระวัง — Developer Console Only

   ❌  อย่า copy/paste โค้ดจากคนแปลกหน้า
   ❌  อาจทำให้บัญชีถูกโจมตีได้
   🔒  รักษาความปลอดภัยบัญชีของคุณ`,
            styles.warningBox
        );

        _console.log('');

        // ━━━ Build Info ━━━
        const buildDate = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        _console.log(`%c📦 Version 1.0.0  •  🗓️ ${buildDate}`, styles.info);

        // ━━━ Links ━━━
        _console.log('%c💼 Careers → ppansiun@outlook.co.th', styles.link);
        _console.log('%c🌐 Website → vita-wise-ai.vercel.app', styles.link);

        _console.log('');

    } catch {
        // Silent fail - ไม่ทำอะไรหากเกิด error
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 AUTO-EXECUTE
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showConsoleBranding);
    } else {
        showConsoleBranding();
    }
}

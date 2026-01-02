/**
 * Console Branding & Security Warning for Production
 * แสดงข้อความใน Console สำหรับ Production Environment
 * 
 * Note: ใช้ dynamic console access เพื่อหลีก terser drop_console
 */

// Dynamic console access - terser จะไม่ลบเพราะไม่ใช่ direct console.log call
const _console = (typeof window !== 'undefined' ? window : globalThis).console;

// ASCII Art Logo with gradient effect
const LOGO_ART = `
    ██╗   ██╗██╗████████╗ █████╗     ██╗    ██╗██╗███████╗███████╗
    ██║   ██║██║╚══██╔══╝██╔══██╗    ██║    ██║██║██╔════╝██╔════╝
    ██║   ██║██║   ██║   ███████║    ██║ █╗ ██║██║███████╗█████╗  
    ╚██╗ ██╔╝██║   ██║   ██╔══██║    ██║███╗██║██║╚════██║██╔══╝  
     ╚████╔╝ ██║   ██║   ██║  ██║    ╚███╔███╔╝██║███████║███████╗
      ╚═══╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝     ╚══╝╚══╝ ╚═╝╚══════╝╚══════╝
`;

const TAGLINE = `
                    🌿 AI-Powered Health & Wellness Platform 🌿
                      ดูแลสุขภาพครบวงจรด้วย AI อัจฉริยะ
`;

const DIVIDER = `
════════════════════════════════════════════════════════════════════════════
`;

const SECURITY_TITLE = `
    ⚠️  ข้อควรระวัง
`;

const SECURITY_BODY = `
    นี่คือพื้นที่สำหรับนักพัฒนาเท่านั้น
    
    ❌ อย่า copy/paste โค้ดจากคนแปลกหน้าที่นี่
    ❌ อาจทำให้บัญชีของคุณถูกโจมตีได้
    
    🔒 รักษาความปลอดภัยบัญชีของคุณ
`;

const BUILD_INFO = `    📦 v1.0.0  •  🗓️ ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`;

const FOOTER = `
    💼 Join our team → ppansiun@outlook.co.th
    🌐 Visit us → vita-wise-ai.vercel.app
`;

// Gradient style presets
const styles = {
    // Gold gradient for logo
    logoGold: 'font-family: monospace; font-size: 10px; font-weight: bold; background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 20px rgba(255,215,0,0.5);',

    // Teal gradient for tagline
    taglineTeal: 'font-family: system-ui; font-size: 13px; color: #14b8a6; font-weight: 500;',

    // Divider style
    divider: 'color: #4a5568; font-size: 10px;',

    // Warning - amber/orange
    warningTitle: 'font-size: 18px; font-weight: bold; color: #f59e0b; text-shadow: 0 0 10px rgba(245,158,11,0.3);',

    // Warning body
    warningBody: 'font-size: 12px; color: #9ca3af; line-height: 1.8;',

    // Build info - subtle gray
    buildInfo: 'font-size: 11px; color: #6b7280;',

    // Footer - blue accent
    footer: 'font-size: 11px; color: #60a5fa;',

    // Dev mode
    devMode: 'background: linear-gradient(90deg, #14b8a6, #0d9488); color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px;',
};

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
        // Clear for clean slate (optional)
        // _console.clear();

        // 1. Main Logo with gold gradient
        _console.log('%c' + LOGO_ART, 'color: #FFD700; font-family: monospace; font-size: 10px; font-weight: bold; text-shadow: 0 0 15px rgba(255,215,0,0.4);');

        // 2. Tagline
        _console.log('%c' + TAGLINE, styles.taglineTeal);

        // 3. Divider
        _console.log('%c' + DIVIDER, styles.divider);

        // 4. Security Warning Title
        _console.log('%c' + SECURITY_TITLE, styles.warningTitle);

        // 5. Security Warning Body
        _console.log('%c' + SECURITY_BODY, styles.warningBody);

        // 6. Divider
        _console.log('%c' + DIVIDER, styles.divider);

        // 7. Build Info
        _console.log('%c' + BUILD_INFO, styles.buildInfo);

        // 8. Footer
        _console.log('%c' + FOOTER, styles.footer);

        // 9. Final spacing
        _console.log('');

    } catch {
        // Silent fail
    }
}

// Auto-execute
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showConsoleBranding);
    } else {
        showConsoleBranding();
    }
}

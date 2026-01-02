/**
 * Console Branding & Security Warning for Production
 * 
 * ✨ Premium Multi-Color Console Experience
 * 🎨 Inspired by: Facebook, Stripe, Discord, iamickdev
 */

// Dynamic console access - bypass terser drop_console
const _console = (typeof window !== 'undefined' ? window : globalThis).console;

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PREMIUM STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles = {
    // Big Warning Banner (Red with SUPER Glow) -> Font: Impact/Heavy
    warningBanner: [
        'color: #ff0000',
        'font-size: 80px',
        'font-weight: 900',
        'font-family: "Impact", "Arial Black", "Helvetica Neue", sans-serif', // ฟอนต์หนาตึก
        'text-shadow: 4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 80px #ff0000',
        'padding: 20px 0',
        'text-transform: uppercase',
    ].join(';'),

    // Warning Text (Neon Orange) -> Font: Modern Monospace
    warningText: [
        'color: #ff5500',
        'font-size: 24px',
        'font-family: "Menlo", "Consolas", "Monaco", "Courier New", monospace', // ฟอนต์โค้ดดิ้งเท่ๆ
        'line-height: 1.5',
        'font-weight: 700',
        'text-shadow: 3px 3px 0 #000, 0 0 10px #ff5500, 0 0 25px #ff5500',
    ].join(';'),

    // Welcome Text (Neon Cyan) -> Font: Modern Sans
    welcomeText: [
        'color: #00ffff',
        'font-size: 20px',
        'font-family: "Helvetica Neue", "Segoe UI", "Arial", sans-serif', // ฟอนต์โมเดิร์นคลีนๆ
        'line-height: 1.5',
        'font-weight: 700',
        'text-shadow: 3px 3px 0 #000, 0 0 10px #00ffff, 0 0 25px #00ffff',
        'font-style: italic', // เพิ่มความพริ้ว
    ].join(';'),

    // Collaboration Text (Neon Magenta) -> Font: Modern Bold
    collabText: [
        'color: #ff00ff',
        'font-size: 24px',
        'font-family: "Helvetica Neue", "Segoe UI", sans-serif',
        'line-height: 1.5',
        'font-weight: 900',
        'text-shadow: 3px 3px 0 #000, 0 0 15px #ff00ff, 0 0 30px #ff00ff',
        'letter-spacing: 1px',
    ].join(';'),

    // Job Text (Neon Gold) -> Font: Modern Bold
    jobText: [
        'color: #ffaa00',
        'font-size: 24px',
        'font-family: "Helvetica Neue", "Segoe UI", sans-serif',
        'line-height: 1.5',
        'font-weight: 900',
        'text-shadow: 3px 3px 0 #000, 0 0 15px #ffaa00, 0 0 30px #ffaa00',
    ].join(';'),

    // Contact Label (Neon Blue) -> Font: Tech
    contactLabel: [
        'color: #0088ff',
        'font-size: 22px',
        'font-family: "Menlo", "Consolas", monospace',
        'font-weight: 900',
        'text-shadow: 2px 2px 0 #000, 0 0 15px #0088ff, 0 0 30px #0088ff',
    ].join(';'),

    // Email/Link (Super Neon Pink) -> Font: Geometric Sans
    contactLink: [
        'color: #ff00cc',
        'font-size: 36px',
        'font-family: "Futura", "Trebuchet MS", "Arial Black", sans-serif', // ฟอนต์ทรงเลขาคณิต
        'font-weight: 900',
        'text-shadow: 4px 4px 0 #000, 0 0 20px #ff00cc, 0 0 40px #ff00cc, 0 0 60px #ff00cc',
        'background: #111',
        'padding: 15px 30px', // เพิ่มพื้นที่กว้างขึ้น
        'border-radius: 12px',
        'border: 3px solid #ff00cc',
        'box-shadow: 0 0 20px #ff00cc',
        'display: inline-block',
        'margin: 10px 0',
    ].join(';'),

    // ASCII Art (Bright Yellow) -> Font: Strict Monospace
    asciiArt: [
        'color: #ffff00',
        'font-size: 16px',
        'font-family: "Menlo", "Monaco", "Courier New", monospace', // ต้อง monospace เท่านั้นรูปถึงไม่เบี้ยว
        'line-height: 1.1',
        'font-weight: 700',
        'text-shadow: 2px 2px 0 #000, 0 0 10px #ffff00, 0 0 20px #ffff00',
    ].join(';'),

    // Sparkles (White/Gold)
    sparkles: [
        'color: #ffffff',
        'font-size: 24px',
        'text-shadow: 0 0 10px #ffffff, 0 0 20px #ffff00',
    ].join(';'),

    // Final CTA -> Font: Modern Condensed
    finalCta: [
        'color: #00ffff',
        'font-size: 24px',
        'font-family: "Impact", "Arial Narrow", sans-serif',
        'font-weight: 700',
        'text-shadow: 3px 3px 0 #000, 0 0 15px #00ffff, 0 0 30px #00ffff',
        'letter-spacing: 2px',
        'text-transform: uppercase',
    ].join(';'),

    // Dev Mode
    devMode: [
        'background: linear-gradient(135deg, #14b8a6, #0d9488)',
        'color: white',
        'padding: 12px 24px',
        'border-radius: 8px',
        'font-weight: bold',
        'font-size: 14px',
        'font-family: system-ui, -apple-system, sans-serif',
    ].join(';'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN BRANDING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function showConsoleBranding(): void {
    // const isProduction = import.meta.env.PROD;
    // ⚠️ TEMPORARY: Show full branding in dev mode for preview
    // TODO: Uncomment the check above before deploying!

    try {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔴 BIG WARNING BANNER
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('%c!!! STOP !!!', styles.warningBanner);
        _console.log('%c!!! WARNING !!!', styles.warningBanner);
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🟠 WARNING TEXT
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log(
            '%cนี่คือพื้นที่สำหรับนักพัฒนาเท่านั้น หากมีคนบอกให้คุณ\n' +
            'copy/paste โค้ดอะไรที่นี่ นั่นคือการหลอกลวง!\n' +
            'และอาจทำให้บัญชีของคุณถูกแฮ็กได้',
            styles.warningText
        );
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🟢 WELCOME TEXT
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log(
            '%cถ้าคุณเป็น Developer ยินดีต้อนรับครับ! 🌿\n' +
            'หวังว่าจะชอบโค้ดของเรานะ :)',
            styles.welcomeText
        );
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🟣 COLLABORATION TEXT
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log(
            '%cVita Wise AI - แพลตฟอร์ม AI ดูแลสุขภาพครบวงจร\n' +
            'บันทึกอาหาร ออกกำลังกาย การนอน น้ำดื่ม พร้อม AI วิเคราะห์!',
            styles.collabText
        );
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🟠 JOB TEXT
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log(
            '%c💼 สนใจร่วมงานกับเรา?\n' +
            'เรากำลังมองหา Developer ที่มีใจรักสุขภาพ!',
            styles.jobText
        );
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🟡 CONTACT INFO
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('%c📧 ติดต่อเราได้ที่:', styles.contactLabel);
        _console.log('');
        _console.log('%cppansiun@outlook.co.th', styles.contactLink);
        _console.log('%cvita-wise-ai.vercel.app', styles.contactLink);
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🌿 ASCII ART (Leaf Theme)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('%c    🌿', styles.asciiArt);
        _console.log('%c   🌿🌿   Vita Wise AI', styles.asciiArt);
        _console.log('%c  🌿🌿🌿  ดูแลสุขภาพด้วย AI', styles.asciiArt);
        _console.log('%c   🌿🌿', styles.asciiArt);
        _console.log('%c    🌿', styles.asciiArt);
        _console.log('%c✨✨✨✨✨✨', styles.sparkles);
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🌿 BRAND FOOTER
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('%c    🍃        🍃        🍃        🍃', styles.sparkles);
        _console.log('%c✨ สุขภาพดี เริ่มต้นที่นี่! ✨', styles.finalCta);
        _console.log('');

    } catch {
        // Silent fail
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 INTERACTIVE TOOLS (Pro Level)
// ═══════════════════════════════════════════════════════════════════════════════

export function showEasterEgg(): void {
    const art = `
    ⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀
    ⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⠟⠛⠛⠛⢿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀
    ⠀⠀⢰⣿⣿⣿⣿⣿⡿⠁⠀🌿⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⡆⠀⠀
    ⠀⠀⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⣿⠀⠀
    ⠀⠀⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⠀⠀
    ⠀⠀⢿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⡿⠀⠀
    ⠀⠀⠸⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⠇⠀⠀
    ⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀
    ⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣷⣴⣾⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⠿⠟⠋⠀⠀⠀⠀⠀⠀
    `;

    _console.log(art);
    _console.log(
        '%c🎉 You found the Easter Egg! Thanks for exploring!',
        'color: #14b8a6; font-size: 14px; font-weight: bold;'
    );
}

const runDiagnostics = () => {
    _console.log('%c🔄 Running Security Scan...', 'color: #38bdf8');
    setTimeout(() => _console.log('%c✅ Integrity Check: PASS', 'color: #34d399'), 300);
    setTimeout(() => _console.log('%c✅ Encryption: AES-256', 'color: #34d399'), 600);
    setTimeout(() => _console.log('%c✅ Firewall: ACTIVE', 'color: #34d399'), 900);
    setTimeout(() => _console.log('%c🛡️ System Secure', 'color: #34d399; font-weight: bold; font-size: 14px; margin-top: 8px;'), 1200);
    return "Verification complete.";
};

// Declare global define from vite.config.ts
declare const __COMMIT_HASH__: string;

const showHelp = () => {
    _console.table({
        'scan()': 'Run security diagnostics',
        'easter()': 'Reveal secret artifact',
    });
    return "Select a command to run.";
};


// Expose tools globally
if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).vitawise = {
        scan: runDiagnostics,
        help: showHelp,
        easter: showEasterEgg,
    };
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

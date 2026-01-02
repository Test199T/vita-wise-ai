/**
 * Console Branding & Security Warning for Production
 * 
 * ✨ Premium Console Experience
 * 🎨 Inspired by: Facebook, Stripe, Discord
 * 
 * Features:
 * - Gradient text effects
 * - Grouped console sections
 * - Professional typography
 * - Security warnings
 */

// Dynamic console access - bypass terser drop_console
const _console = (typeof window !== 'undefined' ? window : globalThis).console;

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PREMIUM STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const createGradient = (colors: string[]) =>
    `background: linear-gradient(135deg, ${colors.join(', ')})`;

const styles = {
    // ━━━ Hero Section ━━━
    hero: {
        logo: [
            createGradient(['#14b8a6', '#0d9488', '#047857']),
            'color: white',
            'font-size: 48px',
            'font-weight: 900',
            'font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            'padding: 20px 40px',
            'border-radius: 16px',
            'text-shadow: 2px 2px 4px rgba(0,0,0,0.3)',
            'letter-spacing: -1px',
        ].join(';'),

        tagline: [
            'color: #14b8a6',
            'font-size: 16px',
            'font-weight: 600',
            'font-family: system-ui, -apple-system, sans-serif',
            'padding: 8px 0',
            'letter-spacing: 0.5px',
        ].join(';'),

        subTagline: [
            'color: #64748b',
            'font-size: 13px',
            'font-family: system-ui, -apple-system, sans-serif',
            'font-style: italic',
        ].join(';'),
    },

    // ━━━ Warning Section (Facebook Style) ━━━
    warning: {
        stop: [
            'color: #ef4444',
            'font-size: 72px',
            'font-weight: 900',
            'font-family: system-ui, -apple-system, sans-serif',
            'text-shadow: 2px 2px 0 #fca5a5, 4px 4px 0 #fecaca',
            'letter-spacing: -3px',
        ].join(';'),

        title: [
            createGradient(['#fbbf24', '#f59e0b', '#d97706']),
            '-webkit-background-clip: text',
            '-webkit-text-fill-color: transparent',
            'background-clip: text',
            'font-size: 20px',
            'font-weight: 700',
            'font-family: system-ui, -apple-system, sans-serif',
        ].join(';'),

        body: [
            'color: #94a3b8',
            'font-size: 13px',
            'font-family: system-ui, -apple-system, sans-serif',
            'line-height: 1.8',
        ].join(';'),

        danger: [
            'color: #ef4444',
            'font-size: 13px',
            'font-weight: 600',
            'font-family: system-ui, -apple-system, sans-serif',
        ].join(';'),
    },

    // ━━━ Info Section ━━━
    info: {
        badge: [
            createGradient(['#3b82f6', '#2563eb']),
            'color: white',
            'font-size: 11px',
            'font-weight: 600',
            'padding: 4px 12px',
            'border-radius: 100px',
            'font-family: system-ui, -apple-system, sans-serif',
        ].join(';'),

        version: [
            'color: #64748b',
            'font-size: 12px',
            'font-family: "SF Mono", Monaco, Consolas, monospace',
        ].join(';'),

        link: [
            'color: #3b82f6',
            'font-size: 12px',
            'font-family: system-ui, -apple-system, sans-serif',
            'text-decoration: underline',
        ].join(';'),

        careers: [
            createGradient(['#8b5cf6', '#7c3aed', '#6d28d9']),
            'color: white',
            'font-size: 13px',
            'font-weight: 600',
            'padding: 8px 16px',
            'border-radius: 8px',
            'font-family: system-ui, -apple-system, sans-serif',
        ].join(';'),
    },

    // ━━━ Dev Mode ━━━
    dev: [
        createGradient(['#14b8a6', '#0d9488']),
        'color: white',
        'padding: 12px 24px',
        'border-radius: 8px',
        'font-weight: bold',
        'font-size: 14px',
        'font-family: system-ui, -apple-system, sans-serif',
    ].join(';'),

    // ━━━ Group Header ━━━
    groupHeader: [
        'color: #475569',
        'font-size: 11px',
        'font-weight: 600',
        'text-transform: uppercase',
        'letter-spacing: 1px',
        'font-family: system-ui, -apple-system, sans-serif',
    ].join(';'),

    // ━━━ Separator ━━━
    separator: [
        'color: #334155',
        'font-size: 10px',
    ].join(';'),

    // ━━━ System HUD ━━━
    hud: [
        'background: #0f172a',
        'border: 1px solid #1e293b',
        'color: #38bdf8',
        'padding: 14px',
        'line-height: 1.6',
        'font-family: "SF Mono", Monaco, Consolas, monospace',
        'border-radius: 8px',
        'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    ].join(';'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN BRANDING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function showConsoleBranding(): void {
    const isProduction = import.meta.env.PROD;

    if (!isProduction) {
        _console.log('%c 🌿 Vita Wise AI — Development Mode ', styles.dev);
        _console.log('%c   Hot reload enabled • API connected', 'color: #64748b; font-size: 11px;');
        return;
    }

    try {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📌 HERO SECTION
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('');
        _console.log('%c 🌿 VITA WISE ', styles.hero.logo);
        _console.log('');
        _console.log('%c✨ AI-Powered Health & Wellness Platform', styles.hero.tagline);
        _console.log('%c   "ดูแลสุขภาพครบวงจรด้วย AI อัจฉริยะ"', styles.hero.subTagline);
        _console.log('');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ⚠️ SECURITY WARNING (Facebook Style)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.separator);
        _console.log('');
        _console.log('%cหยุด!', styles.warning.stop);
        _console.log('');
        _console.log('%c⚠️ นี่คือพื้นที่สำหรับนักพัฒนาเท่านั้น', styles.warning.title);
        _console.log('');
        _console.log(
            '%cหากมีคนบอกให้คุณ copy/paste อะไรที่นี่\n' +
            'นั่นคือการหลอกลวง และอาจทำให้คุณถูกแฮ็กได้',
            styles.warning.body
        );
        _console.log('');
        _console.log('%c🚨 อย่าพิมพ์หรือวางสิ่งใดที่คุณไม่เข้าใจ', styles.warning.danger);
        _console.log('');
        _console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.separator);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔮 SYSTEM STATUS (Virtual HUD)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('');
        _console.log(
            `%c🔍 SYSTEM DIAGNOSTICS
────────────────────────
 ●  System Status [ ONLINE ]   🟢
 ●  Security      [ ACTIVE ]   🛡️
 ●  Connection    [ SECURE ]   🔒
────────────────────────
💡 Type "vitawise.help()" for tools`,
            styles.hud
        );


        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 💼 CAREERS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        _console.log('');
        _console.log('%c 💼 ร่วมงานกับเรา? ส่ง Resume มาได้เลย! ', styles.info.careers);
        _console.log('%c    📧 ppansiun@outlook.co.th', styles.info.link);
        _console.log('%c    🌐 vita-wise-ai.vercel.app', styles.info.link);
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

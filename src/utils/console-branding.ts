/**
 * Console Branding & Security Warning for Production
 * แสดงข้อความใน Console สำหรับ Production Environment
 * 
 * Note: ใช้ dynamic console access เพื่อหลีก terser drop_console
 */

// Dynamic console access - terser จะไม่ลบเพราะไม่ใช่ direct console.log call
const _console = (typeof window !== 'undefined' ? window : globalThis).console;

const VITA_WISE_LOGO = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🌿  V I T A   W I S E   A I                               ║
║         ดูแลสุขภาพครบวงจรด้วย AI อัจฉริยะ                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

const SECURITY_WARNING_TITLE = '🛑 หยุด!';

const SECURITY_WARNING_BODY = `
นี่คือฟีเจอร์สำหรับนักพัฒนาเท่านั้น

หากมีคนบอกให้คุณ copy และ paste บางอย่างที่นี่
เพื่อเปิดใช้งานฟีเจอร์หรือ "แฮ็ก" บัญชีของผู้อื่น
นั่นคือการหลอกลวง และอาจทำให้บัญชีของคุณถูกขโมย

เรียนรู้เพิ่มเติม: https://vita-wise-ai.vercel.app/security
`;

const BUILD_INFO = `📦 Version: 1.0.0 | Build: ${new Date().toLocaleDateString('th-TH')}`;

const CAREERS_MESSAGE = `💼 สนใจร่วมงานกับเรา? ติดต่อ: ppansiun@outlook.co.th`;

/**
 * แสดงข้อความ Branding และ Security Warning ใน Console
 */
export function showConsoleBranding(): void {
    // ตรวจสอบว่าเป็น Production หรือไม่
    const isProduction = import.meta.env.PROD;

    if (!isProduction) {
        // ใน Development mode แสดงข้อความสั้นๆ
        _console.log(
            '%c🌿 Vita Wise AI - Development Mode',
            'color: #14b8a6; font-weight: bold; font-size: 14px;'
        );
        return;
    }

    // Production mode - แสดง Full Branding
    try {
        // Clear console ก่อน (optional)
        // _console.clear();

        // 1. Logo
        _console.log(
            '%c' + VITA_WISE_LOGO,
            'color: #14b8a6; font-weight: bold; font-size: 11px; font-family: monospace;'
        );

        // 2. Security Warning - Title (ใหญ่และแดง)
        _console.log(
            '%c' + SECURITY_WARNING_TITLE,
            'color: #ef4444; font-weight: bold; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
        );

        // 3. Security Warning - Body
        _console.log(
            '%c' + SECURITY_WARNING_BODY,
            'color: #6b7280; font-size: 14px; line-height: 1.8;'
        );

        // 4. Separator
        _console.log(
            '%c───────────────────────────────────────────',
            'color: #e5e7eb;'
        );

        // 5. Build Info
        _console.log(
            '%c' + BUILD_INFO,
            'color: #9ca3af; font-size: 11px;'
        );

        // 6. Careers
        _console.log(
            '%c' + CAREERS_MESSAGE,
            'color: #3b82f6; font-size: 11px;'
        );

    } catch {
        // Silent fail - ไม่แสดง error ใน production
    }
}

// Auto-execute เมื่อ import
if (typeof window !== 'undefined') {
    // รอให้ DOM พร้อมก่อน
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showConsoleBranding);
    } else {
        // DOM พร้อมแล้ว - แสดงทันที
        showConsoleBranding();
    }
}

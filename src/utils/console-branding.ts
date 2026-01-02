/**
 * Console Branding & Security Warning for Production
 * แสดงข้อความใน Console สำหรับ Production Environment
 */

const VITA_WISE_LOGO = `
%c
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🌿  V I T A   W I S E   A I                               ║
║         ดูแลสุขภาพครบวงจรด้วย AI อัจฉริยะ                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

const SECURITY_WARNING = `
%c🛑 หยุด!%c

นี่คือฟีเจอร์สำหรับนักพัฒนาเท่านั้น

หากมีคนบอกให้คุณ copy และ paste บางอย่างที่นี่
เพื่อเปิดใช้งานฟีเจอร์หรือ "แฮ็ก" บัญชีของผู้อื่น
นั่นคือการหลอกลวง และอาจทำให้บัญชีของคุณถูกขโมย

เรียนรู้เพิ่มเติม: https://vita-wise-ai.vercel.app/security
`;

const BUILD_INFO = `
%c📦 Build Information
───────────────────
Version: 1.0.0
Environment: Production
Build Time: ${new Date().toISOString()}
`;

const CAREERS_MESSAGE = `
%c💼 สนใจร่วมงานกับเรา?%c
เราเปิดรับนักพัฒนาที่หลงใหลในด้านสุขภาพและ AI
ติดต่อ: ppansiun@outlook.co.th
`;

/**
 * แสดงข้อความ Branding และ Security Warning ใน Console
 * จะแสดงเฉพาะใน Production mode
 */
export function showConsoleBranding(): void {
    // ตรวจสอบว่าเป็น Production หรือไม่
    const isProduction = import.meta.env.PROD;

    if (!isProduction) {
        // ใน Development mode แสดงข้อความสั้นๆ
        console.log(
            '%c🌿 Vita Wise AI - Development Mode',
            'color: #14b8a6; font-weight: bold; font-size: 14px;'
        );
        return;
    }

    // Production mode - แสดง Full Branding
    try {
        // 1. Logo
        console.log(
            VITA_WISE_LOGO,
            'color: #14b8a6; font-weight: bold; font-size: 12px; font-family: monospace;'
        );

        // 2. Security Warning
        console.log(
            SECURITY_WARNING,
            'color: #ef4444; font-weight: bold; font-size: 24px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);',
            'color: #6b7280; font-size: 14px; line-height: 1.6;'
        );

        // 3. Build Info (collapsed)
        console.groupCollapsed(
            '%c📦 Build Information',
            'color: #6b7280; font-weight: normal; font-size: 11px;'
        );
        console.log(
            BUILD_INFO,
            'color: #9ca3af; font-size: 11px; font-family: monospace;'
        );
        console.groupEnd();

        // 4. Careers Message
        console.log(
            CAREERS_MESSAGE,
            'color: #3b82f6; font-weight: bold; font-size: 12px;',
            'color: #6b7280; font-size: 11px;'
        );

    } catch (error) {
        // Silent fail - ไม่แสดง error ใน production
    }
}

/**
 * แสดง Security Warning เมื่อผู้ใช้พยายาม paste code ใน Console
 * (Optional - สำหรับป้องกันการโจมตีแบบ Self-XSS)
 */
export function enableSelfXSSProtection(): void {
    const isProduction = import.meta.env.PROD;

    if (!isProduction) return;

    // ตรวจจับเมื่อ DevTools เปิด (ไม่ 100% reliable แต่ช่วยได้)
    const devToolsWarning = () => {
        console.clear();
        showConsoleBranding();
    };

    // เพิ่ม listener สำหรับ DevTools detection (experimental)
    // Note: ไม่มีวิธีที่น่าเชื่อถือ 100% ในการตรวจจับ DevTools
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

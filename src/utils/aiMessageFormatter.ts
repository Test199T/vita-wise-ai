/**
 * AI Message Formatter Utility
 * 
 * ช่วยจัดรูปแบบข้อความ AI ให้เป็นระเบียบและเป็นมืออาชีพ
 * รองรับหลายประเภทของการตอบกลับ เช่น คำแนะนำสุขภาพ, การวิเคราะห์, คำเตือน
 */

export type MessageType = 
  | 'general'           // การสนทนาทั่วไป
  | 'health_advice'     // คำแนะนำสุขภาพ
  | 'analysis'          // การวิเคราะห์ข้อมูล
  | 'warning'           // คำเตือน
  | 'recommendation'    // คำแนะนำ
  | 'greeting'          // ทักทาย
  | 'summary';          // สรุปข้อมูล

export interface FormattedSection {
  type: 'heading' | 'paragraph' | 'list' | 'callout' | 'tip' | 'warning' | 'info';
  content: string;
  items?: string[];
  emoji?: string;
}

export interface ParsedMessage {
  type: MessageType;
  sections: FormattedSection[];
  hasStructuredContent: boolean;
}

// Emoji mappings for different content types
export const MESSAGE_EMOJIS: Record<MessageType, string> = {
  general: '💬',
  health_advice: '🏥',
  analysis: '📊',
  warning: '⚠️',
  recommendation: '💡',
  greeting: '👋',
  summary: '📋',
};

// Health-related keywords for detection
const HEALTH_KEYWORDS = [
  'สุขภาพ', 'อาหาร', 'ออกกำลังกาย', 'นอนหลับ', 'น้ำ', 'แคลอรี่',
  'โปรตีน', 'คาร์โบไฮเดรต', 'ไขมัน', 'วิตามิน', 'แร่ธาตุ',
  'ความดัน', 'น้ำตาล', 'คอเลสเตอรอล', 'BMI', 'น้ำหนัก',
  'health', 'exercise', 'sleep', 'diet', 'nutrition', 'calories',
  'protein', 'carbs', 'fat', 'vitamin', 'mineral',
];

const WARNING_KEYWORDS = [
  'ระวัง', 'เตือน', 'อันตราย', 'ควรหลีกเลี่ยง', 'ไม่ควร',
  'warning', 'caution', 'danger', 'avoid', 'risk',
];

const GREETING_PATTERNS = [
  /^(สวัสดี|หวัดดี|ดีครับ|ดีค่ะ|hello|hi|hey)/i,
  /^(ยินดีที่ได้รู้จัก|ยินดีต้อนรับ|welcome)/i,
];

const RECOMMENDATION_KEYWORDS = [
  'แนะนำ', 'ลอง', 'ควร', 'น่าจะ', 'เหมาะ', 'ดีที่สุด',
  'recommend', 'suggest', 'try', 'should', 'best',
];

/**
 * Detect the type of message based on content
 */
export function detectMessageType(content: string): MessageType {
  const lowerContent = content.toLowerCase();
  
  // Check for greeting patterns first
  if (GREETING_PATTERNS.some(pattern => pattern.test(content))) {
    return 'greeting';
  }
  
  // Check for warning keywords
  if (WARNING_KEYWORDS.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
    return 'warning';
  }
  
  // Check for analysis content (contains numbers, percentages, or data patterns)
  if (/\d+%|\d+\s*(กรัม|kcal|ml|กก\.|kg|mg)/i.test(content)) {
    return 'analysis';
  }
  
  // Check for health advice
  if (HEALTH_KEYWORDS.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
    return 'health_advice';
  }
  
  // Check for recommendations
  if (RECOMMENDATION_KEYWORDS.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
    return 'recommendation';
  }
  
  // Check for summary (contains bullet points or numbered lists)
  if (/^[\s]*[-•*]\s|^\s*\d+\./m.test(content)) {
    return 'summary';
  }
  
  return 'general';
}

/**
 * Check if content has structured markdown elements
 */
export function hasStructuredContent(content: string): boolean {
  const patterns = [
    /^#{1,6}\s/m,           // Headings
    /^[-•*]\s/m,            // Unordered lists
    /^\d+\.\s/m,            // Ordered lists
    /\*\*[^*]+\*\*/,        // Bold text
    />\s/m,                 // Blockquotes
    /```[\s\S]*?```/,       // Code blocks
    /\|.*\|.*\|/,           // Tables
  ];
  
  return patterns.some(pattern => pattern.test(content));
}

/**
 * Format a plain text message into structured markdown
 * for better readability
 */
export function enhanceMessageFormatting(content: string): string {
  const messageType = detectMessageType(content);
  let enhanced = content;
  
  // Split long paragraphs with line breaks for readability
  enhanced = enhanced.replace(/([.!?。！？])\s*(?=[ก-ฮA-Za-z])/g, '$1\n\n');
  
  // Ensure proper spacing after bullet points
  enhanced = enhanced.replace(/^([-•*])\s*/gm, '$1 ');
  
  // Add emoji prefix based on message type if not already present
  const emoji = MESSAGE_EMOJIS[messageType];
  const hasEmoji = /^[\u{1F300}-\u{1F9FF}]/u.test(enhanced.trim());
  
  if (!hasEmoji && messageType !== 'general' && messageType !== 'greeting') {
    // Only add for specific content types that benefit from visual cues
  }
  
  return enhanced;
}

/**
 * Format health metrics for display
 */
export function formatHealthMetric(
  value: number, 
  unit: string, 
  label: string,
  target?: number
): string {
  let statusEmoji = '📈';
  if (target !== undefined) {
    const percentage = (value / target) * 100;
    if (percentage >= 90 && percentage <= 110) {
      statusEmoji = '✅';
    } else if (percentage < 50 || percentage > 150) {
      statusEmoji = '⚠️';
    } else {
      statusEmoji = '📊';
    }
  }
  
  return `${statusEmoji} **${label}**: ${value.toLocaleString()} ${unit}${target ? ` (เป้าหมาย: ${target.toLocaleString()} ${unit})` : ''}`;
}

/**
 * Create a callout box for important information
 */
export function createCallout(
  type: 'info' | 'tip' | 'warning' | 'success',
  content: string
): string {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    tip: '💡',
    warning: '⚠️',
    success: '✅',
  };
  
  return `> ${icons[type]} **${type === 'tip' ? 'เคล็ดลับ' : type === 'warning' ? 'คำเตือน' : type === 'success' ? 'สำเร็จ' : 'ข้อมูล'}**\n> ${content}`;
}

/**
 * Format a list of items with proper styling
 */
export function formatList(
  items: string[], 
  style: 'bullet' | 'numbered' | 'checkbox' = 'bullet'
): string {
  return items.map((item, index) => {
    switch (style) {
      case 'numbered':
        return `${index + 1}. ${item}`;
      case 'checkbox':
        return `- [ ] ${item}`;
      default:
        return `• ${item}`;
    }
  }).join('\n');
}

/**
 * Create a summary section with title and content
 */
export function createSection(title: string, content: string, emoji?: string): string {
  const emojiPrefix = emoji ? `${emoji} ` : '';
  return `### ${emojiPrefix}${title}\n\n${content}`;
}

/**
 * Detect if message contains Thai language
 */
export function containsThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text);
}

/**
 * Get appropriate greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'สวัสดีตอนเช้าครับ ☀️';
  } else if (hour < 17) {
    return 'สวัสดีตอนบ่ายครับ 🌤️';
  } else if (hour < 21) {
    return 'สวัสดีตอนเย็นครับ 🌅';
  } else {
    return 'สวัสดีตอนดึกครับ 🌙';
  }
}

export default {
  detectMessageType,
  hasStructuredContent,
  enhanceMessageFormatting,
  formatHealthMetric,
  createCallout,
  formatList,
  createSection,
  containsThai,
  getTimeBasedGreeting,
  MESSAGE_EMOJIS,
};

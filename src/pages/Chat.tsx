import { useState, useRef, useEffect } from "react";
import {
  Send,
  Moon,
  Utensils,
  Activity,
  Brain,
  Sparkles,
  MessageCircle
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const quickQuestions = [
  {
    icon: Moon,
    text: "ช่วยแนะนำการปรับปรุงการนอนหลับ",
    color: "bg-blue-500"
  },
  {
    icon: Utensils,
    text: "แนะนำอาหารเช้าสำหรับวันนี้",
    color: "bg-orange-500"
  },
  {
    icon: Activity,
    text: "แนะนำการออกกำลังกายเบื้องต้น",
    color: "bg-green-500"
  },
  {
    icon: Brain,
    text: "วิธีลดความเครียด",
    color: "bg-purple-500"
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
      isUser: false,
      timestamp: "เมื่อสักครู่"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setTimeout(() => {
      const aiResponses = [
        "ขอบคุณสำหรับข้อมูล! จากข้อมูลที่คุณให้มา ฉันแนะนำให้คุณลองดื่มน้ำให้เพียงพอ พักผ่อนให้เพียงพอ และออกกำลังกายเบาๆ อย่างสม่ำเสมอ",
        "เป็นคำถามที่ดีเลย! สำหรับเรื่องนี้ ฉันขอแนะนำให้คุณลองเริ่มจากการปรับเปลี่ยนนิสัยเล็กๆ น้อยๆ ก่อน เช่น การกินผักผลไม้เพิ่มขึ้น",
        "ตามข้อมูลสุขภาพของคุณ ฉันคิดว่าคุณควรจะให้ความสำคัญกับการจัดการความเครียดและการนอนหลับให้เพียงพอ",
        "ขอให้ฉันวิเคราะห์ข้อมูลของคุณก่อน... ฉันแนะนำให้คุณลองทำสมาธิหายใจลึกๆ วันละ 10 นาที และเดินเร็วๆ วันละ 30 นาที",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isUser: false,
        timestamp: new Date().toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(adjustTextareaHeight, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {messages.length === 1 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  เริ่มต้นการสนทนา
                </h2>
                <p className="text-gray-600 mb-6">
                  เลือกหัวข้อด้านล่างหรือพิมพ์คำถามของคุณ
                </p>
                <div className="space-y-3">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question.text)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 ${question.color} rounded-lg flex items-center justify-center`}>
                        <question.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{question.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="max-w-2xl mx-auto space-y-4">
                {messages.slice(1).map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isUser
                        ? 'bg-blue-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}>
                        {message.isUser ? (
                          <div className="w-4 h-4 bg-white rounded-full" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={`rounded-2xl px-4 py-3 ${message.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[75%]">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  placeholder="พิมพ์ข้อความของคุณ..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  rows={1}
                  className="w-full resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-4 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-200 text-sm leading-relaxed"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${inputMessage.trim() && !isTyping
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI อาจให้ข้อมูลที่ไม่ถูกต้อง โปรดตรวจสอบข้อมูลสำคัญ
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
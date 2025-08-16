import { useState, useRef, useEffect } from "react";
import {
  Send,
  Moon,
  Utensils,
  Activity,
  Brain,
  Sparkles,
  MessageCircle,
  Plus,
  Menu,
  X,
  History,
  Edit3,
  BookOpen,
  Code2,
  Heart,
  Bot
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

const quickActions = [
  {
    icon: Edit3,
    text: "วิเคราะห์สุขภาพ",
    description: "วิเคราะห์ข้อมูลสุขภาพของฉัน"
  },
  {
    icon: BookOpen,
    text: "ให้คำแนะนำ",
    description: "แนะนำการดูแลสุขภาพ"
  },
  {
    icon: Code2,
    text: "แปลผลตรวจ",
    description: "อธิบายผลการตรวจสุขภาพ"
  },
  {
    icon: Heart,
    text: "ปรึกษาสุขภาพ",
    description: "คำปรึกษาเรื่องสุขภาพทั่วไป"
  }
];

export default function Chat() {
  // Mock chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "AI สุขภาพ (ล่าสุด)",
      lastMessage: "สวัสดี! ฉันคือ AI สุขภาพ...",
      timestamp: "เมื่อสักครู่"
    },
    {
      id: "2",
      title: "AI สุขภาพ (เมื่อวาน)",
      lastMessage: "ขอบคุณสำหรับข้อมูล! จากข้อมูลที่คุณให้มา...",
      timestamp: "เมื่อวาน"
    }
  ]);
  const [selectedSessionId, setSelectedSessionId] = useState("1");
  const [showSidebar, setShowSidebar] = useState(false);

  // Messages for selected session (mock, single session)
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

  const handleQuickAction = (actionText: string) => {
    setInputMessage(actionText);
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

  // Sidebar (Chat History) - overlay Drawer for all screens
  const Sidebar = (
    <aside className={`fixed top-0 right-0 z-40 w-80 border-l bg-white h-full transition-transform duration-200 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-semibold text-lg">ประวัติการคุย</span>
        <button className="p-2 rounded hover:bg-gray-100" onClick={() => setShowSidebar(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatSessions.map(session => (
          <div
            key={session.id}
            className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${selectedSessionId === session.id ? 'bg-blue-50 border-r-4 border-blue-400' : ''}`}
            onClick={() => { setSelectedSessionId(session.id); setShowSidebar(false); }}
          >
            <div className="font-medium truncate">{session.title}</div>
            <div className="text-xs text-gray-500 truncate">{session.lastMessage}</div>
            <div className="text-xs text-gray-400 mt-1">{session.timestamp}</div>
          </div>
        ))}
      </div>
    </aside>
  );

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-73px)] relative">
        {/* Sidebar (Right, toggleable, all screens) */}
        {Sidebar}
        {/* Overlay for all screens when sidebar open */}
        {showSidebar && (
          <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setShowSidebar(false)} />
        )}
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-muted/30">
          {/* Toggle Sidebar Button (Right top, all screens) */}
          <button
            className="absolute top-4 right-4 z-20 bg-background border rounded-full p-2 shadow-soft"
            onClick={() => setShowSidebar(true)}
            title="ประวัติการคุย"
          >
            <History className="h-5 w-5 text-primary" />
          </button>
          
          <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
            {/* Messages Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {messages.length === 1 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center w-full max-w-2xl">
                    {/* Header with icon */}
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <Bot className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-semibold text-foreground">
                          สวัสดี, มีอะไรให้ช่วยไหม?
                        </h1>
                      </div>
                    </div>
                    
                    {/* Input Field */}
                    <div className="mb-6">
                      <div className="relative">
                        <textarea
                          ref={inputRef}
                          placeholder="พิมพ์คำถามของคุณที่นี่..."
                          value={inputMessage}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
                          disabled={isTyping}
                          rows={1}
                          className="w-full resize-none bg-background border-2 border-border rounded-xl px-6 py-4 text-base focus:outline-none focus:border-primary transition-all duration-200 shadow-soft"
                          style={{ minHeight: '60px' }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            inputMessage.trim() && !isTyping
                              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.description)}
                          className="flex flex-col items-center gap-2 bg-background border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-soft transition-all duration-200 group"
                        >
                          <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {action.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-2 py-4">
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
                          <div className={`rounded-2xl px-4 py-3 shadow ${message.isUser
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
            {/* Input Area - Only show when in conversation */}
            {messages.length > 1 && (
              <div className="bg-background border-t border-border p-4">
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
                      className="w-full resize-none bg-muted border border-border rounded-2xl px-4 py-3 pr-4 focus:outline-none focus:border-primary focus:bg-background transition-all duration-200 text-sm leading-relaxed"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      inputMessage.trim() && !isTyping
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  AI อาจให้ข้อมูลที่ไม่ถูกต้อง โปรดตรวจสอบข้อมูลสำคัญ
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
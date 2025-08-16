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
    <aside className={`fixed top-0 right-0 z-40 w-80 border-l border-border bg-background h-full transition-transform duration-200 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="font-medium text-foreground">ประวัติการคุย</span>
        <button 
          className="p-1 rounded-md hover:bg-muted transition-colors" 
          onClick={() => setShowSidebar(false)}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatSessions.map(session => (
          <div
            key={session.id}
            className={`px-4 py-3 cursor-pointer border-b border-border hover:bg-muted transition-colors ${selectedSessionId === session.id ? 'bg-muted' : ''}`}
            onClick={() => { setSelectedSessionId(session.id); setShowSidebar(false); }}
          >
            <div className="font-medium text-foreground text-sm truncate">{session.title}</div>
            <div className="text-xs text-muted-foreground truncate mt-1">{session.lastMessage}</div>
            <div className="text-xs text-muted-foreground mt-1">{session.timestamp}</div>
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
          <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
        )}
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-background">
          {/* Toggle Sidebar Button (Right top, all screens) */}
          <button
            className="absolute top-6 right-6 z-20 bg-background hover:bg-muted rounded-lg p-2 transition-colors"
            onClick={() => setShowSidebar(true)}
            title="ประวัติการคุย"
          >
            <History className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
            {/* Messages Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {messages.length === 1 ? (
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="text-center w-full max-w-2xl">
                    {/* Header */}
                    <div className="mb-12">
                      <div className="inline-flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-background" />
                        </div>
                        <h1 className="text-2xl text-foreground font-normal">
                          สวัสดี มีอะไรให้ช่วยไหม?
                        </h1>
                      </div>
                    </div>
                    
                    {/* Input Field */}
                    <div className="mb-8">
                      <div className="relative">
                        <textarea
                          ref={inputRef}
                          placeholder="พิมพ์คำถามของคุณที่นี่..."
                          value={inputMessage}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
                          disabled={isTyping}
                          rows={1}
                          className="w-full resize-none bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                          style={{ minHeight: '52px' }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            inputMessage.trim() && !isTyping
                              ? 'bg-foreground text-background hover:bg-foreground/80'
                              : 'bg-transparent text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.description)}
                          className="flex flex-col items-center gap-2 bg-background border border-border rounded-lg px-3 py-4 hover:bg-muted transition-colors duration-200"
                        >
                          <action.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-foreground font-medium">
                            {action.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                    {messages.slice(1).map((message) => (
                      <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                            message.isUser
                              ? 'bg-foreground'
                              : 'bg-muted'
                          }`}>
                            {message.isUser ? (
                              <div className="w-2 h-2 bg-background rounded-full" />
                            ) : (
                              <Bot className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className={`rounded-xl px-4 py-3 ${
                            message.isUser
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-foreground'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <p className={`text-xs mt-2 ${
                              message.isUser ? 'text-background/70' : 'text-muted-foreground'
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mt-1">
                            <Bot className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="bg-muted rounded-xl px-4 py-3">
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
              <div className="border-t border-border p-4">
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
                      className="w-full resize-none bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      inputMessage.trim() && !isTyping
                        ? 'bg-foreground text-background hover:bg-foreground/80'
                        : 'bg-transparent text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
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
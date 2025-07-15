import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Moon, 
  Utensils, 
  Activity, 
  Brain,
  Sparkles,
  MessageCircle,
  Plus,
  Paperclip
} from "lucide-react";

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
    color: "primary"
  },
  {
    icon: Utensils,
    text: "แนะนำอาหารเช้าสำหรับวันนี้",
    color: "warning"
  },
  {
    icon: Activity,
    text: "แนะนำการออกกำลังกายเบื้องต้น",
    color: "accent"
  },
  {
    icon: Brain,
    text: "วิธีลดความเครียด",
    color: "secondary"
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // จำลองการตอบกลับของ AI
    setTimeout(() => {
      const aiResponses = [
        "ขอบคุณสำหรับข้อมูล! จากข้อมูลที่คุณให้มา ฉันแนะนำให้คุณ...",
        "เป็นคำถามที่ดีเลย! สำหรับเรื่องนี้ ฉันขอแนะนำให้คุณลองทำแบบนี้...",
        "ตามข้อมูลสุขภาพของคุณ ฉันคิดว่าคุณควรจะ...",
        "ขอให้ฉันวิเคราะห์ข้อมูลของคุณก่อน... ฉันแนะนำให้คุณ...",
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
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MainLayout>
      <div className="flex h-screen max-w-7xl mx-auto">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:flex md:w-64 bg-card border-r border-border flex-col">
          <div className="p-4 border-b border-border">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              การสนทนาใหม่
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                ประวัติการสนทนา
              </div>
              <div className="text-sm text-muted-foreground">
                ยังไม่มีประวัติการสนทนา
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">AI สุขภาพ</h1>
                <p className="text-sm text-muted-foreground">
                  ผู้ช่วยด้านสุขภาพส่วนตัว
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {messages.length === 1 && (
              <div className="flex-1 flex items-center justify-center p-4 md:p-6">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    เริ่มต้นการสนทนา
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    เลือกหัวข้อที่สนใจหรือพิมพ์คำถามของคุณ
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 text-left flex flex-col items-start gap-2"
                        onClick={() => handleQuickQuestion(question.text)}
                      >
                        <question.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{question.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.length > 1 && (
              <ScrollArea className="flex-1 px-4 md:px-6">
                <div className="max-w-3xl mx-auto py-6 space-y-6">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message.text}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" />
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    placeholder="พิมพ์ข้อความของคุณ..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="resize-none pr-12 min-h-[44px] rounded-lg border-border focus:border-primary"
                    disabled={isTyping}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="h-11 w-11 rounded-lg p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                AI อาจให้ข้อมูลที่ไม่ถูกต้อง โปรดตรวจสอบข้อมูลสำคัญ
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
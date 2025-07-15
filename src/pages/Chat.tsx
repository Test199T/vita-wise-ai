import { useState } from "react";
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
  MessageCircle
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
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            คุยกับ AI สุขภาพ
          </h1>
          <p className="text-muted-foreground mt-2">
            ปรึกษาเกี่ยวกับสุขภาพและรับคำแนะนำส่วนตัว
          </p>
        </div>

        {/* Quick Questions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            คำถามแนะนำ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-3 text-left"
                onClick={() => handleQuickQuestion(question.text)}
              >
                <question.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{question.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col health-stat-card">
          <CardHeader>
            <CardTitle className="text-lg">การสนทนา</CardTitle>
            <CardDescription>
              AI จะวิเคราะห์ข้อมูลสุขภาพของคุณและให้คำแนะนำที่เหมาะสม
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isTyping && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" />
                    </div>
                    <div className="bg-card border border-border rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="พิมพ์ข้อความของคุณ..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 health-input"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="health-button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
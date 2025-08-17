import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { tokenUtils } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  const [selectedSessionId, setSelectedSessionId] = useState<string>("1");
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

  // สร้าง session ใหม่ถ้ายังไม่มี
  const createNewSession = () => {
    // ใช้ timestamp ที่เล็กลงเพื่อให้เข้ากับ PostgreSQL integer
    const newSessionId = Math.floor(Date.now() / 1000).toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: `AI สุขภาพ (${new Date().toLocaleDateString('th-TH')})`,
      lastMessage: "เริ่มการสนทนาใหม่",
      timestamp: "เมื่อสักครู่"
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setSelectedSessionId(newSessionId);
    
    // รีเซ็ตข้อความ
    setMessages([{
      id: "1",
      text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
      isUser: false,
      timestamp: "เมื่อสักครู่"
    }]);
    
    return newSessionId;
  };

  // ตรวจสอบและรับ sessionId ที่ถูกต้อง
  const getValidSessionId = (): number => {
    console.log('getValidSessionId called with:', { selectedSessionId, type: typeof selectedSessionId });
    
    if (!selectedSessionId || selectedSessionId === "undefined" || selectedSessionId === "null") {
      console.warn('Invalid selectedSessionId, creating new session:', selectedSessionId);
      const newSessionId = createNewSession();
      return parseInt(newSessionId);
    }
    
    const sessionIdNum = parseInt(selectedSessionId);
    if (isNaN(sessionIdNum) || sessionIdNum <= 0) {
      console.warn('Invalid sessionId number, creating new session:', { selectedSessionId, parsed: sessionIdNum });
      const newSessionId = createNewSession();
      return parseInt(newSessionId);
    }
    
    console.log('Valid sessionId found:', { selectedSessionId, parsed: sessionIdNum });
    return sessionIdNum;
  };

  // สร้าง session เริ่มต้นเมื่อ component mount
  useEffect(() => {
    if (!selectedSessionId || selectedSessionId === "undefined" || selectedSessionId === "null") {
      console.log('Initializing default session');
      createNewSession();
    }
  }, []);

  // ตรวจสอบ token เมื่อ component mount
  useEffect(() => {
    if (!tokenUtils.isLoggedIn()) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนใช้งาน Chat AI",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    const token = tokenUtils.getValidToken();
    const currentSessionId = getValidSessionId();
    
    console.log('Token validation passed:', { 
      hasToken: !!token, 
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      isLoggedIn: tokenUtils.isLoggedIn(),
      currentSessionId,
      selectedSessionId
    });
  }, [navigate, toast]);

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

    // ตรวจสอบ token อีกครั้งก่อนส่งข้อความ
    const token = tokenUtils.getValidToken();
    if (!token) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // รับ sessionId ที่ถูกต้อง
    const validSessionId = getValidSessionId();
    
    // ตรวจสอบเพิ่มเติมว่า sessionId ถูกต้อง
    if (!validSessionId || isNaN(validSessionId) || validSessionId <= 0) {
      console.error('Invalid sessionId after validation:', { validSessionId, type: typeof validSessionId });
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถสร้าง session ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      return;
    }

    console.log('Preparing to send message with sessionId:', { 
      validSessionId, 
      type: typeof validSessionId,
      selectedSessionId,
      inputMessage: inputMessage.substring(0, 50) + '...'
    });

    // สร้างข้อความของผู้ใช้จาก inputMessage ที่แท้จริง
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(), // ใช้ข้อความที่ผู้ใช้พิมพ์จริง
      isUser: true,
      timestamp: new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // Log การส่งข้อความไปยัง AI
      console.log('Sending message to AI:', {
        message: currentInput,
        timestamp: new Date().toISOString(),
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
        tokenValid: tokenUtils.isValidToken(token),
        session_id: validSessionId,
        sessionIdType: typeof validSessionId,
        requestBody: {
          message: currentInput,
          session_id: validSessionId,
          timestamp: new Date().toISOString()
        }
      });

      const requestBody = {
        message: currentInput,
        session_id: validSessionId,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3000/ai/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // Log response จาก AI backend
      console.log('AI response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        session_id: validSessionId
      });

      if (response.ok) {
        // ตรวจสอบว่ามีข้อความจาก AI หลังบ้านหรือไม่
        console.log('AI response data structure:', data);
        
        // ดึงข้อความจาก AI หลังบ้าน - ให้ความสำคัญกับ data.data.aiMessage.message_text ก่อน
        let aiResponseText = null;
        
        // ตรวจสอบ data.data.aiMessage.message_text ก่อน (รูปแบบที่ AI หลังบ้านส่งมา)
        if (data.data && data.data.aiMessage && data.data.aiMessage.message_text) {
          aiResponseText = data.data.aiMessage.message_text;
          console.log('Found AI response in data.data.aiMessage.message_text:', aiResponseText);
        }
        
        // ถ้าไม่มีใน aiMessage ลองหาจาก field อื่นๆ
        if (!aiResponseText) {
          aiResponseText = data.message || data.response || data.ai_message || data.content || data.text || data.answer || data.reply;
          
          // ถ้าไม่มีใน field หลัก ลองดูใน choices
          if (!aiResponseText && data.choices && data.choices.length > 0) {
            aiResponseText = data.choices[0].message?.content;
          }
          
          // ถ้าไม่มีใน choices ลองดูใน data field อื่นๆ
          if (!aiResponseText && data.data) {
            aiResponseText = data.data.message || data.data.response || data.data.content;
          }
          
          // ลองดูใน response field
          if (!aiResponseText && data.response) {
            aiResponseText = data.response.message || data.response.content || data.response.text;
          }
        }
        
        console.log('Extracted AI response text:', aiResponseText);
        console.log('Full data object:', JSON.stringify(data, null, 2));
        
        if (aiResponseText && typeof aiResponseText === 'string' && aiResponseText.trim()) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText.trim(),
            isUser: false,
            timestamp: new Date().toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit'
            })
          };

          setMessages(prev => [...prev, aiMessage]);
          
          // อัปเดต chat session
          setChatSessions(prev => prev.map(session => 
            session.id === selectedSessionId 
              ? { ...session, lastMessage: aiMessage.text, timestamp: "เมื่อสักครู่" }
              : session
          ));
          
          console.log('AI message displayed successfully:', aiMessage.text);
          
          // อัปเดตข้อความของผู้ใช้ให้แสดงข้อความจริงจาก AI หลังบ้าน
          if (data.data && data.data.userMessage && data.data.userMessage.message_text) {
            const actualUserMessage = data.data.userMessage.message_text;
            setMessages(prev => prev.map(msg => 
              msg.isUser && msg.text === inputMessage.trim()
                ? { ...msg, text: actualUserMessage }
                : msg
            ));
            console.log('Updated user message with actual text:', actualUserMessage);
          }
        } else {
          // ถ้าไม่มีข้อความจาก AI ให้แสดงข้อความเริ่มต้น
          console.warn('No AI response text found in data:', data);
          const defaultMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "ขออภัย ไม่สามารถประมวลผลได้ กรุณาลองใหม่อีกครั้ง",
            isUser: false,
            timestamp: new Date().toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit'
            })
          };
          setMessages(prev => [...prev, defaultMessage]);
        }
      } else {
        // จัดการ error cases ต่างๆ
        let errorMessage = "ขออภัย เกิดข้อผิดพลาดในการประมวลผล";
        
        if (response.status === 401) {
          errorMessage = "Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่";
          console.warn('Authentication failed for AI chat:', {
            status: response.status,
            backendMessage: data.message,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
            tokenValid: tokenUtils.isValidToken(token)
          });
          
          // ลบ token ที่ไม่ถูกต้องและ redirect ไปหน้า login
          tokenUtils.removeToken();
          
          toast({
            title: "Token ไม่ถูกต้อง",
            description: "กรุณาเข้าสู่ระบบใหม่",
            variant: "destructive",
          });
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          
        } else if (response.status === 400) {
          errorMessage = "ข้อความไม่ถูกต้อง";
          console.warn('Bad request to AI:', {
            status: response.status,
            backendMessage: data.message,
            validationErrors: data.errors
          });
        } else if (response.status === 429) {
          errorMessage = "ส่งข้อความบ่อยเกินไป กรุณารอสักครู่";
          console.warn('Rate limit exceeded:', {
            status: response.status,
            backendMessage: data.message
          });
        } else if (response.status === 500) {
          errorMessage = "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์";
          console.error('AI server error:', {
            status: response.status,
            backendMessage: data.message,
            error: data.error
          });
        } else {
          console.error('Unexpected AI response:', {
            status: response.status,
            statusText: response.statusText,
            data: data
          });
        }

        const errorMessageObj: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        setMessages(prev => [...prev, errorMessageObj]);
      }
    } catch (error) {
      console.error('Network/Connection error with AI:', {
        message: currentInput,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "ขออภัย ไม่สามารถเชื่อมต่อกับ AI ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
          
          {/* New Chat Button (Left top) */}
          <button
            className="absolute top-6 left-6 z-20 bg-background hover:bg-muted rounded-lg p-2 transition-colors"
            onClick={createNewSession}
            title="เริ่มการสนทนาใหม่"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
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
                             {message.isUser ? (
                               <p className="text-sm leading-relaxed">{message.text}</p>
                             ) : (
                               <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                                 <ReactMarkdown 
                                   remarkPlugins={[remarkGfm]}
                                                                       components={{
                                      table: ({node, ...props}) => (
                                        <div className="table-container overflow-x-auto">
                                          <table {...props} />
                                        </div>
                                      ),
                                    }}
                                 >
                                   {message.text}
                                 </ReactMarkdown>
                               </div>
                             )}
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
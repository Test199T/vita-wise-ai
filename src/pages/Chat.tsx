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
  Bot,
  Bell,
  ChevronDown,
  User,
  Mic,
  MicOff,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { tokenUtils } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@supabase/supabase-js";
import { apiConfig } from "@/config/env";

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
    description: "วิเคราะห์ข้อมูลสุขภาพของฉัน",
  },
  {
    icon: BookOpen,
    text: "ให้คำแนะนำ",
    description: "แนะนำการดูแลสุขภาพ",
  },
  {
    icon: Code2,
    text: "แปลผลตรวจ",
    description: "อธิบายผลการตรวจสุขภาพ",
  },
  {
    icon: Heart,
    text: "ปรึกษาสุขภาพ",
    description: "คำปรึกษาเรื่องสุขภาพทั่วไป",
  },
];

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Chat sessions - จะดึงข้อมูลจริงจาก AI หลังบ้าน
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);

  // Messages for selected session (mock, single session)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
      isUser: false,
      timestamp: "เมื่อสักครู่",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // สร้าง session ใหม่ใน AI หลังบ้าน (ต้องสำเร็จฝั่ง backend เท่านั้น)
  const createNewSession = async (): Promise<string | null> => {
    try {
      const token = tokenUtils.getValidToken();
      if (!token) {
        console.error("No valid token found for creating session");
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่",
          variant: "destructive",
        });
        navigate("/login");
        return null;
      }

      console.log(
        "Creating new session with token:",
        token ? `${token.substring(0, 20)}...` : "null"
      );

      const response = await fetch(`${apiConfig.baseUrl}/api/chat/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `AI สุขภาพ (${new Date().toLocaleDateString("th-TH")})`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Created new session:", data);

        if (data.success && data.data) {
          const newSession: ChatSession = {
            id: data.data.id.toString(),
            title:
              data.data.title ||
              `AI สุขภาพ (${new Date().toLocaleDateString("th-TH")})`,
            lastMessage: "เริ่มการสนทนาใหม่",
            timestamp: "เมื่อสักครู่",
          };

          setChatSessions((prev) => {
            const updated = [newSession, ...prev];
            console.log("Updated sessions after create:", updated);
            return updated;
          });
          setSelectedSessionId(newSession.id);

          // รีเซ็ตข้อความ
          setMessages([
            {
              id: "1",
              text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
              isUser: false,
              timestamp: "เมื่อสักครู่",
            },
          ]);

          toast({
            title: "สร้างสำเร็จ",
            description: "สร้างการสนทนาใหม่แล้ว",
          });

          return newSession.id;
        } else {
          console.error("Invalid response data:", data);
          toast({
            title: "ข้อผิดพลาด",
            description: "ข้อมูลที่ได้รับไม่ถูกต้อง",
            variant: "destructive",
          });
        }
      } else {
        console.error(
          "Failed to create new session:",
          response.status,
          response.statusText
        );
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          console.error("Unauthorized - token may be invalid or expired");
          tokenUtils.removeToken();
          toast({
            title: "Token ไม่ถูกต้อง",
            description: "กรุณาเข้าสู่ระบบใหม่",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description:
              errorData.message ||
              "ไม่สามารถสร้าง session ใหม่ได้ กรุณาลองใหม่อีกครั้ง",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error creating new session:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
    return null;
  };

  // ตรวจสอบและรับ sessionId ที่ถูกต้อง (ต้องมีอยู่จริงใน backend)
  const getValidSessionId = async (): Promise<number | null> => {
    console.log("getValidSessionId called with:", {
      selectedSessionId,
      type: typeof selectedSessionId,
    });

    if (
      !selectedSessionId ||
      selectedSessionId === "undefined" ||
      selectedSessionId === "null"
    ) {
      console.warn(
        "Invalid selectedSessionId, creating new session:",
        selectedSessionId
      );
      const newSessionId = await createNewSession();
      return newSessionId ? parseInt(newSessionId) : null;
    }

    const sessionIdNum = parseInt(selectedSessionId);
    if (isNaN(sessionIdNum) || sessionIdNum <= 0) {
      console.warn("Invalid sessionId number, creating new session:", {
        selectedSessionId,
        parsed: sessionIdNum,
      });
      const newSessionId = await createNewSession();
      return newSessionId ? parseInt(newSessionId) : null;
    }

    // ตรวจสอบว่า sessionId นี้มีอยู่จริงใน state หรือไม่
    const existsInState = chatSessions.some((s) => s.id === selectedSessionId);
    if (existsInState) {
      console.log("Session exists in state:", { selectedSessionId });
      return sessionIdNum;
    }

    // ดึงรายการ session จาก backend เพื่อยืนยันอีกครั้ง
    await fetchChatSessions();
    const existsAfterFetch = chatSessions.some(
      (s) => s.id === selectedSessionId
    );
    if (existsAfterFetch) {
      console.log("Session found after fetching list:", { selectedSessionId });
      return sessionIdNum;
    }

    console.warn("Session not found on server, creating a new one.");
    const newSessionId = await createNewSession();
    return newSessionId ? parseInt(newSessionId) : null;
  };

  // ดึงประวัติการพูดคุยจาก AI หลังบ้าน
  const fetchChatSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const token = tokenUtils.getValidToken();
      if (!token) return;

      const response = await fetch(`${apiConfig.baseUrl}/api/chat/sessions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched chat sessions:", data);

        if (data.success && data.data) {
          const sessions = data.data.map((session: any) => ({
            id: session.id.toString(),
            title:
              session.title ||
              `AI สุขภาพ (${new Date(session.created_at).toLocaleDateString(
                "th-TH"
              )})`,
            lastMessage: session.last_message || "เริ่มการสนทนาใหม่",
            timestamp: formatTimestamp(
              session.updated_at || session.created_at
            ),
          }));

          setChatSessions(sessions);

          // ถ้ายังไม่มี session ที่เลือก ให้เลือก session แรก
          if (
            sessions.length > 0 &&
            (!selectedSessionId || selectedSessionId === "1")
          ) {
            setSelectedSessionId(sessions[0].id);
          }
        }
      } else {
        console.warn("Failed to fetch chat sessions:", response.status);
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // ดึงข้อความใน session ที่เลือก
  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const token = tokenUtils.getValidToken();
      if (!token) return;

      const response = await fetch(
        `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched session messages:", data);

        if (data.success && data.data) {
          const messages = data.data.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.message_text,
            isUser: msg.is_user_message,
            timestamp: formatTimestamp(msg.timestamp),
          }));

          // เพิ่มข้อความเริ่มต้นถ้าไม่มีข้อความ
          if (messages.length === 0) {
            messages.push({
              id: "1",
              text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
              isUser: false,
              timestamp: "เมื่อสักครู่",
            });
          }

          setMessages(messages);
        }
      } else {
        console.warn("Failed to fetch session messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching session messages:", error);
    }
  };

  // จัดรูปแบบ timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "เมื่อสักครู่";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ชั่วโมงที่แล้ว`;
    } else if (diffInHours < 48) {
      return "เมื่อวาน";
    } else {
      return date.toLocaleDateString("th-TH");
    }
  };

  // สร้าง session เริ่มต้นเมื่อ component mount
  useEffect(() => {
    (async () => {
      if (
        !selectedSessionId ||
        selectedSessionId === "undefined" ||
        selectedSessionId === "null"
      ) {
        console.log("Initializing by creating backend session");
        await createNewSession();
      }
    })();
  }, []);

  // ตรวจสอบ token และดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    if (!tokenUtils.isLoggedIn()) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนใช้งาน Chat AI",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const token = tokenUtils.getValidToken();
    if (token) {
      // ดึงประวัติการพูดคุย
      fetchChatSessions();
    }

    console.log("Token validation passed:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "null",
      isLoggedIn: tokenUtils.isLoggedIn(),
      selectedSessionId,
    });
  }, [navigate, toast]);

  // ดึงข้อความเมื่อ session เปลี่ยน
  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionMessages(selectedSessionId);
    }
  }, [selectedSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
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
      navigate("/login");
      return;
    }

    // รับ sessionId ที่ถูกต้อง
    const validSessionId = await getValidSessionId();

    // ตรวจสอบเพิ่มเติมว่า sessionId ถูกต้อง
    if (!validSessionId || isNaN(validSessionId) || validSessionId <= 0) {
      console.error("Invalid sessionId after validation:", {
        validSessionId,
        type: typeof validSessionId,
      });
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถสร้าง session ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      return;
    }

    console.log("Preparing to send message with sessionId:", {
      validSessionId,
      type: typeof validSessionId,
      selectedSessionId,
      inputMessage: inputMessage.substring(0, 50) + "...",
    });

    // สร้างข้อความของผู้ใช้จาก inputMessage ที่แท้จริง
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(), // ใช้ข้อความที่ผู้ใช้พิมพ์จริง
      isUser: true,
      timestamp: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      // Log การส่งข้อความไปยัง AI
      console.log("Sending message to AI:", {
        message: currentInput,
        timestamp: new Date().toISOString(),
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : "null",
        tokenValid: tokenUtils.isValidToken(token),
        session_id: validSessionId,
        sessionIdType: typeof validSessionId,
        requestBody: {
          message: currentInput,
          session_id: validSessionId,
          timestamp: new Date().toISOString(),
        },
      });

      const requestBody = {
        message: currentInput,
        session_id: validSessionId,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(
        `${apiConfig.baseUrl}/api/chat/sessions/${validSessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      // Log response จาก AI backend
      console.log("AI response:", {
        status: response.status,
        statusText: response.statusText,
        data: data,
        session_id: validSessionId,
      });

      if (response.ok) {
        // ตรวจสอบว่ามีข้อความจาก AI หลังบ้านหรือไม่
        console.log("AI response data structure:", data);

        // ดึงข้อความจาก AI หลังบ้าน - ให้ความสำคัญกับ data.data.aiMessage.message_text ก่อน
        let aiResponseText = null;

        // ตรวจสอบ data.data.aiMessage.message_text ก่อน (รูปแบบที่ AI หลังบ้านส่งมา)
        if (
          data.data &&
          data.data.aiMessage &&
          data.data.aiMessage.message_text
        ) {
          aiResponseText = data.data.aiMessage.message_text;
          console.log(
            "Found AI response in data.data.aiMessage.message_text:",
            aiResponseText
          );
        }

        // ถ้าไม่มีใน aiMessage ลองหาจาก field อื่นๆ
        if (!aiResponseText) {
          aiResponseText =
            data.message ||
            data.response ||
            data.ai_message ||
            data.content ||
            data.text ||
            data.answer ||
            data.reply;

          // ถ้าไม่มีใน field หลัก ลองดูใน choices
          if (!aiResponseText && data.choices && data.choices.length > 0) {
            aiResponseText = data.choices[0].message?.content;
          }

          // ถ้าไม่มีใน choices ลองดูใน data field อื่นๆ
          if (!aiResponseText && data.data) {
            aiResponseText =
              data.data.message || data.data.response || data.data.content;
          }

          // ลองดูใน response field
          if (!aiResponseText && data.response) {
            aiResponseText =
              data.response.message ||
              data.response.content ||
              data.response.text;
          }
        }

        console.log("Extracted AI response text:", aiResponseText);
        console.log("Full data object:", JSON.stringify(data, null, 2));

        if (
          aiResponseText &&
          typeof aiResponseText === "string" &&
          aiResponseText.trim()
        ) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText.trim(),
            isUser: false,
            timestamp: new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessages((prev) => [...prev, aiMessage]);

          // อัปเดต chat session
          updateSessionAfterMessage(selectedSessionId, aiMessage.text);

          console.log("AI message displayed successfully:", aiMessage.text);

          // อัปเดตข้อความของผู้ใช้ให้แสดงข้อความจริงจาก AI หลังบ้าน
          if (
            data.data &&
            data.data.userMessage &&
            data.data.userMessage.message_text
          ) {
            const actualUserMessage = data.data.userMessage.message_text;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.isUser && msg.text === inputMessage.trim()
                  ? { ...msg, text: actualUserMessage }
                  : msg
              )
            );
            console.log(
              "Updated user message with actual text:",
              actualUserMessage
            );
          }
        } else {
          // ถ้าไม่มีข้อความจาก AI ให้แสดงข้อความเริ่มต้น
          console.warn("No AI response text found in data:", data);
          const defaultMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "ขออภัย ไม่สามารถประมวลผลได้ กรุณาลองใหม่อีกครั้ง",
            isUser: false,
            timestamp: new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, defaultMessage]);
        }
      } else {
        // จัดการ error cases ต่างๆ
        let errorMessage = "ขออภัย เกิดข้อผิดพลาดในการประมวลผล";

        if (response.status === 401) {
          errorMessage = "Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่";
          console.warn("Authentication failed for AI chat:", {
            status: response.status,
            backendMessage: data.message,
            tokenPreview: token ? `${token.substring(0, 20)}...` : "null",
            tokenValid: tokenUtils.isValidToken(token),
          });

          // ลบ token ที่ไม่ถูกต้องและ redirect ไปหน้า login
          tokenUtils.removeToken();

          toast({
            title: "Token ไม่ถูกต้อง",
            description: "กรุณาเข้าสู่ระบบใหม่",
            variant: "destructive",
          });

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else if (response.status === 400) {
          errorMessage = "ข้อความไม่ถูกต้อง";
          console.warn("Bad request to AI:", {
            status: response.status,
            backendMessage: data.message,
            validationErrors: data.errors,
          });
        } else if (response.status === 429) {
          errorMessage = "ส่งข้อความบ่อยเกินไป กรุณารอสักครู่";
          console.warn("Rate limit exceeded:", {
            status: response.status,
            backendMessage: data.message,
          });
        } else if (response.status === 500) {
          errorMessage = "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์";
          console.error("AI server error:", {
            status: response.status,
            backendMessage: data.message,
            error: data.error,
          });
        } else {
          console.error("Unexpected AI response:", {
            status: response.status,
            statusText: response.statusText,
            data: data,
          });
        }

        const errorMessageObj: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          isUser: false,
          timestamp: new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, errorMessageObj]);
      }
    } catch (error) {
      console.error("Network/Connection error with AI:", {
        message: currentInput,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "ขออภัย ไม่สามารถเชื่อมต่อกับ AI ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        isUser: false,
        timestamp: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();
  };

  // ลบ session
  const deleteSession = async (sessionId: string) => {
    try {
      const token = tokenUtils.getValidToken();
      if (!token) {
        console.error("No valid token found");
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      console.log(
        "Deleting session:",
        sessionId,
        "with token:",
        token ? `${token.substring(0, 20)}...` : "null"
      );
      console.log(
        "Request URL:",
        `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}`
      );
      console.log("Request headers:", {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      });

      const response = await fetch(
        `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log("Session deleted successfully");

        // ลบ session ออกจาก state
        setChatSessions((prev) => {
          const updated = prev.filter((session) => session.id !== sessionId);
          console.log("Updated sessions after delete:", updated);
          return updated;
        });

        // ถ้า session ที่ลบเป็น session ที่เลือกอยู่ ให้เลือก session อื่น
        if (selectedSessionId === sessionId) {
          setChatSessions((prev) => {
            const remainingSessions = prev.filter(
              (session) => session.id !== sessionId
            );
            if (remainingSessions.length > 0) {
              setSelectedSessionId(remainingSessions[0].id);
              // รีเซ็ตข้อความ
              setMessages([
                {
                  id: "1",
                  text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
                  isUser: false,
                  timestamp: "เมื่อสักครู่",
                },
              ]);
            } else {
              // ถ้าไม่มี session เหลืออยู่ ให้สร้างใหม่
              createNewSession();
            }
            return prev;
          });
        }

        toast({
          title: "ลบสำเร็จ",
          description: "ลบการสนทนาออกแล้ว",
        });
      } else {
        console.error(
          "Failed to delete session:",
          response.status,
          response.statusText
        );
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          console.error("Unauthorized - token may be invalid or expired");
          tokenUtils.removeToken();
          toast({
            title: "Token ไม่ถูกต้อง",
            description: "กรุณาเข้าสู่ระบบใหม่",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description:
              errorData.message ||
              "ไม่สามารถลบการสนทนาได้ กรุณาลองใหม่อีกครั้ง",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  // อัปเดต session หลังจากส่งข้อความ
  const updateSessionAfterMessage = (
    sessionId: string,
    lastMessage: string
  ) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, lastMessage, timestamp: "เมื่อสักครู่" }
          : session
      )
    );
  };

  // Top Navigation Header
  const TopHeader = (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-medium text-gray-800">สุขภาพดี AI</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            แดชบอร์ด
          </Link>
          <div className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
            <span>สุขภาพและการติดตาม</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
            <span>AI และการวิเคราะห์</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">3</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">kassana phuwapor...</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );

  // Left Sidebar (Chat History)
  const LeftSidebar = (
    <aside className="bg-white border-r border-gray-200 h-full flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={createNewSession}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingSessions ? (
          <div className="flex items-center justify-center p-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        ) : chatSessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            ไม่มีการสนทนา
          </div>
        ) : (
          <div className="p-2">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 px-2 font-semibold">
              Chats
            </div>
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`group px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer mb-1 ${
                  selectedSessionId === session.id
                    ? "bg-blue-100 border border-blue-200"
                    : ""
                }`}
                onClick={() => setSelectedSessionId(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 font-medium truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {session.lastMessage}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {session.timestamp}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                    title="ลบการสนทนา"
                  >
                    <X className="h-3 w-3 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      {TopHeader}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Fixed */}
        <div className="w-80 flex-shrink-0">{LeftSidebar}</div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 1 ? (
                <div className="h-full flex items-center justify-center px-6 py-12">
                  <div className="text-center w-full max-w-2xl">
                    {/* Header */}
                    <div className="mb-12">
                      <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl text-gray-800 font-medium">
                          สวัสดี มีอะไรให้ช่วยไหม?
                        </h1>
                      </div>
                    </div>

                    {/* Input Field */}
                    <div className="mb-8">
                      <div className="relative max-w-2xl mx-auto">
                        <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            {/* Microphone Button */}
                            <button
                              onClick={() => setIsRecording(!isRecording)}
                              className={`p-2 rounded-full transition-all duration-200 ${
                                isRecording
                                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                              title={
                                isRecording
                                  ? "หยุดการบันทึกเสียง"
                                  : "เริ่มการบันทึกเสียง"
                              }
                            >
                              {isRecording ? (
                                <MicOff className="h-4 w-4" />
                              ) : (
                                <Mic className="h-4 w-4" />
                              )}
                            </button>

                            {/* Auto Mode Toggle */}
                            <button
                              onClick={() => setIsAutoMode(!isAutoMode)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                isAutoMode
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Auto
                            </button>

                            {/* Input Field */}
                            <textarea
                              ref={inputRef}
                              placeholder="พิมพ์คำถามของคุณที่นี่..."
                              value={inputMessage}
                              onChange={handleInputChange}
                              onKeyPress={handleKeyPress}
                              disabled={isTyping}
                              rows={1}
                              className="flex-1 resize-none bg-transparent text-base text-gray-800 placeholder:text-gray-500 focus:outline-none"
                              style={{ minHeight: "24px" }}
                            />

                            {/* Send Button */}
                            <button
                              onClick={handleSendMessage}
                              disabled={!inputMessage.trim() || isTyping}
                              className={`p-2 rounded-full transition-all duration-200 ${
                                inputMessage.trim() && !isTyping
                                  ? "bg-blue-500 text-white hover:bg-blue-600"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.description)}
                          className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                        >
                          <action.icon className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-700 font-medium">
                            {action.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {messages.slice(1).map((message) => (
                    <div
                      key={message.id}
                      className={`w-full ${
                        message.isUser ? "flex justify-end" : ""
                      }`}
                    >
                      {message.isUser ? (
                        // User message - keep in bubble
                        <div className="flex justify-end mb-6 px-8">
                          <div className="max-w-[70%]">
                            {/* Message Content */}
                            <div className="rounded-2xl px-5 py-3 shadow-md bg-blue-500 text-white group hover:bg-blue-600 transition-colors duration-200">
                              <p className="text-sm leading-relaxed">
                                {message.text}
                              </p>
                              <p className="text-xs mt-2 text-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // AI message - full width like ChatGPT
                        <div className="w-full border-b border-gray-200 py-8 bg-white">
                          <div className="max-w-4xl mx-auto px-8 group">
                            {/* Message Content - Full Width */}
                            <div className="w-full">
                              <div className="prose prose-lg max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    // Headings with beautiful styling
                                    h1: ({ children }) => (
                                      <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-8 pb-3 border-b border-gray-200">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-6 flex items-center">
                                        <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-5 flex items-center">
                                        <span className="w-1 h-4 bg-blue-400 rounded-full mr-2"></span>
                                        {children}
                                      </h3>
                                    ),
                                    h4: ({ children }) => (
                                      <h4 className="text-base font-semibold text-gray-800 mb-2 mt-4">
                                        {children}
                                      </h4>
                                    ),

                                    // Paragraphs with better spacing
                                    p: ({ children }) => (
                                      <p className="mb-4 text-gray-700 leading-relaxed text-base">
                                        {children}
                                      </p>
                                    ),

                                    // Lists with beautiful styling
                                    ul: ({ children }) => (
                                      <ul className="list-none mb-6 space-y-3">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-none mb-6 space-y-3">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children, ...props }) => {
                                      const isOrdered =
                                        props.className?.includes(
                                          "task-list-item"
                                        );
                                      return (
                                        <li className="flex items-start text-gray-700 leading-relaxed text-base mb-2">
                                          {!isOrdered && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                          )}
                                          <div className="flex-1">
                                            {children}
                                          </div>
                                        </li>
                                      );
                                    },

                                    // Text formatting
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-gray-900 bg-blue-50 px-1.5 py-0.5 rounded">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                                        {children}
                                      </em>
                                    ),

                                    // Code blocks
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      return isInline ? (
                                        <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border">
                                          {children}
                                        </code>
                                      ) : (
                                        <code className={className}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre: ({ children }) => (
                                      <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono my-6 border border-gray-700">
                                        {children}
                                      </pre>
                                    ),

                                    // Blockquotes
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-6 py-4 my-6 text-gray-700 italic rounded-r-lg">
                                        {children}
                                      </blockquote>
                                    ),

                                    // Tables
                                    table: ({ children }) => (
                                      <div className="overflow-x-auto my-6 rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                          {children}
                                        </table>
                                      </div>
                                    ),
                                    thead: ({ children }) => (
                                      <thead className="bg-gray-50">
                                        {children}
                                      </thead>
                                    ),
                                    tbody: ({ children }) => (
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {children}
                                      </tbody>
                                    ),
                                    tr: ({ children }) => (
                                      <tr className="hover:bg-gray-50">
                                        {children}
                                      </tr>
                                    ),
                                    th: ({ children }) => (
                                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        {children}
                                      </th>
                                    ),
                                    td: ({ children }) => (
                                      <td className="px-6 py-4 text-sm text-gray-700">
                                        {children}
                                      </td>
                                    ),

                                    // Horizontal rules
                                    hr: () => (
                                      <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                    ),

                                    // Links
                                    a: ({ children, href }) => (
                                      <a
                                        href={href}
                                        className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {children}
                                      </a>
                                    ),
                                  }}
                                >
                                  {message.text}
                                </ReactMarkdown>
                              </div>

                              {/* Timestamp */}
                              <p className="text-sm text-gray-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="w-full border-b border-gray-200 py-6 bg-white">
                      <div className="max-w-4xl mx-auto px-8">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Area - Only show when in conversation */}
          {messages.length > 1 && (
            <div className="p-6 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    {/* Microphone Button */}
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        isRecording
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={
                        isRecording
                          ? "หยุดการบันทึกเสียง"
                          : "เริ่มการบันทึกเสียง"
                      }
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </button>

                    {/* Auto Mode Toggle */}
                    <button
                      onClick={() => setIsAutoMode(!isAutoMode)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        isAutoMode
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Auto
                    </button>

                    {/* Input Field */}
                    <textarea
                      ref={inputRef}
                      placeholder="พิมพ์ข้อความของคุณ..."
                      value={inputMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={isTyping}
                      rows={1}
                      className="flex-1 resize-none bg-transparent text-gray-800 placeholder:text-gray-500 focus:outline-none"
                      style={{ minHeight: "24px" }}
                    />

                    {/* Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        inputMessage.trim() && !isTyping
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  AI อาจให้ข้อมูลที่ไม่ถูกต้อง โปรดตรวจสอบข้อมูลสำคัญ
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Send,
  Activity,
  Brain,
  Plus,
  Menu,
  X,
  History,
  Edit3,
  BookOpen,
  Code2,
  Heart,
  ChevronDown,
  User,
  Mic,
  MicOff,
  BarChart3,
  Target,
  Clock,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  LogOut,
  Paperclip,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tokenUtils } from "@/lib/utils";
import Ai04, { AttachedFile } from "@/components/ai-04";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { useProfile } from "@/hooks/useProfile";
import { apiConfig } from "@/config/env";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NotificationBellIcon } from "@/components/ui/notification-bell-icon";
import { StreamingText } from "@/components/chat/StreamingText";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import TextShimmer from "@/components/ui/text-shimmer";

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profilePicture } = useProfilePicture();
  const { profile, loading, isLoggedIn } = useProfile();

  interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
    image?: string | null;
  }

  interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    createdAt: string;
  }

  // Chat sessions - จะดึงข้อมูลจริงจาก AI หลังบ้าน
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

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
  const [isTodayExpanded, setIsTodayExpanded] = useState(true);
  const [isPreviousExpanded, setIsPreviousExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null); // ID of message currently streaming
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Retry helper function for cold start handling
  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
    onRetry?: (attempt: number, maxRetries: number) => void
  ): Promise<Response> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt < maxRetries) {
          // Notify user about retry
          if (onRetry) {
            onRetry(attempt, maxRetries);
          }

          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  };

  // อัปโหลดและแสดงรูปภาพ (ไม่วิเคราะห์ทันที)
  const handleImageUpload = async (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "ไฟล์ไม่รองรับ",
        description: "รองรับเฉพาะ png, jpg, jpeg, webp",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "ขนาดไฟล์สูงสุด 5MB",
        variant: "destructive",
      });
      return;
    }

    // แปลงไฟล์เป็น base64 สำหรับแสดง preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (result && typeof result === "string") {
        setUploadedImage(result);
        setUploadedFile(file);
        toast({
          title: "เพิ่มรูปภาพสำเร็จ",
          description: `รูปภาพ: ${file.name} - กรุณาพิมพ์ข้อความแล้วส่งเพื่อวิเคราะห์`,
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอ่านไฟล์รูปภาพได้",
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอ่านไฟล์รูปภาพได้",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  // ฟังก์ชันวิเคราะห์ข้อมูลเฉพาะเจาะจงผ่าน API ใหม่
  const analyzeSpecificData = async (query: string, sessionId: string) => {
    if (isAnalyzing) return null;

    setIsAnalyzing(true);
    try {
      const token = tokenUtils.getValidToken();
      if (!token) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่",
          variant: "destructive",
        });
        navigate("/login");
        return null;
      }

      const response = await fetch(
        `${apiConfig.baseUrl}/api/chat/ai/analyze-specific`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: query,
            session_id: sessionId,
            analysis_type: "health_data",
            include_recent_activities: true,
            include_recommendations: true,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Analysis response:", data);

        if (data.success && data.data) {
          toast({
            title: "วิเคราะห์ข้อมูลสำเร็จ",
            description: "ได้ข้อมูลการวิเคราะห์จาก AI แล้ว",
          });
          return data.data;
        } else {
          throw new Error(data.message || "Analysis failed");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถวิเคราะห์ข้อมูลได้",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

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
        token ? `${token.substring(0, 20)}...` : "null",
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
            id: data.data.id, // UUID is already a string
            title:
              data.data.title ||
              `AI สุขภาพ (${new Date().toLocaleDateString("th-TH")})`,
            lastMessage: "เริ่มการสนทนาใหม่",
            timestamp: "เมื่อสักครู่",
            createdAt: data.data.created_at || new Date().toISOString(),
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
              image: null,
            },
          ]);

          toast({
            title: "สร้างสำเร็จ",
            description: "สร้างการสนทนาใหม่แล้ว",
          });

          return newSession.id; // Return UUID string directly
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
          response.statusText,
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

  // UUID validation regex
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // ตรวจสอบและรับ sessionId ที่ถูกต้อง (ต้องมีอยู่จริงใน backend)
  const getValidSessionId = async (): Promise<string | null> => {
    console.log("getValidSessionId called with:", {
      selectedSessionId,
      type: typeof selectedSessionId,
    });

    if (
      !selectedSessionId ||
      selectedSessionId === "undefined" ||
      selectedSessionId === "null"
    ) {
      console.warn("No selectedSessionId:", selectedSessionId);
      return null;
    }

    // Validate UUID format
    if (!UUID_REGEX.test(selectedSessionId)) {
      console.warn("Invalid UUID format:", selectedSessionId);
      return null;
    }

    // ตรวจสอบว่า sessionId นี้มีอยู่จริงใน state หรือไม่
    const existsInState = chatSessions.some((s) => s.id === selectedSessionId);
    if (existsInState) {
      console.log("Session exists in state:", { selectedSessionId });
      return selectedSessionId;
    }

    // ดึงรายการ session จาก backend เพื่อยืนยันอีกครั้ง
    await fetchChatSessions();
    const existsAfterFetch = chatSessions.some(
      (s) => s.id === selectedSessionId,
    );
    if (existsAfterFetch) {
      console.log("Session found after fetching list:", { selectedSessionId });
      return selectedSessionId;
    }

    console.warn("Session not found on server:", { selectedSessionId });
    return null;
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
            id: session.id, // UUID is already a string
            title:
              session.title ||
              `AI สุขภาพ (${new Date(session.created_at).toLocaleDateString(
                "th-TH",
              )})`,
            lastMessage: session.last_message || "เริ่มการสนทนาใหม่",
            timestamp: formatTimestamp(
              session.updated_at || session.created_at,
            ),
            createdAt: session.created_at || new Date().toISOString(),
          }));

          setChatSessions(sessions);

          // ไม่เลือก session โดยอัตโนมัติ
          // ผู้ใช้จะต้องเลือก session เองหรือส่งข้อความเพื่อสร้าง session ใหม่
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
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched session messages:", data);

        if (data.success && data.data) {
          const messages = data.data.map((msg: any) => {
            console.log("Processing message:", {
              id: msg.id,
              hasImageUrl: !!msg.image_url,
              imageUrl: msg.image_url,
            });

            return {
              id: msg.id.toString(),
              text: msg.message_text,
              isUser: msg.is_user_message,
              timestamp: formatTimestamp(msg.timestamp),
              image: msg.image_url
                ? (() => {
                  const imagePath = msg.image_url.replace(/\\/g, "/");
                  const fullUrl = imagePath.startsWith("http")
                    ? imagePath
                    : `${apiConfig.baseUrl}/${imagePath.startsWith("/")
                      ? imagePath.slice(1)
                      : imagePath
                    }`;
                  console.log("Message image URL constructed:", fullUrl);
                  return fullUrl;
                })()
                : null,
            };
          });

          // เพิ่มข้อความเริ่มต้นถ้าไม่มีข้อความ
          if (messages.length === 0) {
            messages.push({
              id: "1",
              text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
              isUser: false,
              timestamp: "เมื่อสักครู่",
              image: null,
            });
          }

          setMessages(messages);
        }
      } else {
        console.warn("Failed to fetch session messages:", response.status);

        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || response.statusText;

        if (
          response.status === 403 &&
          (errorMessage.includes("Outstanding invoices") ||
            errorMessage.includes("billing"))
        ) {
          setMessages([
            {
              id: "error-billing",
              text:
                "⚠️ **AI Service Suspended / บริการ AI ถูกระงับ**\n\n" +
                "ผู้ให้บริการ AI (OpenAI) ปฏิเสธคำขอเนื่องจากมียอดค้างชำระ\n" +
                "กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบการชำระเงิน",
              isUser: false,
              timestamp: "เมื่อสักครู่",
              image: null,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching session messages:", error);
      setMessages([
        {
          id: "error-network",
          text: "⚠️ ไม่สามารถโหลดประวัติการสนทนาได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
          isUser: false,
          timestamp: "เมื่อสักครู่",
          image: null,
        },
      ]);
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

  // ไม่สร้าง session เริ่มต้นเมื่อ component mount
  // จะสร้าง session ใหม่เฉพาะเมื่อผู้ใช้ส่งข้อความเท่านั้น

  // ตรวจสอบ token และดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    console.log("🚀 Chat component mounting...");

    // Debug JWT status
    const rawToken = localStorage.getItem("token");
    const token = tokenUtils.getValidToken();
    const isLoggedIn = tokenUtils.isLoggedIn();

    console.log("🔐 JWT Debug Info:", {
      hasRawToken: !!rawToken,
      rawTokenLength: rawToken?.length || 0,
      rawTokenPreview: rawToken ? `${rawToken.substring(0, 20)}...` : "null",
      validToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "null",
      isLoggedIn: isLoggedIn,
      localStorageKeys: Object.keys(localStorage),
    });

    if (!tokenUtils.isLoggedIn()) {
      console.warn("❌ User not logged in - redirecting to login");
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนใช้งาน Chat AI",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (token) {
      console.log("✅ Token found, fetching chat sessions...");
      // ดึงประวัติการพูดคุย
      fetchChatSessions();
    } else {
      console.error("❌ No valid token found!");
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

  const handleSendMessage = async (
    overrideText?: string,
    overrideFiles?: AttachedFile[],
  ) => {
    const messageText =
      typeof overrideText === "string" ? overrideText : inputMessage.trim();

    let fileToSend = uploadedFile;
    let imagePreview = uploadedImage;

    if (overrideFiles && overrideFiles.length > 0) {
      fileToSend = overrideFiles[0].file;
      imagePreview = overrideFiles[0].preview || null;
    }

    if (!messageText && !fileToSend) return;

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

    // ถ้ายังไม่มี session ที่เลือก ให้สร้าง session ใหม่ก่อนส่งข้อความ
    let validSessionId = await getValidSessionId();
    if (!validSessionId) {
      validSessionId = await createNewSession();
      if (!validSessionId) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถสร้าง session ได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
        return;
      }
      setSelectedSessionId(validSessionId); // UUID is already a string
    }

    // Optimistic UI Update: แสดงข้อความของผู้ใช้ทันที
    setInputMessage("");
    setUploadedImage(null);
    setUploadedFile(null);

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      image: imagePreview,
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setTimeout(() => scrollToBottom(), 50);

    // Update sidebar optimistically
    updateSessionAfterMessage(
      validSessionId, // UUID is already a string
      messageText || "ส่งรูปภาพ",
    );

    setIsTyping(true);

    try {
      // สร้าง formData สำหรับ multipart/form-data
      const formData = new FormData();
      formData.append("message", messageText);
      formData.append("session_id", validSessionId); // UUID is already a string
      formData.append("timestamp", new Date().toISOString());

      // กำหนดคำถามที่ต้องการคำตอบตรงๆ (ไม่วิเคราะห์)
      const directAnswerKeywords = [
        "นี่คืออะไร",
        "นี่คือ",
        "คืออะไร",
        "อะไร",
        "ภาพนี้คืออะไร",
        "รูปนี้คืออะไร",
        "เห็นอะไร",
        "เห็นอะไรในรูป",
        "รูปนี้คือ",
        "ภาพนี้คือ",
        "รูปภาพนี้คืออะไร",
        "ภาพนี้คือ",
        "อันนี้คืออะไร",
        "นี่คือภาพอะไร",
        "รูปนี้คืออะไร",
        "คือ",
        "คืออะไรนะ",
        "คืออะไรครับ",
        "คืออะไรค่ะ",
      ];

      // กำหนดคำถามที่ต้องการวิเคราะห์รูปภาพ
      const analysisKeywords = [
        "วิเคราะห์",
        "analyze",
        "ช่วยดู",
        "ช่วยวิเคราะห์",
        "อาหาร",
        "กินได้ไหม",
        "อันตรายไหม",
        "ดีไหม",
        "วิเคราะห์รูป",
        "วิเคราะห์ภาพ",
        "ช่วยวิเคราะห์รูปนี้",
        "วิเคราะห์อาหาร",
        "วิเคราะห์รูปภาพ",
        "วิเคราะห์ภาพนี้",
        "ช่วยวิเคราะห์อาหาร",
        "ช่วยวิเคราะห์ภาพ",
        "วิเคราะห์มื้อนี้",
        "วิเคราะห์อาหารนี้",
        "วิเคราะห์รูปอาหาร",
      ];

      // ตรวจสอบว่ามีรูปภาพแนบมาหรือไม่
      const hasImage = !!fileToSend;

      // ตรวจสอบประเภทของคำถาม
      const wantsDirectAnswer =
        hasImage &&
        directAnswerKeywords.some((keyword) =>
          messageText.toLowerCase().includes(keyword.toLowerCase()),
        );

      const wantsAnalysis =
        hasImage &&
        analysisKeywords.some((keyword) =>
          messageText.toLowerCase().includes(keyword.toLowerCase()),
        );

      const shouldAnalyzeImage = wantsAnalysis;

      // กำหนดประเภทของการวิเคราะห์
      let analysisType = "general"; // ค่าเริ่มต้น: การสนทนาปกติ

      if (shouldAnalyzeImage) {
        analysisType = "analysis"; // ต้องการวิเคราะห์เชิงลึก
      } else if (wantsDirectAnswer) {
        analysisType = "direct"; // ต้องการคำตอบตรงๆ
      }

      // เพิ่ม fallback logic: ถ้ามีรูปภาพแต่ไม่มีคำถามเฉพาะเจาะจง ถือว่าเป็นการสนทนาปกติพร้อมรูปภาพประกอบ
      if (hasImage && !wantsDirectAnswer && !wantsAnalysis) {
        analysisType = "general_with_image"; // สนทนาปกติพร้อมรูปภาพประกอบ
      }

      console.log("🔍 Complete Image & Question Analysis Check:", {
        message: messageText,
        hasImage: hasImage,
        wantsDirectAnswer: wantsDirectAnswer,
        wantsAnalysis: wantsAnalysis,
        shouldAnalyzeImage: shouldAnalyzeImage,
        analysisType: analysisType,
        logic: {
          hasImageAndDirectQuestion:
            hasImage && messageText.toLowerCase().includes("นี่คืออะไร"),
          hasImageAndAnalysisQuestion:
            hasImage && messageText.toLowerCase().includes("วิเคราะห์"),
          shouldTriggerAnalysis: shouldAnalyzeImage,
          shouldTriggerDirect: wantsDirectAnswer && !shouldAnalyzeImage,
        },
        keywords: {
          directFound: directAnswerKeywords.filter((k) =>
            messageText.toLowerCase().includes(k.toLowerCase()),
          ),
          analysisFound: analysisKeywords.filter((k) =>
            messageText.toLowerCase().includes(k.toLowerCase()),
          ),
        },
      });

      if (fileToSend) {
        formData.append("image", fileToSend);
        formData.append("analyze_image", shouldAnalyzeImage ? "true" : "false");
        formData.append("analysis_type", analysisType);

        // เพิ่มคำสั่งให้ AI ตอบแบบชิวๆ สำหรับคำถามตรงๆ
        if (wantsDirectAnswer) {
          formData.append(
            "instruction",
            "ตอบแบบชิวๆ เหมือนเห็นรูปภาพจริงๆ บอกเฉพาะสิ่งที่เห็นในรูป ไม่วิเคราะห์หรือให้คำแนะนำเพิ่มเติม",
          );
        }
      }
      // Debug: log FormData entries to help backend debugging (won't show file content)
      try {
        const entries: Record<string, any> = {};
        for (const [k, v] of (formData as any).entries()) {
          // show filename for files
          if (v instanceof File) entries[k] = v.name;
          else entries[k] = v;
        }
        console.log("🔧 FormData entries:", entries);
      } catch (e) {
        console.warn("Could not inspect FormData entries", e);
      }

      let response: Response;
      const baseUrl = `${apiConfig.baseUrl}/api/chat/sessions/${validSessionId}/messages`;

      if (fileToSend) {
        // กรณีมีรูปภาพ ต้องส่งไปที่ endpoint /multipart
        response = await fetch(`${baseUrl}/multipart`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // กรณีข้อความธรรมดา ส่งเป็น JSON ไปที่ endpoint ปกติ
        response = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: messageText,
            session_id: validSessionId, // UUID is already a string
            timestamp: new Date().toISOString(),
          }),
        });
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch (err) {
        // non-json response (could be HTML error page) — capture text for debugging
        const text = await response.text().catch(() => "<no body>");
        console.error("Failed to parse JSON response; response text:", text);
        data = { success: false, message: `Non-JSON response: ${text}` };
      }

      console.log("📥 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        success: data?.success,
        data: data,
      });

      // Fix: Accept response if HTTP status is OK (2xx) AND we have AI response data
      // Backend sometimes returns success: false but still provides valid AI response
      const hasAiResponse = data?.data?.aiMessage || data?.message;

      if (response.ok && (data.success || hasAiResponse)) {
        // สร้าง message ฝั่ง AI (ตอบกลับ)
        const aiText =
          data.data?.aiMessage?.message_text ||
          data.data?.aiMessage?.text ||
          data.data?.aiMessage?.content ||
          data.data?.response ||
          data.message ||
          "";
        const aiImage = data.data?.aiMessage?.image_url
          ? (() => {
            const imagePath = data.data.aiMessage.image_url.replace(
              /\\/g,
              "/",
            );
            const fullUrl = imagePath.startsWith("http")
              ? imagePath
              : `${apiConfig.baseUrl}/${imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
              }`;
            console.log("AI image URL constructed:", fullUrl);
            return fullUrl;
          })()
          : null;
        if (aiText || aiImage) {
          const newMessageId = (Date.now() + 1).toString();

          // Set streaming ID before adding message for typing effect
          setStreamingMessageId(newMessageId);

          setMessages((prev) => [
            ...prev,
            {
              id: newMessageId,
              text: aiText,
              isUser: false,
              timestamp: new Date().toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              image: aiImage,
            },
          ]);

          // เลื่อนแชทลงไปที่ข้อความล่าสุด (หลังจากเพิ่มข้อความ AI)
          setTimeout(() => {
            scrollToBottom();
          }, 200);
        }

        // อัปเดต chat session
        updateSessionAfterMessage(validSessionId.toString(), aiText);

        // แสดงข้อความแจ้งเตือนให้ผู้ใช้ทราบประเภทการวิเคราะห์
        if (shouldAnalyzeImage && wantsDirectAnswer) {
          toast({
            title: "🔍 ถามข้อมูลตรงๆ",
            description: "AI จะตอบเฉพาะสิ่งที่เห็นในรูปภาพ",
          });
        } else if (shouldAnalyzeImage) {
          toast({
            title: "🔬 วิเคราะห์รูปภาพ",
            description: "AI จะวิเคราะห์และให้คำแนะนำเชิงลึก",
          });
        }

        // เลื่อนแชทลงไปที่ข้อความล่าสุด (หลังจากได้รับการตอบกลับจาก AI)
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        console.error("❌ Message sending failed:", {
          responseStatus: response.status,
          responseStatusText: response.statusText,
          responseData: data,
          responseHeaders: Object.fromEntries(response.headers.entries()),
        });

        const errorMessage = data.message || "เกิดข้อผิดพลาดในการส่งข้อความ";
        let displayError = `⚠️ ${errorMessage}`;

        // ตรวจสอบ Error เรื่อง Billing
        if (
          response.status === 403 &&
          (errorMessage.includes("Outstanding invoices") ||
            errorMessage.includes("billing"))
        ) {
          displayError =
            "⚠️ **AI Service Suspended / บริการ AI ถูกระงับ**\n\n" +
            "ผู้ให้บริการ AI (OpenAI) ปฏิเสธคำขอเนื่องจากมียอดค้างชำระ\n" +
            "กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบการชำระเงิน";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: displayError,
            isUser: false,
            timestamp: new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ หรือการเชื่อมต่อถูกตัดขาด",
          isUser: false,
          timestamp: new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
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
        token ? `${token.substring(0, 20)}...` : "null",
      );
      console.log(
        "Request URL:",
        `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}`,
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
        },
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
              (session) => session.id !== sessionId,
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
          response.statusText,
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
    lastMessage: string,
  ) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, lastMessage, timestamp: "เมื่อสักครู่" }
          : session,
      ),
    );
  };

  // Get user name from profile data or use fallback
  const userName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : "ผู้ใช้";
  const userInitial = userName.charAt(0);

  // Top Navigation Header
  const TopHeader = (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            สุขภาพดี AI
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <NotificationBellIcon className="h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors" size={20} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">3</span>
            </div>
          </Link>

          {/* Dark Mode Toggle */}
          <DarkModeToggle variant="header" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-medium">
                    {userInitial}
                  </div>
                )}
                <span className="text-sm text-gray-700 max-w-[140px] truncate">
                  {loading ? "กำลังโหลด..." : userName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  โปรไฟล์
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => tokenUtils.logout()}
                className="flex items-center gap-2 text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );

  // Left Sidebar (Chat History)
  const LeftSidebar = (
    <aside className="bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0">
      {/* Navigation Menu */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>แดชบอร์ด</span>
          </Link>
          <Link
            to="/ai-insights"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </Link>
          <Link
            to="/health-goals"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Target className="h-4 w-4" />
            <span>เป้าหมายสุขภาพ</span>
          </Link>
        </nav>
      </div>

      {/* New Chat Button */}
      <div className="p-4 flex-shrink-0">
        <button
          onClick={() => {
            // รีเซ็ตข้อความและเริ่มต้นใหม่โดยไม่สร้าง session
            setMessages([
              {
                id: "1",
                text: "สวัสดี! ฉันคือ AI สุขภาพที่พร้อมให้คำแนะนำเกี่ยวกับสุขภาพของคุณ มีอะไรให้ช่วยไหม?",
                isUser: false,
                timestamp: "เมื่อสักครู่",
              },
            ]);
            setSelectedSessionId("");
            setInputMessage("");
          }}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History - Scrollable only */}
      <div className="flex-1 overflow-y-auto min-h-0" data-lenis-prevent>
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
            {/* Today Section */}
            {chatSessions.filter((session) => {
              const today = new Date();
              const sessionDate = new Date(session.createdAt);
              return sessionDate.toDateString() === today.toDateString();
            }).length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setIsTodayExpanded(!isTodayExpanded)}
                    className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide mb-3 px-2 font-semibold hover:text-gray-700 transition-colors w-full text-left"
                  >
                    <Clock className="h-3 w-3" />
                    <span>ประวัติการสนทนา</span>
                    {isTodayExpanded ? (
                      <ChevronDown className="h-3 w-3 ml-auto" />
                    ) : (
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    )}
                  </button>
                  {isTodayExpanded && (
                    <div className="space-y-1">
                      {chatSessions
                        .filter((session) => {
                          const today = new Date();
                          const sessionDate = new Date(session.createdAt);
                          return (
                            sessionDate.toDateString() === today.toDateString()
                          );
                        })
                        .map((session) => (
                          <div
                            key={session.id}
                            className={`group px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${selectedSessionId === session.id
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
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                                title="ลบการสนทนา"
                              >
                                <Trash2 className="h-3 w-3 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

            {/* Previous Sessions */}
            {chatSessions.filter((session) => {
              const today = new Date();
              const sessionDate = new Date(session.createdAt);
              return sessionDate.toDateString() !== today.toDateString();
            }).length > 0 && (
                <div>
                  <button
                    onClick={() => setIsPreviousExpanded(!isPreviousExpanded)}
                    className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide mb-3 px-2 font-semibold hover:text-gray-700 transition-colors w-full text-left"
                  >
                    <History className="h-3 w-3" />
                    <span>ก่อนหน้า</span>
                    {isPreviousExpanded ? (
                      <ChevronDown className="h-3 w-3 ml-auto" />
                    ) : (
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    )}
                  </button>
                  {isPreviousExpanded && (
                    <div className="space-y-1">
                      {chatSessions
                        .filter((session) => {
                          const today = new Date();
                          const sessionDate = new Date(session.createdAt);
                          return (
                            sessionDate.toDateString() !== today.toDateString()
                          );
                        })
                        .map((session) => (
                          <div
                            key={session.id}
                            className={`group px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${selectedSessionId === session.id
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
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                                title="ลบการสนทนา"
                              >
                                <Trash2 className="h-3 w-3 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Sidebar Toggle Button - Bottom */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-full p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-gray-300 bg-white shadow-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          title={isSidebarOpen ? "ซ่อนแถบข้าง" : "แสดงแถบข้าง"}
        >
          <div className="flex items-center gap-2 transition-all duration-300">
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="h-4 w-4 text-gray-700 transition-transform duration-300" />
                <span className="text-sm text-gray-700">ซ่อนแถบข้าง</span>
              </>
            ) : (
              <>
                <Menu className="h-4 w-4 text-gray-700 transition-transform duration-300" />
                <span className="text-sm text-gray-700">แสดงแถบข้าง</span>
              </>
            )}
          </div>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Header - Fixed */}
      {TopHeader}

      {/* Main Content Area - Scroll locked */}
      <main className="flex-1 flex bg-white transition-all duration-300 ease-in-out relative overflow-hidden">
        <div className="flex-1 flex">
          {/* Left Sidebar - Collapsible with Animation - Fixed width */}
          <div
            className={`transition-all duration-500 ease-in-out transform ${isSidebarOpen
              ? "w-64 flex-shrink-0 translate-x-0 opacity-100"
              : "w-0 flex-shrink-0 -translate-x-full opacity-0 pointer-events-none overflow-hidden"
              }`}
          >
            {LeftSidebar}
          </div>

          {/* Main Chat Area - Flexible */}
          <div className="flex-1 flex flex-col bg-white transition-all duration-300 ease-in-out relative min-w-0">
            {/* Floating Sidebar Toggle Button when sidebar is closed */}
            <div
              className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ease-in-out transform ${!isSidebarOpen
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-4 opacity-0 scale-95"
                }`}
            >
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-300 bg-white shadow-lg flex items-center gap-2 hover:scale-105"
              >
                <Menu className="h-4 w-4 text-gray-700" />
                <span className="text-sm text-gray-700">แสดงแถบข้าง</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages Area - Only this part scrolls */}
              <div className="flex-1 overflow-y-auto min-h-0" data-lenis-prevent>
                {messages.length === 1 && !isTyping ? (
                  <div className="h-full flex items-center justify-center px-6 py-12">
                    <div className="text-center w-full max-w-2xl">
                      <Ai04 onSubmit={handleSendMessage} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`w-full ${message.isUser ? "flex justify-end" : ""
                          }`}
                      >
                        {message.isUser ? (
                          // User message - align with AI message
                          <div className="w-full  py-8 bg-white">
                            <div className="max-w-4xl mx-auto px-8">
                              <div className="flex justify-end">
                                <div className="max-w-[70%] flex flex-col items-end">
                                  {/* Message Content */}
                                  <div className="rounded-2xl px-5 py-3 shadow-md bg-blue-500 text-white group hover:bg-blue-600 transition-colors duration-200">
                                    <p className="text-sm leading-relaxed">
                                      {message.text}
                                    </p>
                                  </div>
                                  {message.image && (
                                    <div className="mt-2">
                                      <img
                                        src={message.image}
                                        alt="รูปภาพที่ส่ง"
                                        className="max-w-[180px] max-h-[180px] rounded-lg border border-gray-200 shadow-sm"
                                        style={{ objectFit: "cover" }}
                                        onError={(e) => {
                                          console.error(
                                            "Error loading user image:",
                                            message.image,
                                          );
                                          console.error(
                                            "Image src:",
                                            e.currentTarget.src,
                                          );
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                        onLoad={() => {
                                          console.log(
                                            "User image loaded successfully:",
                                            message.image,
                                          );
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // AI message - full width like ChatGPT
                          <div className="w-full  py-8 bg-white">
                            <div className="max-w-4xl mx-auto px-8 group">
                              {/* Message Content - Full Width */}
                              <div className="w-full">
                                <div className="prose prose-lg max-w-none">
                                  {/* Streaming effect for new AI messages */}
                                  {streamingMessageId === message.id ? (
                                    <div className="text-gray-700 leading-relaxed text-base">
                                      <StreamingText
                                        text={message.text}
                                        speed={8}
                                        showCursor={true}
                                        onComplete={() => {
                                          setStreamingMessageId(null);
                                          scrollToBottom();
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        // Headings with beautiful styling
                                        h1: ({ children }) => (
                                          <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-8 pb-3 ">
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
                                              "task-list-item",
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
                                  )}
                                </div>

                                {/* แสดงรูปภาพของ AI ถ้ามี */}
                                {message.image && (
                                  <div className="mt-4">
                                    <img
                                      src={message.image}
                                      alt="รูปภาพจาก AI"
                                      className="max-w-[300px] max-h-[300px] rounded-lg border border-gray-200 shadow-sm"
                                      style={{ objectFit: "cover" }}
                                      onError={(e) => {
                                        console.error(
                                          "Error loading AI image:",
                                          message.image,
                                        );
                                        console.error(
                                          "Image src:",
                                          e.currentTarget.src,
                                        );
                                        e.currentTarget.style.display = "none";
                                      }}
                                      onLoad={() => {
                                        console.log(
                                          "AI image loaded successfully:",
                                          message.image,
                                        );
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="w-full py-6 bg-white">
                        <div className="max-w-4xl mx-auto px-8">
                          <div className="flex items-center space-x-2">
                            <TextShimmer className="font-mono text-sm" duration={1}>
                              Thinking...
                            </TextShimmer>
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
              <div className="p-6 bg-white flex-shrink-0">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      {/* File Upload Button */}
                      {uploadedImage ? (
                        <div className="relative mr-2">
                          <img
                            src={uploadedImage}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded-xl border border-gray-300"
                          />
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              type="button"
                              className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 border border-gray-300 shadow"
                              title="ลบรูป"
                              onClick={() => {
                                setUploadedImage(null);
                                setUploadedFile(null);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-all duration-200 flex items-center justify-center"
                          title="เพิ่มรูปภาพ"
                        >
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (file) {
                                // ตรวจสอบประเภทไฟล์
                                const allowedTypes = [
                                  "image/png",
                                  "image/jpeg",
                                  "image/jpg",
                                  "image/webp",
                                ];
                                if (!allowedTypes.includes(file.type)) {
                                  toast({
                                    title: "ไฟล์ไม่รองรับ",
                                    description:
                                      "รองรับเฉพาะ png, jpg, jpeg, webp",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                // ตรวจสอบขนาดไฟล์
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({
                                    title: "ไฟล์ใหญ่เกินไป",
                                    description: "ขนาดไฟล์สูงสุด 5MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                // อ่านไฟล์และสร้าง preview
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const result = ev.target?.result;
                                  if (result && typeof result === "string") {
                                    setUploadedImage(result);
                                    setUploadedFile(file);
                                    toast({
                                      title: "เพิ่มรูปภาพสำเร็จ",
                                      description: `รูปภาพ: ${file.name}`,
                                    });
                                  } else {
                                    toast({
                                      title: "เกิดข้อผิดพลาด",
                                      description: "ไม่สามารถอ่านไฟล์รูปภาพได้",
                                      variant: "destructive",
                                    });
                                  }
                                };
                                reader.onerror = () => {
                                  toast({
                                    title: "เกิดข้อผิดพลาด",
                                    description: "ไม่สามารถอ่านไฟล์รูปภาพได้",
                                    variant: "destructive",
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {/* ไอคอนรูปภาพ */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </label>
                      )}

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
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isTyping}
                        className={`p-2 rounded-full transition-all duration-200 ${inputMessage.trim() && !isTyping
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
          </div>
        </div>
      </main>
    </div>
  );
}

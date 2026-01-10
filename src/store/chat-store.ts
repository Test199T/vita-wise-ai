import { create } from "zustand";
import { apiConfig } from "@/config/env";
import { tokenUtils } from "@/lib/utils";

// Types matching existing Chat.tsx patterns
export interface Message {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
    image?: string | null;
}

export interface ChatSession {
    id: string;
    title: string;
    icon: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
    lastMessage?: string;
}

interface ChatState {
    // State
    sessions: ChatSession[];
    selectedSessionId: string | null;
    messages: Message[];
    isLoadingSessions: boolean;
    isLoadingMessages: boolean;
    isSending: boolean;
    isStreaming: boolean;
    streamingMessageId: string | null;
    streamingText: string;

    // Actions
    selectSession: (sessionId: string | null) => void;
    fetchSessions: () => Promise<void>;
    createSession: (title?: string) => Promise<string | null>;
    deleteSession: (sessionId: string) => Promise<void>;
    fetchMessages: (sessionId: string) => Promise<void>;
    sendMessage: (content: string, imageFile?: File) => Promise<void>;
    sendMessageStream: (content: string, imageFile?: File) => Promise<void>;
    updateStreamingText: (text: string) => void;
    resetConversation: () => void;
}

// Helper: Format timestamp
const formatTimestamp = (timestamp: string): Date => {
    return new Date(timestamp);
};

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    sessions: [],
    selectedSessionId: null,
    messages: [],
    isLoadingSessions: false,
    isLoadingMessages: false,
    isSending: false,
    isStreaming: false,
    streamingMessageId: null,
    streamingText: "",

    // Update streaming text (for real-time display)
    updateStreamingText: (text) => {
        set({ streamingText: text });
    },

    // Select a session
    selectSession: (sessionId) => {
        set({ selectedSessionId: sessionId });
        if (sessionId) {
            get().fetchMessages(sessionId);
        } else {
            set({ messages: [] });
        }
    },

    // Fetch all sessions
    fetchSessions: async () => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        set({ isLoadingSessions: true });
        try {
            const response = await fetch(`${apiConfig.baseUrl}/api/chat/sessions`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    const sessions: ChatSession[] = data.data.map((session: any) => ({
                        id: session.id.toString(),
                        title: session.title || `AI สุขภาพ (${new Date(session.created_at).toLocaleDateString("th-TH")})`,
                        icon: "message-circle-dashed",
                        messages: [],
                        createdAt: formatTimestamp(session.created_at),
                        updatedAt: formatTimestamp(session.updated_at || session.created_at),
                        isArchived: false,
                        lastMessage: session.last_message || "",
                    }));
                    set({ sessions });
                }
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            set({ isLoadingSessions: false });
        }
    },

    // Create new session
    createSession: async (title?: string) => {
        const token = tokenUtils.getValidToken();
        if (!token) return null;

        try {
            const response = await fetch(`${apiConfig.baseUrl}/api/chat/sessions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title || `AI สุขภาพ (${new Date().toLocaleDateString("th-TH")})`,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    const newSession: ChatSession = {
                        id: data.data.id.toString(),
                        title: data.data.title || `AI สุขภาพ (${new Date().toLocaleDateString("th-TH")})`,
                        icon: "message-circle-dashed",
                        messages: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isArchived: false,
                    };

                    set((state) => ({
                        sessions: [newSession, ...state.sessions],
                        selectedSessionId: newSession.id,
                        messages: [],
                    }));

                    return newSession.id;
                }
            }
        } catch (error) {
            console.error("Error creating session:", error);
        }
        return null;
    },

    // Delete session
    deleteSession: async (sessionId) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        try {
            const response = await fetch(`${apiConfig.baseUrl}/api/chat/sessions/${sessionId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                set((state) => {
                    const newSessions = state.sessions.filter(s => s.id !== sessionId);
                    return {
                        sessions: newSessions,
                        selectedSessionId: state.selectedSessionId === sessionId ? null : state.selectedSessionId,
                        messages: state.selectedSessionId === sessionId ? [] : state.messages,
                    };
                });
            }
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    },

    // Fetch messages for a session
    fetchMessages: async (sessionId) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        set({ isLoadingMessages: true });
        try {
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
                if (data.success && data.data) {
                    const messages: Message[] = data.data.map((msg: any) => ({
                        id: msg.id.toString(),
                        content: msg.message_text,
                        sender: msg.is_user_message ? "user" : "ai",
                        timestamp: new Date(msg.timestamp),
                        image: msg.image_url
                            ? msg.image_url.startsWith("http")
                                ? msg.image_url
                                : `${apiConfig.baseUrl}/${msg.image_url.replace(/^\//, "")}`
                            : null,
                    }));
                    set({ messages });
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            set({ isLoadingMessages: false });
        }
    },

    // Send message
    sendMessage: async (content, imageFile) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        const state = get();
        let sessionId = state.selectedSessionId;

        // Create session if none selected
        if (!sessionId) {
            sessionId = await state.createSession();
            if (!sessionId) return;
        }

        set({ isSending: true });

        // Add user message optimistically
        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            sender: "user",
            timestamp: new Date(),
            image: imageFile ? URL.createObjectURL(imageFile) : null,
        };
        set((s) => ({ messages: [...s.messages, userMessage] }));

        try {
            const baseUrl = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages`;
            let response: Response;

            if (imageFile) {
                // With image: use multipart endpoint
                const formData = new FormData();
                formData.append("message", content);
                formData.append("session_id", sessionId);
                formData.append("timestamp", new Date().toISOString());
                formData.append("image", imageFile);

                response = await fetch(`${baseUrl}/multipart`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
            } else {
                // Text only: use JSON endpoint
                response = await fetch(baseUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: content,
                        session_id: sessionId,
                        timestamp: new Date().toISOString(),
                    }),
                });
            }

            let data: any = null;
            try {
                data = await response.json();
            } catch {
                const text = await response.text().catch(() => "<no body>");
                console.error("Failed to parse JSON response:", text);
                data = { success: false, message: `Non-JSON response: ${text}` };
            }

            // Accept response if HTTP OK and has AI response
            const hasAiResponse = data?.data?.aiMessage || data?.message;

            if (response.ok && (data.success || hasAiResponse)) {
                const aiText =
                    data.data?.aiMessage?.message_text ||
                    data.data?.aiMessage?.text ||
                    data.data?.aiMessage?.content ||
                    data.data?.response ||
                    data.message ||
                    "ขออภัย ไม่สามารถตอบกลับได้";

                const aiMessage: Message = {
                    id: data.data?.aiMessage?.id?.toString() || `ai-${Date.now()}`,
                    content: aiText,
                    sender: "ai",
                    timestamp: new Date(),
                };
                set((s) => ({ messages: [...s.messages, aiMessage] }));

                // Update session last message
                set((s) => ({
                    sessions: s.sessions.map((session) =>
                        session.id === sessionId
                            ? { ...session, lastMessage: content, updatedAt: new Date() }
                            : session
                    ),
                }));
            } else {
                // Handle error
                const errorMessage = data?.message || "เกิดข้อผิดพลาดในการส่งข้อความ";
                const aiMessage: Message = {
                    id: `error-${Date.now()}`,
                    content: `⚠️ ${errorMessage} กรุณาลองใหม่อีกครั้ง`,
                    sender: "ai",
                    timestamp: new Date(),
                };
                set((s) => ({ messages: [...s.messages, aiMessage] }));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const aiMessage: Message = {
                id: `error-${Date.now()}`,
                content: "⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
                sender: "ai",
                timestamp: new Date(),
            };
            set((s) => ({ messages: [...s.messages, aiMessage] }));
        } finally {
            set({ isSending: false });
        }
    },

    // Reset conversation (for new chat from welcome screen)
    resetConversation: () => {
        set({
            selectedSessionId: null,
            messages: [],
        });
    },

    // Send message with streaming response (SSE)
    sendMessageStream: async (content, imageFile) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        const state = get();
        let sessionId = state.selectedSessionId;

        // Create session if none selected
        if (!sessionId) {
            sessionId = await state.createSession();
            if (!sessionId) return;
        }

        set({ isSending: true, isStreaming: true, streamingText: "" });

        // Add user message optimistically
        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            sender: "user",
            timestamp: new Date(),
            image: imageFile ? URL.createObjectURL(imageFile) : null,
        };
        
        // Create placeholder for AI streaming message
        const streamingMsgId = `streaming-${Date.now()}`;
        const aiPlaceholder: Message = {
            id: streamingMsgId,
            content: "",
            sender: "ai",
            timestamp: new Date(),
        };

        set((s) => ({
            messages: [...s.messages, userMessage, aiPlaceholder],
            streamingMessageId: streamingMsgId,
        }));

        try {
            const streamUrl = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages/stream`;
            
            const response = await fetch(streamUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: content,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No response body reader available");
            }

            const decoder = new TextDecoder();
            let fullMessage = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                
                // Keep the last incomplete line in buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith("data: ")) {
                        try {
                            const jsonStr = trimmedLine.slice(6);
                            if (!jsonStr) continue;
                            
                            const data = JSON.parse(jsonStr);

                            if (data.done) {
                                // Stream complete
                                console.log("Stream complete:", fullMessage);
                            } else if (data.token) {
                                // Append token to message
                                fullMessage += data.token;
                                
                                // Update streaming text and message in real-time
                                set((s) => ({
                                    streamingText: fullMessage,
                                    messages: s.messages.map((msg) =>
                                        msg.id === streamingMsgId
                                            ? { ...msg, content: fullMessage }
                                            : msg
                                    ),
                                }));
                            } else if (data.error) {
                                console.error("Stream error:", data.error);
                                throw new Error(data.error);
                            }
                        } catch (parseError) {
                            // Skip invalid JSON lines
                            console.warn("Failed to parse SSE data:", trimmedLine);
                        }
                    }
                }
            }

            // Finalize the message
            set((s) => ({
                messages: s.messages.map((msg) =>
                    msg.id === streamingMsgId
                        ? { ...msg, id: `ai-${Date.now()}`, content: fullMessage || "ขออภัย ไม่สามารถตอบกลับได้" }
                        : msg
                ),
                streamingMessageId: null,
                streamingText: "",
            }));

            // Update session last message
            set((s) => ({
                sessions: s.sessions.map((session) =>
                    session.id === sessionId
                        ? { ...session, lastMessage: content, updatedAt: new Date() }
                        : session
                ),
            }));

        } catch (error) {
            console.error("Error in streaming message:", error);
            
            // Update placeholder with error message
            set((s) => ({
                messages: s.messages.map((msg) =>
                    msg.id === streamingMsgId
                        ? {
                            ...msg,
                            id: `error-${Date.now()}`,
                            content: `⚠️ ${error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ"} กรุณาลองใหม่อีกครั้ง`,
                        }
                        : msg
                ),
                streamingMessageId: null,
                streamingText: "",
            }));
        } finally {
            set({ isSending: false, isStreaming: false });
        }
    },
}));

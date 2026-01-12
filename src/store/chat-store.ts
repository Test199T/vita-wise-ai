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

// Pagination state
export interface MessagePagination {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

// Session error types
export type SessionErrorType = 'not_found' | 'forbidden' | 'server_error' | 'invalid_id' | null;

export interface SessionError {
    type: SessionErrorType;
    message: string;
}

interface ChatState {
    // State
    sessions: ChatSession[];
    selectedSessionId: string | null;
    messages: Message[];
    isLoadingSessions: boolean;
    isLoadingMessages: boolean;
    isLoadingMoreMessages: boolean;
    isSending: boolean;
    isStreaming: boolean;
    streamingMessageId: string | null;
    streamingText: string;

    // Error state
    sessionError: SessionError | null;

    // Pagination state
    messagePagination: MessagePagination | null;

    // Actions
    selectSession: (sessionId: string | null) => void;
    setSessionFromUrl: (sessionId: string | null) => void;
    fetchSessions: () => Promise<void>;
    createSession: (title?: string) => Promise<string | null>;
    createSessionOnly: (title?: string) => Promise<string | null>;
    updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    fetchMessages: (sessionId: string, page?: number, limit?: number) => Promise<SessionErrorType>;
    loadMoreMessages: () => Promise<void>;
    sendMessage: (content: string, imageData?: ImageData) => Promise<void>;
    sendMessageStream: (content: string, imageData?: ImageData) => Promise<void>;
    sendMessageStreamWithSession: (sessionId: string, content: string, imageData?: ImageData) => Promise<void>;
    updateStreamingText: (text: string) => void;
    resetConversation: () => void;
    clearSessionError: () => void;
}

// Image data type - supports both file upload and base64 paste
export interface ImageData {
    type: 'file' | 'base64';
    file?: File;
    base64?: string;
    previewUrl?: string; // For displaying in UI
}

// Helper: Format timestamp
const formatTimestamp = (timestamp: string): Date => {
    return new Date(timestamp);
};

// Helper: Generate a short title from user message
const generateTitleFromMessage = (message: string): string => {
    // Remove extra whitespace and truncate
    const cleaned = message.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= 35) return cleaned;
    // Truncate at word boundary if possible
    const truncated = cleaned.substring(0, 35);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 20) {
        return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
};

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    sessions: [],
    selectedSessionId: null,
    messages: [],
    isLoadingSessions: false,
    isLoadingMessages: false,
    isLoadingMoreMessages: false,
    isSending: false,
    isStreaming: false,
    streamingMessageId: null,
    streamingText: "",
    sessionError: null,
    messagePagination: null,

    // Update streaming text (for real-time display)
    updateStreamingText: (text) => {
        set({ streamingText: text });
    },

    // Clear session error
    clearSessionError: () => {
        set({ sessionError: null });
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

    // Set session from URL (doesn't fetch messages, that's handled separately)
    setSessionFromUrl: (sessionId) => {
        set({ selectedSessionId: sessionId });
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
                        id: session.id, // UUID is already a string
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
                        id: data.data.id, // UUID is already a string
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

    // Create session only (for URL navigation - doesn't select it, returns ID)
    createSessionOnly: async (title?: string) => {
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
                        id: data.data.id, // UUID is already a string
                        title: data.data.title || `AI สุขภาพ (${new Date().toLocaleDateString("th-TH")})`,
                        icon: "message-circle-dashed",
                        messages: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isArchived: false,
                    };

                    // Add to sessions list but don't select
                    set((state) => ({
                        sessions: [newSession, ...state.sessions],
                    }));

                    return newSession.id;
                }
            }
        } catch (error) {
            console.error("Error creating session:", error);
        }
        return null;
    },

    // Update session title
    updateSessionTitle: async (sessionId, title) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        // Update local state immediately (optimistic update)
        set((state) => ({
            sessions: state.sessions.map(session =>
                session.id === sessionId
                    ? { ...session, title, updatedAt: new Date() }
                    : session
            ),
        }));

        // Update backend (fire and forget, don't block UI)
        try {
            await fetch(`${apiConfig.baseUrl}/api/chat/sessions/${sessionId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title }),
            });
            console.log("✅ Session title updated:", { sessionId, title });
        } catch (error) {
            console.error("Error updating session title:", error);
            // Could revert optimistic update here if needed
        }
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

    // Fetch messages for a session with pagination and error handling
    fetchMessages: async (sessionId, page = 1, limit = 50) => {
        const token = tokenUtils.getValidToken();
        if (!token) return 'server_error';

        set({ isLoadingMessages: true, sessionError: null });
        try {
            const response = await fetch(
                `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages?page=${page}&limit=${limit}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Handle error status codes
            if (!response.ok) {
                let errorType: SessionErrorType = 'server_error';
                let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่';

                if (response.status === 404) {
                    errorType = 'not_found';
                    errorMessage = 'ไม่พบการสนทนานี้';
                } else if (response.status === 403) {
                    errorType = 'forbidden';
                    errorMessage = 'คุณไม่มีสิทธิ์เข้าถึงการสนทนานี้';
                } else if (response.status === 500) {
                    errorType = 'server_error';
                    errorMessage = 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่';
                }

                set({
                    sessionError: { type: errorType, message: errorMessage },
                    messages: [],
                    messagePagination: null,
                });
                return errorType;
            }

            const data = await response.json();
            if (data.success && data.data) {
                // New API format: data.data.messages (array) and data.data.pagination
                const messagesData = Array.isArray(data.data) ? data.data : (data.data.messages || []);
                const paginationData = data.data.pagination || data.pagination;

                const messages: Message[] = messagesData.map((msg: any) => ({
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

                // Handle pagination from API response
                const pagination: MessagePagination = paginationData ? {
                    page: paginationData.page || page,
                    limit: paginationData.limit || limit,
                    total: paginationData.total || messages.length,
                    hasMore: paginationData.hasMore ?? messages.length >= limit,
                } : {
                    page: 1,
                    limit: 50,
                    total: messages.length,
                    hasMore: false, // No pagination info means no more
                };

                set({ messages, messagePagination: pagination, sessionError: null });
                return null;
            }
            return null;
        } catch (error) {
            console.error("Error fetching messages:", error);
            set({
                sessionError: {
                    type: 'server_error',
                    message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
                },
                messages: [],
            });
            return 'server_error';
        } finally {
            set({ isLoadingMessages: false });
        }
    },

    // Load more messages (older messages) for pagination
    loadMoreMessages: async () => {
        const state = get();
        const { selectedSessionId, messagePagination, isLoadingMoreMessages, messages } = state;

        if (!selectedSessionId || !messagePagination || !messagePagination.hasMore || isLoadingMoreMessages) {
            return;
        }

        const token = tokenUtils.getValidToken();
        if (!token) return;

        const nextPage = messagePagination.page + 1;
        set({ isLoadingMoreMessages: true });

        try {
            const response = await fetch(
                `${apiConfig.baseUrl}/api/chat/sessions/${selectedSessionId}/messages?page=${nextPage}&limit=${messagePagination.limit}`,
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
                    // New API format: data.data.messages (array) and data.data.pagination
                    const messagesData = Array.isArray(data.data) ? data.data : (data.data.messages || []);
                    const paginationData = data.data.pagination || data.pagination;

                    const olderMessages: Message[] = messagesData.map((msg: any) => ({
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

                    // Prepend older messages to existing messages
                    const newPagination: MessagePagination = paginationData ? {
                        page: paginationData.page || nextPage,
                        limit: paginationData.limit || messagePagination.limit,
                        total: paginationData.total || (messages.length + olderMessages.length),
                        hasMore: paginationData.hasMore ?? olderMessages.length >= messagePagination.limit,
                    } : {
                        page: nextPage,
                        limit: messagePagination.limit,
                        total: messages.length + olderMessages.length,
                        hasMore: false,
                    };

                    set({
                        messages: [...olderMessages, ...messages],
                        messagePagination: newPagination,
                    });
                }
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            set({ isLoadingMoreMessages: false });
        }
    },

    // Send message
    sendMessage: async (content, imageData) => {
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
            image: imageData?.previewUrl || null,
        };
        set((s) => ({ messages: [...s.messages, userMessage] }));

        try {
            const baseUrl = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages`;
            let response: Response;

            if (imageData?.type === 'base64' && imageData.base64) {
                // Clipboard paste: use base64 endpoint
                response = await fetch(`${baseUrl}/with-image`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: content,
                        image_base64: imageData.base64,
                        analyze_image: true,
                    }),
                });
            } else if (imageData?.type === 'file' && imageData.file) {
                // File upload: use multipart endpoint
                const formData = new FormData();
                formData.append("message", content);
                formData.append("session_id", sessionId);
                formData.append("timestamp", new Date().toISOString());
                formData.append("image", imageData.file);

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

    // Send message with streaming to a specific session (for URL-based navigation)
    sendMessageStreamWithSession: async (sessionId, content, imageData) => {
        const token = tokenUtils.getValidToken();
        if (!token) return;

        // Optimistically create session if it doesn't exist
        const currentState = get();
        const existingSession = currentState.sessions.find(s => s.id === sessionId);

        if (!existingSession) {
            const newSession: ChatSession = {
                id: sessionId,
                title: generateTitleFromMessage(content) || "New Chat",
                createdAt: new Date(),
                updatedAt: new Date(),
                lastMessage: content,
                messages: [], // Optimistic update will push message to store state anyway
                isArchived: false,
                icon: "MessagesSquare"
            };
            set(s => ({
                sessions: [newSession, ...s.sessions],
                selectedSessionId: sessionId
            }));
        }

        set({
            isSending: true,
            isStreaming: true,
            streamingText: "",
            selectedSessionId: sessionId,
        });

        // Add user message optimistically
        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            sender: "user",
            timestamp: new Date(),
            image: imageData?.previewUrl || null,
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

        // Auto-generate title from first message (if this is the first message in the session)
        // Note: We already generated title optimistically above, but we might want to update it if backend returns differently later
        // For now, removing the duplicate title generation check here to avoid conflict
        const session = get().sessions.find(s => s.id === sessionId);
        const isDefaultTitle = session?.title?.startsWith('AI สุขภาพ') || !session?.title || session?.title === "New Chat";
        if (isDefaultTitle && content) {
            const generatedTitle = generateTitleFromMessage(content);
            get().updateSessionTitle(sessionId, generatedTitle);
        }

        try {
            let response: Response;

            if (imageData?.type === 'base64' && imageData.base64) {
                // Use base64 endpoint for clipboard paste
                const url = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages/with-image`;
                response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: content,
                        image_base64: imageData.base64,
                        analyze_image: true,
                    }),
                });
            } else if (imageData?.type === 'file' && imageData.file) {
                // Use multipart endpoint for file upload
                const formData = new FormData();
                formData.append("message", content);
                formData.append("image", imageData.file);

                const url = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages/multipart`;
                response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
            } else {
                // No image, use stream endpoint
                const streamUrl = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages/stream`;
                response = await fetch(streamUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: content,
                    }),
                });
            }

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

                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith("data: ")) {
                        try {
                            const jsonStr = trimmedLine.slice(6);
                            if (!jsonStr) continue;

                            const data = JSON.parse(jsonStr);

                            if (data.done) {
                                console.log("Stream complete:", fullMessage);
                            } else if (data.token) {
                                fullMessage += data.token;

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

    // Send message with streaming response (SSE)
    sendMessageStream: async (content, imageData) => {
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
            image: imageData?.previewUrl || null,
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

        // Auto-generate title from first message (if session has default title)
        const currentState = get();
        const session = currentState.sessions.find(s => s.id === sessionId);
        const isDefaultTitle = session?.title?.startsWith('AI สุขภาพ') || !session?.title;
        if (isDefaultTitle && content && sessionId) {
            const generatedTitle = generateTitleFromMessage(content);
            get().updateSessionTitle(sessionId, generatedTitle);
        }

        try {
            let response: Response;

            if (imageData?.type === 'base64' && imageData.base64) {
                // Clipboard paste: use base64 endpoint
                const url = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages/with-image`;
                response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: content,
                        image_base64: imageData.base64,
                        analyze_image: true,
                    }),
                });
            } else if (imageData?.type === 'file' && imageData.file) {
                // File upload: use multipart endpoint
                const formData = new FormData();
                formData.append("message", content);
                formData.append("image", imageData.file);

                const url = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages/multipart`;
                response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
            } else {
                // No image: use stream endpoint
                const streamUrl = `${apiConfig.baseUrl}/api/chat/sessions/${sessionId}/messages/stream`;
                response = await fetch(streamUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: content,
                    }),
                });
            }

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

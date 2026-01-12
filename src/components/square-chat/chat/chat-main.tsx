import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChatWelcomeScreen } from "./chat-welcome-screen";
import { ChatConversationView } from "./chat-conversation-view";
import { useChatStore, ImageData } from "@/store/chat-store";

export function ChatMain() {
    const [message, setMessage] = useState("");
    const [selectedMode, setSelectedMode] = useState("fast");
    const [selectedModel, setSelectedModel] = useState("square-3");
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const navigate = useNavigate();
    const { sessionId: urlSessionId } = useParams<{ sessionId?: string }>();

    const {
        messages,
        selectedSessionId,
        isSending,
        isStreaming,
        streamingMessageId,
        isLoadingMoreMessages,
        messagePagination,
        sendMessageStream,
        sendMessageStreamWithSession,
        createSessionOnly,
        resetConversation,
        loadMoreMessages,
    } = useChatStore();

    // Convert store messages to component format
    const displayMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
        image: msg.image,
    }));

    // Conversation is started if we have a session ID (from URL or store) or messages
    const isConversationStarted = urlSessionId !== undefined || selectedSessionId !== null || displayMessages.length > 0;

    const handleSend = async (content?: string, imageData?: ImageData) => {
        const messageText = content || message;
        if (!messageText.trim() && !imageData) return;

        setMessage("");

        // If no session yet (welcome screen), create one (Client-side UUID) and send message
        if (!urlSessionId && !selectedSessionId) {
            // Generate UUID locally
            const newSessionId = crypto.randomUUID();

            // Navigate immediately
            navigate(`/chat/${newSessionId}`, { replace: true });

            // Send message with new Session ID (Backend will auto-create session)
            sendMessageStreamWithSession(newSessionId, messageText, imageData);
        } else {
            // Use existing session
            await sendMessageStream(messageText, imageData);
        }
    };

    const handleReset = () => {
        resetConversation();
        setMessage("");
        navigate("/chat");
    };

    const handleSendMessage = async (content: string, imageData?: ImageData) => {
        // For conversation view, always have a session
        await sendMessageStream(content, imageData);
        setMessage("");
    };

    const handleLoadMore = async () => {
        await loadMoreMessages();
    };

    return (
        <div className="h-full min-h-0 overflow-hidden">
            {isConversationStarted ? (
                <ChatConversationView
                    messages={displayMessages}
                    message={message}
                    onMessageChange={setMessage}
                    onSend={handleSendMessage}
                    onReset={handleReset}
                    isLoading={isSending}
                    isStreaming={isStreaming}
                    streamingMessageId={streamingMessageId}
                    isLoadingMore={isLoadingMoreMessages}
                    hasMoreMessages={messagePagination?.hasMore ?? false}
                    onLoadMore={handleLoadMore}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                />
            ) : (
                <ChatWelcomeScreen
                    message={message}
                    onMessageChange={setMessage}
                    onSend={handleSend}
                    selectedMode={selectedMode}
                    onModeChange={setSelectedMode}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    isLoading={isCreatingSession}
                />
            )}
        </div>
    );
}

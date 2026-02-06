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
        stopStreaming,
        createSessionOnly,
        updateSessionTitle,
        resetConversation,
        loadMoreMessages,
        editMessage,
        regenerateFromMessage,
    } = useChatStore();

    // Convert store messages to component format
    const displayMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
        image: msg.image,
        deliveryStatus: msg.deliveryStatus,
        errorMessage: msg.errorMessage,
    }));

    // Conversation is started if we have a session ID (from URL or store) or messages
    const isConversationStarted = urlSessionId !== undefined || selectedSessionId !== null || displayMessages.length > 0;

    const handleSend = async (content?: string, imageData?: ImageData) => {
        const messageText = content || message;
        if (!messageText.trim() && !imageData) return;

        setMessage("");

        // If no session yet (welcome screen), create one (Client-side UUID) and send message
        // If no session yet (welcome screen), create one
        if (!urlSessionId && !selectedSessionId) {
            setIsCreatingSession(true);
            try {
                // Determine initial title from message content
                const initialTitle = messageText.trim().slice(0, 40) + (messageText.length > 40 ? "..." : "");

                // Create session on server first to ensure title is set correctly
                // This prevents the "default title" issue on refresh
                const newSessionId = await createSessionOnly(initialTitle);

                if (newSessionId) {
                    // Navigate to the new session
                    navigate(`/chat/${newSessionId}`, { replace: true });

                    // Send the message
                    await sendMessageStreamWithSession(newSessionId, messageText, imageData);

                    // FORCE UPDATE TITLE: Ensure backend has the correct title
                    // This creates a "belt and suspenders" fix in case POST creation ignored the title
                    await updateSessionTitle(newSessionId, initialTitle);
                } else {
                    // Fallback to client-side ID if server creation fails (unlikely)
                    const tempId = crypto.randomUUID();
                    navigate(`/chat/${tempId}`, { replace: true });
                    await sendMessageStreamWithSession(tempId, messageText, imageData);
                    // Also try to update title here if it eventually syncs
                    updateSessionTitle(tempId, initialTitle);
                }
            } catch (error) {
                console.error("Failed to create session:", error);
            } finally {
                setIsCreatingSession(false);
            }
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
        await sendMessageStream(content, imageData);
        setMessage("");
    };

    const handleEdit = (id: string, newContent: string) => {
        // Edit and regenerate response
        regenerateFromMessage(id, newContent);
    };

    const handleRegenerate = () => {
        if (messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender === 'ai') {
            // Find previous user message
            const prevUserMsg = messages[messages.length - 2];
            if (prevUserMsg && prevUserMsg.sender === 'user') {
                regenerateFromMessage(prevUserMsg.id);
            }
        } else if (lastMsg.sender === 'user' || lastMsg.id.startsWith('error-')) {
            // Retry last user message (or if last was error)
            // If last is error, find the user msg before it? 
            // Usually error msg replaces AI msg. 
            // If error is last, it has sender 'ai'. So it falls into first block.
            // If sender is 'user' (stuck?), regenerate it.
            regenerateFromMessage(lastMsg.id);
        }
    };

    const handleFeedback = (id: string, feedback: 'like' | 'dislike') => {
        console.log("Feedback:", id, feedback);
    };

    const handleLoadMore = async () => {
        await loadMoreMessages();
    };

    const handleStopStreaming = () => {
        stopStreaming();
    };

    const handleRetryMessage = async (messageId: string) => {
        if (isSending || isStreaming) return;
        const targetMessage = messages.find((msg) => msg.id === messageId);
        if (!targetMessage || targetMessage.sender !== "user") return;
        await regenerateFromMessage(messageId);
    };

    return (
        <div className="h-full min-h-0 overflow-hidden">
            {isConversationStarted ? (
                <ChatConversationView
                    messages={displayMessages}
                    message={message}
                    onMessageChange={setMessage}
                    onSend={handleSendMessage}
                    onStopStreaming={handleStopStreaming}
                    onReset={handleReset}
                    isLoading={isSending}
                    isStreaming={isStreaming}
                    streamingMessageId={streamingMessageId}
                    isLoadingMore={isLoadingMoreMessages}
                    hasMoreMessages={messagePagination?.hasMore ?? false}
                    onLoadMore={handleLoadMore}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    onEdit={handleEdit}
                    onRegenerate={handleRegenerate}
                    onFeedback={handleFeedback}
                    onRetry={handleRetryMessage}
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

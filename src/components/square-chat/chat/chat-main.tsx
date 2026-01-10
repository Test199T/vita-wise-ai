import { useState, useEffect, useRef } from "react";
import { ChatWelcomeScreen } from "./chat-welcome-screen";
import { ChatConversationView } from "./chat-conversation-view";
import { useChatStore } from "@/store/chat-store";

export function ChatMain() {
    const [message, setMessage] = useState("");
    const [selectedMode, setSelectedMode] = useState("fast");
    const [selectedModel, setSelectedModel] = useState("square-3");

    const {
        messages,
        selectedSessionId,
        isSending,
        isStreaming,
        streamingMessageId,
        sendMessageStream,
        resetConversation,
    } = useChatStore();

    // Convert store messages to component format
    const displayMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
        image: msg.image,
    }));

    const isConversationStarted = selectedSessionId !== null || displayMessages.length > 0;

    const handleSend = async (content?: string, file?: File) => {
        const messageText = content || message;
        if (!messageText.trim() && !file) return;

        setMessage("");
        // Use streaming API
        await sendMessageStream(messageText, file);
    };

    const handleReset = () => {
        resetConversation();
        setMessage("");
    };

    const handleSendMessage = async (content: string, file?: File) => {
        // Use streaming API
        await sendMessageStream(content, file);
        setMessage("");
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
                />
            )}
        </div>
    );
}

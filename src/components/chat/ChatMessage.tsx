import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Bot, User, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamingText } from './StreamingText';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  image?: string | null;
  isStreaming?: boolean;
  onStreamComplete?: () => void;
  userAvatar?: string;
}

/**
 * ChatMessage Component - Production Ready Version
 * 
 * แสดงข้อความแชทแบบมืออาชีพ พร้อม:
 * - Markdown rendering
 * - Copy button
 * - User/AI avatar
 * - Streaming effect สำหรับ AI (typing animation)
 * - Image preview
 */
export function ChatMessage({
  message,
  isUser,
  timestamp,
  image,
  isStreaming = false,
  onStreamComplete,
  userAvatar,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn(
      "group flex gap-3 mb-4 px-2",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* AI Avatar */}
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[75%] flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {/* Message Card */}
        <Card className={cn(
          "shadow-soft relative overflow-hidden",
          isUser
            ? "bg-gradient-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border-border rounded-tl-sm"
        )}>
          <CardContent className="p-3">
            {/* Image Preview */}
            {image && (
              <div className="mb-2">
                {!imageError ? (
                  <img
                    src={image}
                    alt="Attached"
                    className={cn(
                      'rounded-lg max-w-full max-h-48 object-cover transition-opacity cursor-pointer hover:opacity-90',
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    onClick={() => window.open(image, '_blank')}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <span>📷</span>
                    <span>ไม่สามารถโหลดรูปภาพได้</span>
                  </div>
                )}
                {!imageLoaded && !imageError && (
                  <div className="w-48 h-32 bg-muted animate-pulse rounded-lg" />
                )}
              </div>
            )}

            {/* Text Content with Markdown */}
            {message && (
              <div className={cn(
                "text-sm leading-relaxed",
                !isUser && "prose prose-sm max-w-none dark:prose-invert"
              )}>
                {isStreaming && !isUser ? (
                  <StreamingText
                    text={message}
                    onComplete={onStreamComplete}
                    showCursor={true}
                    speed={12}
                  />
                ) : !isUser ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom code block styling
                      code: ({ node, inline, className, children, ...props }: any) => {
                        if (inline) {
                          return (
                            <code
                              className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <pre className="bg-slate-900 text-slate-50 rounded-lg p-3 overflow-x-auto my-2 text-xs">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      },
                      // Custom link styling
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      // Custom list styling
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside space-y-1 my-1" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal list-inside space-y-1 my-1" />
                      ),
                      // Custom paragraph
                      p: ({ node, ...props }) => (
                        <p {...props} className="my-1" />
                      ),
                    }}
                  >
                    {message}
                  </ReactMarkdown>
                ) : (
                  <p>{message}</p>
                )}
              </div>
            )}
          </CardContent>

          {/* Copy Button (for AI messages only) */}
          {!isUser && message && !isStreaming && (
            <button
              onClick={handleCopy}
              className={cn(
                'absolute top-2 right-2 p-1.5 rounded-md',
                'text-muted-foreground hover:text-foreground',
                'bg-background/60 backdrop-blur-sm',
                'opacity-0 group-hover:opacity-100 transition-all duration-200',
                'hover:bg-muted hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              title="คัดลอกข้อความ"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </Card>

        {/* Timestamp */}
        <div className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground px-1",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <Clock className="w-3 h-3" />
          <span>{timestamp}</span>
          {copied && !isUser && (
            <span className="text-green-500 ml-1">• คัดลอกแล้ว</span>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {userAvatar ? (
            <AvatarImage src={userAvatar} alt="User" />
          ) : null}
          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default ChatMessage;
import React, { useState, useEffect, useRef } from 'react';

interface StreamingTextProps {
    text: string;
    speed?: number; // milliseconds per character
    onComplete?: () => void;
    className?: string;
    showCursor?: boolean;
}

/**
 * StreamingText Component
 * 
 * แสดงข้อความแบบ typing effect เหมือน ChatGPT
 * ทำให้ AI response ดูเป็นมืออาชีพมากขึ้น
 */
export const StreamingText: React.FC<StreamingTextProps> = ({
    text,
    speed = 15, // 15ms per character (fast but visible)
    onComplete,
    className = '',
    showCursor = true,
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const indexRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Reset when text changes
        setDisplayedText('');
        setIsComplete(false);
        indexRef.current = 0;

        if (!text) {
            setIsComplete(true);
            onComplete?.();
            return;
        }

        // Start streaming
        intervalRef.current = setInterval(() => {
            if (indexRef.current < text.length) {
                // Add characters in chunks for smoother effect
                const chunkSize = Math.min(3, text.length - indexRef.current);
                const newChars = text.slice(indexRef.current, indexRef.current + chunkSize);
                setDisplayedText(prev => prev + newChars);
                indexRef.current += chunkSize;
            } else {
                // Complete
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [text, speed, onComplete]);

    // Skip animation on click
    const handleClick = () => {
        if (!isComplete && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setDisplayedText(text);
            setIsComplete(true);
            onComplete?.();
        }
    };

    return (
        <span
            className={`streaming-text ${className}`}
            onClick={handleClick}
            style={{ cursor: !isComplete ? 'pointer' : 'default' }}
            title={!isComplete ? 'คลิกเพื่อแสดงทั้งหมด' : undefined}
        >
            {displayedText}
            {showCursor && !isComplete && (
                <span className="streaming-cursor animate-pulse">▊</span>
            )}
        </span>
    );
};

/**
 * useStreamingText Hook
 * 
 * สำหรับใช้ใน component ที่ต้องการควบคุม streaming เอง
 */
export const useStreamingText = (
    text: string,
    speed: number = 15,
    autoStart: boolean = true
) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const indexRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const start = () => {
        if (isStreaming || !text) return;

        setIsStreaming(true);
        setDisplayedText('');
        indexRef.current = 0;

        intervalRef.current = setInterval(() => {
            if (indexRef.current < text.length) {
                const chunkSize = Math.min(3, text.length - indexRef.current);
                const newChars = text.slice(indexRef.current, indexRef.current + chunkSize);
                setDisplayedText(prev => prev + newChars);
                indexRef.current += chunkSize;
            } else {
                stop();
                setIsComplete(true);
            }
        }, speed);
    };

    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsStreaming(false);
    };

    const skip = () => {
        stop();
        setDisplayedText(text);
        setIsComplete(true);
    };

    const reset = () => {
        stop();
        setDisplayedText('');
        setIsComplete(false);
        indexRef.current = 0;
    };

    useEffect(() => {
        if (autoStart && text) {
            start();
        }
        return () => stop();
    }, [text, autoStart]);

    return {
        displayedText,
        isComplete,
        isStreaming,
        start,
        stop,
        skip,
        reset,
    };
};

export default StreamingText;

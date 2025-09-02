import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

interface TypingEffectProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
}

const WORDS_PER_SECOND = 100;
const CHARS_PER_WORD = 5;
const DEFAULT_SPEED = 1000 / (WORDS_PER_SECOND * CHARS_PER_WORD); 

const TypingEffect: React.FC<TypingEffectProps> = ({ 
    text, 
    speed = DEFAULT_SPEED,
    onComplete
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [newLines, setNewLines] = useState<number[]>([]); 

    useEffect(() => {
        if (currentIndex < text.length && isTyping) {
            const timer = setTimeout(() => {
                const nextChar = text[currentIndex];
                setDisplayedText(prev => prev + nextChar);
                
                if (nextChar === '\n') {
                    setNewLines(prev => [...prev, currentIndex]);
                }
                
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timer);
        } else if (currentIndex >= text.length && isTyping) {
            setIsTyping(false);
            if (onComplete) {
                setTimeout(onComplete, 50);
            }
        }
    }, [currentIndex, text, speed, onComplete, isTyping]);

    useEffect(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsTyping(true);
        setNewLines([]);
    }, [text]);

    const getDisplayContent = () => {
        if (!isTyping) {
            return marked(displayedText) as string;
        }
        
        try {
            let partialMarkdown = marked(displayedText) as string;
            
            if (newLines.length > 0) {
                const recentNewLines = newLines.slice(-3);
                recentNewLines.forEach((_, index) => {
                    const fadeDelay = index * 0.1;
                    partialMarkdown = partialMarkdown.replace(
                        /<\/p>\s*<p>/g, 
                        `</p><p class="fade-in-line" style="animation-delay: ${fadeDelay}s">`
                    );
                });
            }
            
            return partialMarkdown;
        } catch {
            return displayedText;
        }
    };

    return (
        <span className="typing-text">
            <span dangerouslySetInnerHTML={{ __html: getDisplayContent() }} />
        </span>
    );
};

export default TypingEffect;

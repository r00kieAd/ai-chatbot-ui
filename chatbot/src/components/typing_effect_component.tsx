import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

interface TypingEffectProps {
    text: string;
    speed?: number; // Milliseconds per character
    onComplete?: () => void;
}

// Calculate speed for 100 WPS (Words Per Second)
// Average word = 5 characters, so 100 WPS = 500 characters per second
// 1000ms / 500 characters = 2ms per character
const WORDS_PER_SECOND = 100;
const CHARS_PER_WORD = 5;
const DEFAULT_SPEED = 1000 / (WORDS_PER_SECOND * CHARS_PER_WORD); // ~2ms per character

const TypingEffect: React.FC<TypingEffectProps> = ({ 
    text, 
    speed = DEFAULT_SPEED, // ~2ms for 100 WPS
    onComplete
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [newLines, setNewLines] = useState<number[]>([]); // Track new line positions

    useEffect(() => {
        if (currentIndex < text.length && isTyping) {
            const timer = setTimeout(() => {
                const nextChar = text[currentIndex];
                setDisplayedText(prev => prev + nextChar);
                
                // Track new line positions for fade animation
                if (nextChar === '\n') {
                    setNewLines(prev => [...prev, currentIndex]);
                }
                
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timer);
        } else if (currentIndex >= text.length && isTyping) {
            setIsTyping(false);
            if (onComplete) {
                setTimeout(onComplete, 50); // Quick transition to final markdown
            }
        }
    }, [currentIndex, text, speed, onComplete, isTyping]);

    // Reset when text changes
    useEffect(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsTyping(true);
        setNewLines([]);
    }, [text]);

    // Convert displayed text to markdown with fade effect on new lines
    const getDisplayContent = () => {
        if (!isTyping) {
            return marked(displayedText) as string;
        }
        
        try {
            let partialMarkdown = marked(displayedText) as string;
            
            // Add fade-in animation to recently added lines
            if (newLines.length > 0) {
                const recentNewLines = newLines.slice(-3); // Last 3 new lines get fade effect
                recentNewLines.forEach((_, index) => {
                    const fadeDelay = index * 0.1; // Stagger the fade
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
            {/* No cursor for bot messages */}
        </span>
    );
};

export default TypingEffect;

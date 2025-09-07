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
    // Track only index and content; new line indices no longer needed

    useEffect(() => {
        if (currentIndex < text.length && isTyping) {
            const timer = setTimeout(() => {
                const nextChar = text[currentIndex];
                setDisplayedText(prev => prev + nextChar);
                // No-op for newline; rendering logic handles partial lines safely
                
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timer);
        } else if (currentIndex >= text.length && isTyping) {
            setIsTyping(false);
            if (onComplete) {
                setTimeout(onComplete, 100);
            }
        }
    }, [currentIndex, text, speed, onComplete, isTyping]);

    useEffect(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsTyping(true);
    }, [text]);

    // Keep marked behavior consistent
    marked.setOptions({ breaks: true, gfm: true });

    const escapeHtml = (s: string) =>
        s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const renderWithMarked = (md: string) => {
        if (!md) return '';
        try {
            return (marked(md) as string) || '';
        } catch {
            return `<p>${escapeHtml(md)}</p>`;
        }
    };

    const getDisplayContent = () => {
        const content = displayedText;

        if (!isTyping) {
            const html = renderWithMarked(content);
            return html || `<p>${escapeHtml(content)}</p>`;
        }

        const fenceMatches = content.match(/```/g) || [];
        const insideFence = fenceMatches.length % 2 === 1;

        if (insideFence) {
            const lastFenceIndex = content.lastIndexOf('```');
            const beforeFence = content.slice(0, lastFenceIndex);
            const afterFence = content.slice(lastFenceIndex + 3);

            const newlineIdx = afterFence.indexOf('\n');
            const langToken = (newlineIdx >= 0 ? afterFence.slice(0, newlineIdx) : afterFence).trim();
            const hasNewlineAfterLang = newlineIdx >= 0;
            const codeContent = hasNewlineAfterLang ? afterFence.slice(newlineIdx + 1) : '';

            const stableHtml = renderWithMarked(beforeFence);

            if (!hasNewlineAfterLang) {
                const fenceLine = '```' + (langToken ? langToken : '');
                return (stableHtml || '') + `<p><code>${escapeHtml(fenceLine)}</code></p>`;
            }

            const langClass = langToken ? ` class="language-${escapeHtml(langToken)}"` : '';
            const codeHtml = `<pre><code${langClass}>${escapeHtml(codeContent)}</code></pre>`;
            return (stableHtml || '') + codeHtml;
        }

        const lines = content.split('\n');
        const pending = lines.pop() ?? '';
        const complete = lines.join('\n');

        const completeHtml = renderWithMarked(complete);
        const pendingHtml = pending ? `<p>${escapeHtml(pending)}</p>` : '';

        const html = (completeHtml || '') + pendingHtml;
        return html || `<p>${escapeHtml(content)}</p>`;
    };

    return (
        <span className="typing-text" style={{ minHeight: '1.2em', display: 'block', lineHeight: 1.4 }}>
            <span
                dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
                style={{ display: 'block' }}
            />
        </span>
    );
};

export default TypingEffect;

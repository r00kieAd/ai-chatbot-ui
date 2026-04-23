import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { marked } from 'marked';
const LordIcon = 'lord-icon' as any;

declare global {
    interface Window {
        hljs?: { highlightElement: (el: HTMLElement) => void };
    }
}

marked.setOptions({
    breaks: true,
    gfm: true,
});

interface ChatMessageProps {
    userMessage: string;
    userTime: string;
    botMessage: string;
    botImages?: { url: string; alt?: string }[];
    botTime: string;
    llmprovider?: string;
    llmModel?: string;
    personality?: string;
    isStreaming?: boolean;
}

const escapeHtml = (input: string): string =>
    input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const convertMarkdownToHTML = (text: string): string => {
    if (!text || text.trim() === '') {
        return '';
    }

    try {
        const renderer = new marked.Renderer();
        renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
            const language = (lang ?? '').trim().split(/\s+/)[0];
            const langClass = language ? `language-${escapeHtml(language)}` : '';
            const escapedCode = escapeHtml(text);
            return `<div class="code-block"><button type="button" class="copy-code-btn" aria-label="Copy code"><i class="fa-regular fa-copy"></i></button><pre><code class="${langClass}">${escapedCode}</code></pre></div>`;
        };

        const htmlOutput = marked(text, { renderer }) as string;
        // console.log('Markdown conversion:', { input: text.substring(0, 100) + '...', output: htmlOutput.substring(0, 200) + '...' });
        return htmlOutput;
    } catch (error) {
        console.error('Markdown conversion failed:', error);
        return `<p>${text}</p>`;
    }
};

const ChatMessage: React.FC<ChatMessageProps> = ({ userMessage, userTime, botMessage, botImages, botTime, llmprovider, llmModel, isStreaming = false }) => {
    const [isNewMessage, setIsNewMessage] = useState(true);
    const [firstMessage, setFirstMessage] = useState(true);
    const userMessageDiv = useRef<HTMLDivElement>(null);
    const chatExchangeRef = useRef<HTMLDivElement>(null);
    const botMessageRef = useRef<HTMLDivElement>(null);
    // isStreaming = true;
    // const [fixedPersonality] = useState(messagePersonality ?? globalPersonality ?? null);
    // const currentPersonality = fixedPersonality;

    // console.log(llmprovider, llmModel);
    useEffect(() => {
        if (!botMessage) return;
        const timer = setTimeout(() => {
            setIsNewMessage(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [botMessage]);

    useEffect(() => {
        if (firstMessage && userMessageDiv.current) {
            userMessageDiv.current.style.marginTop = "30px";
            setFirstMessage(false);
        } else if (userMessageDiv.current) {
            // userMessageDiv.current.style.marginTop = "20px";
        }
    }, [firstMessage])

    useEffect(() => {
        const hasAnyContent = Boolean(userMessage) || Boolean(botMessage) || (botImages && botImages.length > 0);
        if (!hasAnyContent) return;
        botMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, [userMessage, botMessage, botImages]);

    useLayoutEffect(() => {
        const root = chatExchangeRef.current;
        if (!root) return;

        if (window.hljs?.highlightElement) {
            const codeBlocks = Array.from(root.querySelectorAll('pre code')) as HTMLElement[];
            for (const codeEl of codeBlocks) {
                if (codeEl.classList.contains('hljs')) continue;
                window.hljs.highlightElement(codeEl);
            }
        }
    }, [userMessage, botMessage, botImages, isStreaming, isNewMessage]);

    useEffect(() => {
        const root = chatExchangeRef.current;
        if (!root) return;

        const handleClick = (ev: MouseEvent) => {
            const target = ev.target as HTMLElement | null;
            if (!target) return;

            const btn = target.closest('.copy-code-btn') as HTMLElement | null;
            if (!btn) return;

            const wrapper = btn.closest('.code-block') as HTMLElement | null;
            const codeEl = wrapper?.querySelector('pre code') as HTMLElement | null;
            if (!codeEl) return;

            triggerIconFade(btn);
            writeToClipboard((codeEl.textContent ?? '').trimEnd()).catch(() => undefined);
        };

        root.addEventListener('click', handleClick);
        return () => root.removeEventListener('click', handleClick);
    }, []);

    const placeholderVisible = !botMessage && !(botImages && botImages.length > 0);
    const lordIconSrc = 'https://cdn.lordicon.com/wpequvda.json';
    const lordIconTrigger = placeholderVisible || isStreaming ? 'loop' : 'in';
    const lordIconState = 'loop-jab';

    const triggerIconFade = (container: HTMLElement) => {
        const icon = container.querySelector('i');
        if (!icon) return;

        icon.classList.remove('fa-beat');
        icon.getBoundingClientRect().width;
        icon.classList.add('fa-beat');
        window.setTimeout(() => icon.classList.remove('fa-beat'), 600);
    };

    const getCopyTextFromClick = (target: HTMLElement): string => {
        const chatMessage = target.closest('.chat-message') as HTMLElement | null;
        if (!chatMessage) return '';

        if (chatMessage.classList.contains('user-message')) {
            const userBubble = chatMessage.querySelector('.user-bubble') as HTMLElement | null;
            return (userBubble?.innerText ?? chatMessage.innerText ?? '').trim();
        }

        const botText = chatMessage.querySelector('.bot-message-text') as HTMLElement | null;
        if (botText) return (botText.innerText ?? '').trim();

        const botBubble = chatMessage.querySelector('.bot-bubble') as HTMLElement | null;
        return (botBubble?.innerText ?? chatMessage.innerText ?? '').trim();
    };

    const writeToClipboard = async (text: string) => {
        if (!text) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return;
            }
        } catch {
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    };

    const handleCopyClick = async (e: React.MouseEvent<HTMLElement>) => {
        const target = e.currentTarget as HTMLElement;
        triggerIconFade(target);
        const text = getCopyTextFromClick(target);
        await writeToClipboard(text);
    };

    return (
        <div className={`chat-exchange ${isNewMessage ? 'new-message' : ''}`} ref={chatExchangeRef}>
            <div className="chat-message user-message" ref={userMessageDiv}>
                <div className="message-content">
                    <div className="message-bubble patrick-hand-regular user-bubble" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(userMessage) }}>
                    </div>
                    <div className="message-time montserrat-msg">
                        <span className='copy-msg' onClick={handleCopyClick}><i className="fa-regular fa-copy"></i>&nbsp;&nbsp;</span>
                        {userTime}
                    </div>
                </div>
            </div>

            <div className="chat-message bot-message" ref={botMessageRef}>
                <div className="message-bubble poppins-regular bot-bubble">
                    {placeholderVisible ? (
                        <em className='bot-wait-placeholder'>
                            <span className='bot-streaming-spinner'>
                                <LordIcon
                                    key={lordIconTrigger}
                                    src={lordIconSrc}
                                    trigger={lordIconTrigger}
                                    state={lordIconState}
                                    style={{ width: '25px', height: '25px' }}
                                />
                            </span>
                            <span className='bot-wait-placeholder-text'>contemplating...</span>
                        </em>
                    ) : (
                        <>
                            <div className="parent-bot-bubble">
                                <span className='bot-streaming-spinner'>
                                    <LordIcon
                                        key={lordIconTrigger}
                                        src={lordIconSrc}
                                        trigger={lordIconTrigger}
                                        state={lordIconState}
                                        style={{ width: '25px', height: '25px' }}
                                    />
                                </span>
                                <div className="message-content">
                                    {!isStreaming && (botMessage || (botImages && botImages.length > 0)) && (
                                        <div className="message-time montserrat-msg">
                                            from {
                                                llmprovider?.toLocaleLowerCase().includes("openai") ? <><i className="fa-brands fa-openai"></i></> :
                                                    llmprovider?.toLocaleLowerCase().includes("google") ? <><i className="fa-brands fa-google"></i></> :
                                                    llmprovider?.toLocaleLowerCase().includes("mistral") ? <i className="fa-solid fa-cat"></i> : <i className="fa-solid fa-circle-question"></i>}
                                            <span className='llm-model-name'>{` ${llmModel || 'unknown'}`} at {botTime}</span>
                                            <span className='copy-msg' onClick={handleCopyClick}>&nbsp;&nbsp;<i className="fa-regular fa-copy"></i></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {botMessage ? (
                                <div className='bot-message-text' dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(botMessage) }} />
                            ) : null}
                            {botImages && botImages.length > 0 ? (
                                <div className="bot-image-grid" aria-label="Generated images">
                                    {botImages.map((img, idx) => (
                                        <a
                                            key={`${img.url}-${idx}`}
                                            className="bot-image-link"
                                            href={img.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={img.alt || `Open image ${idx + 1}`}
                                        >
                                            <img className="bot-image" src={img.url} alt={img.alt || `Generated image ${idx + 1}`} loading="lazy" />
                                        </a>
                                    ))}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

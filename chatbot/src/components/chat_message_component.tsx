import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';

marked.setOptions({
    breaks: true,
    gfm: true,
});

interface ChatMessageProps {
    userMessage: string;
    userTime: string;
    botMessage: string;
    botTime: string;
    llmprovider?: string;
    llmModel?: string;
    personality?: string;
    isStreaming?: boolean;
}

const convertMarkdownToHTML = (text: string): string => {
    if (!text || text.trim() === '') {
        return '';
    }

    try {
        const htmlOutput = marked(text) as string;
        // console.log('Markdown conversion:', { input: text.substring(0, 100) + '...', output: htmlOutput.substring(0, 200) + '...' });
        return htmlOutput;
    } catch (error) {
        console.error('Markdown conversion failed:', error);
        return `<p>${text}</p>`;
    }
};

const ChatMessage: React.FC<ChatMessageProps> = ({ userMessage, userTime, botMessage, botTime, llmprovider, llmModel, isStreaming = false }) => {
    const [isNewMessage, setIsNewMessage] = useState(true);
    const [firstMessage, setFirstMessage] = useState(true);
    const userMessageDiv = useRef<HTMLDivElement>(null);
    const chatExchangeRef = useRef<HTMLDivElement>(null);
    const [displayedBotMessage, setDisplayedBotMessage] = useState('');
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
        if (!isStreaming) {
            setDisplayedBotMessage(botMessage || '');
            return;
        }

        if (!botMessage) {
            setDisplayedBotMessage('');
            return;
        }

        if (displayedBotMessage === botMessage) {
            return;
        }

        const remaining = botMessage.length - displayedBotMessage.length;
        if (remaining <= 0) {
            setDisplayedBotMessage(botMessage);
            return;
        }

        const chunkSize = Math.min(Math.max(1, Math.ceil(remaining / 3)), 6);
        const timer = setTimeout(() => {
            setDisplayedBotMessage(prev => {
                const nextSegment = botMessage.slice(prev.length, prev.length + chunkSize);
                return prev + nextSegment;
            });
        }, 30);

        return () => clearTimeout(timer);
    }, [botMessage, displayedBotMessage, isStreaming]);

    useEffect(() => {
        if (!userMessage && !botMessage) return;
        chatExchangeRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, [userMessage, botMessage]);

    const placeholderVisible = !displayedBotMessage && !botMessage;
    const placeholderText = !isStreaming && placeholderVisible ? 'contemplating...' : '';
    const placeholderIconClass = `fa-solid fa-burst${isStreaming ? ' fa-spin-pulse' : ''}`;

    const triggerIconFade = (container: HTMLElement) => {
        const icon = container.querySelector('i');
        if (!icon) return;

        icon.classList.remove('fa-beat');
        // Force a reflow so repeated rapid clicks retrigger the animation.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

            <div className="chat-message bot-message">
                <div className="message-bubble poppins-regular bot-bubble">
                    {placeholderVisible ? (
                        <em className='bot-wait-placeholder'>
                            {placeholderText}
                            <i className={placeholderIconClass}></i>&nbsp;<span className='bot-wait-placeholder-text'>contemplating...</span>
                        </em>
                    ) : (
                        <>
                            {displayedBotMessage && (
                                <>
                                    <div className="parent-bot-bubble">
                                        <span className='bot-streaming-spinner'><i className={placeholderIconClass}></i></span>
                                        <div className="message-content">
                                            {botMessage && !isStreaming && (
                                                <div className="message-time montserrat-msg">
                                                    from {
                                                        llmprovider?.toLocaleLowerCase().includes("openai") ? <><i className="fa-brands fa-openai"></i></> :
                                                            llmprovider?.toLocaleLowerCase().includes("google") ? <><i className="fa-brands fa-google"></i></> : <i className="fa-solid fa-circle-question"></i>}
                                                    <span className='llm-model-name'>{` ${llmModel || 'unknown'}`} at {botTime}</span>
                                                    <span className='copy-msg' onClick={handleCopyClick}>&nbsp;&nbsp;<i className="fa-regular fa-copy"></i></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className='bot-message-text' dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(displayedBotMessage) }} />
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

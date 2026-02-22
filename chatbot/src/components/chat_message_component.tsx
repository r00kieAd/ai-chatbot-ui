import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import TypingEffect from './typing_effect_component';
import { useGlobal } from '../utils/global_context';

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
    isSecondOrLater?: boolean;
    personality?: string;
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

const ChatMessage: React.FC<ChatMessageProps> = ({ userMessage, userTime, botMessage, botTime, llmprovider, llmModel, isSecondOrLater }) => {
    const [isNewMessage, setIsNewMessage] = useState(true);
    const [showTyping, setShowTyping] = useState(false);
    const [firstMessage, setFirstMessage] = useState(true);
    const userMessageDiv = useRef<HTMLDivElement>(null);
    const chatExchangeRef = useRef<HTMLDivElement>(null);
    const botMessageRef = useRef<HTMLDivElement>(null);
    const [localTypingComplete, setLocalTypingComplete] = useState<boolean>(false);
    const { setTypingComplete } = useGlobal();
    // const [fixedPersonality] = useState(messagePersonality ?? globalPersonality ?? null);
    // const currentPersonality = fixedPersonality;

    // console.log(llmprovider, llmModel);
    useEffect(() => {
        setTypingComplete(localTypingComplete);
    }, [localTypingComplete]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsNewMessage(false);
        }, 1000);

        if (botMessage) {
            setShowTyping(true);
            setLocalTypingComplete(false);
        }

        return () => clearTimeout(timer);
    }, [botMessage]);

    useEffect(() => {
        if (isSecondOrLater && isNewMessage) {
            setTimeout(() => {
                botMessageRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }, 200);
        }
    }, [isSecondOrLater, isNewMessage]);

    useEffect(() => {
        if (isSecondOrLater && !botMessage && isNewMessage) {
            setTimeout(() => {
                botMessageRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }, 300);
        }
    }, [isSecondOrLater, botMessage, isNewMessage]);

    useEffect(() => {
        if (firstMessage && userMessageDiv.current) {
            userMessageDiv.current.style.marginTop = "30px";
            setFirstMessage(false);
        } else if (userMessageDiv.current) {
            // userMessageDiv.current.style.marginTop = "20px";
        }
    }, [firstMessage])

    const handleTypingComplete = () => {
        setLocalTypingComplete(true);
    };

    return (
        <div className={`chat-exchange ${isNewMessage ? 'new-message' : ''}`} ref={chatExchangeRef}>
            <div className="chat-message user-message" ref={userMessageDiv}>
                <div className="message-content">
                    <div className="message-bubble patrick-hand-regular user-bubble" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(userMessage) }}>
                    </div>
                    <div className="message-time montserrat-msg">{userTime}</div>
                </div>
            </div>

            <div className="chat-message bot-message" ref={botMessageRef}>
                <div className="message-content">
                    {botMessage ? (
                        <>
                            <div className="message-bubble poppins-regular bot-bubble">
                                {showTyping && !localTypingComplete ? (
                                    <TypingEffect
                                        text={botMessage}
                                        onComplete={handleTypingComplete}
                                    />
                                ) : localTypingComplete ? (
                                    <span dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(botMessage) }} />
                                ) : (
                                    <span>Loading...</span>
                                )}
                            </div>
                            <div className="message-time montserrat-msg">
                                from {
                                llmprovider?.toLocaleLowerCase().includes("openai") ? <><i className="fa-brands fa-openai"></i></>:
                                llmprovider?.toLocaleLowerCase().includes("google") ? <><i className="fa-brands fa-google"></i></> : <i className="fa-solid fa-circle-question"></i>}
                                <span className='llm-model-name'>{` ${llmModel || 'unknown'}`} at {botTime}</span></div>
                        </>
                    ) : (
                        <div className="message-bubble">
                            <em className='bot-wait-placeholder'>contemplating...<i className="fa-solid fa-burst fa-spin-pulse"></i></em>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

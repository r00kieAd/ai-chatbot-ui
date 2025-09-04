import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import { marked } from 'marked';
import TypingEffect from './typing_effect_component';
import bot from '../assets/bot.png';
import face from '../assets/face.png';
import aicloud from '../assets/think.png';

marked.setOptions({
    breaks: true,
    gfm: true,
});

interface ChatMessageProps {
    userMessage: string;
    userTime: string;
    botMessage: string;
    botTime: string;
}

const convertMarkdownToHTML = (text: string): string => {
    if (!text || text.trim() === '') {
        return '';
    }
    
    try {
        const htmlOutput = marked(text) as string;
        console.log('Markdown conversion:', { input: text.substring(0, 100) + '...', output: htmlOutput.substring(0, 200) + '...' });
        return htmlOutput;
    } catch (error) {
        console.error('Markdown conversion failed:', error);
        return `<p>${text}</p>`; 
    }
};

const ChatMessage: React.FC<ChatMessageProps> = ({ userMessage, userTime, botMessage, botTime }) => {
    const { currllmModel } = useGlobal();
    const [isNewMessage, setIsNewMessage] = useState(true);
    const [showTyping, setShowTyping] = useState(false);
    const [typingComplete, setTypingComplete] = useState(false);
    const [firstMessage, setFirstMessage] = useState(true);
    const userMessageDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsNewMessage(false);
        }, 1000);

        if (botMessage) {
            setShowTyping(true);
            setTypingComplete(false);
        }

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

    const handleTypingComplete = () => {
        setTypingComplete(true);
    };

    return (
        <div className={`chat-exchange ${isNewMessage ? 'new-message' : ''}`}>
            <div className="chat-message user-message" ref={userMessageDiv}>
                <div className="message-avatar">
                    <img src={face} alt="Face" />
                </div>
                <div className="message-content">
                    <div className="message-bubble patrick-hand-regular user-bubble" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(userMessage) }}>
                    </div>
                    <div className="message-time montserrat-msg">{userTime}</div>
                </div>
            </div>
            
            <div className="chat-message bot-message">
                <div className={`message-avatar ${!botMessage ? 'loading' : ''}`}>
                    <img src={botMessage ? bot : aicloud} alt={botMessage ? "Bot" : "Loading"} />
                </div>
                <div className="message-content">
                    {botMessage ? (
                        <>
                            <div className="message-bubble poppins-regular bot-bubble">
                                {showTyping && !typingComplete ? (
                                    <TypingEffect 
                                        text={botMessage}
                                        onComplete={handleTypingComplete}
                                    />
                                ) : typingComplete ? (
                                    <span dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(botMessage) }} />
                                ) : (
                                    <span>Loading...</span>
                                )}
                            </div>
                            <div className="message-time montserrat-msg">from {currllmModel} at {botTime}</div>
                        </>
                    ) : (
                        <div className="message-bubble">
                            <em>thinking...</em>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

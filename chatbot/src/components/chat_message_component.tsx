import React, { useEffect, useState } from 'react';
import bot from '../assets/bot.png';
import face from '../assets/face.png';
import aicloud from '../assets/ai-cloud.png';

interface ChatMessageProps {
    userMessage: string;
    userTime: string;
    botMessage: string;
    botTime: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ userMessage, userTime, botMessage, botTime }) => {
    const [isNewMessage, setIsNewMessage] = useState(true);

    useEffect(() => {
        // Remove the new message class after animation completes
        const timer = setTimeout(() => {
            setIsNewMessage(false);
        }, 1000); // Match animation duration

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`chat-exchange ${isNewMessage ? 'new-message' : ''}`}>
            {/* User Message */}
            <div className="chat-message user-message">
                <div className="message-avatar">
                    <img src={face} alt="Face" />
                </div>
                <div className="message-content">
                    <div className="message-bubble">
                        {userMessage}
                    </div>
                    <div className="message-time">{userTime}</div>
                </div>
            </div>
            
            {/* Bot Message or Loading */}
            <div className="chat-message bot-message">
                <div className={`message-avatar ${!botMessage ? 'loading' : ''}`}>
                    <img src={botMessage ? bot : aicloud} alt={botMessage ? "Bot" : "Loading"} />
                </div>
                <div className="message-content">
                    {botMessage ? (
                        <>
                            <div className="message-bubble">
                                {botMessage}
                            </div>
                            <div className="message-time">{botTime}</div>
                        </>
                    ) : (
                        <div className="message-bubble">
                            <em>Thinking...</em>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

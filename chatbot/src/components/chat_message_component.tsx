import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import bot from '../assets/bot.png';
import face from '../assets/face.png';
import aicloud from '../assets/ai-cloud.png';

// Configure marked options
marked.setOptions({
    breaks: true, // Convert '\n' to <br>
    gfm: true, // Enable GitHub flavored markdown
});

interface ChatMessageProps {
    userMessage: string;
    userTime: string;
    botMessage: string;
    botTime: string;
}

// Helper function to convert markdown to HTML
const convertMarkdownToHTML = (text: string): string => {
    // Return empty string if text is empty or null
    if (!text || text.trim() === '') {
        return '';
    }
    
    try {
        // Use marked library to convert markdown to HTML
        const htmlOutput = marked(text) as string;
        console.log('Markdown conversion:', { input: text.substring(0, 100) + '...', output: htmlOutput.substring(0, 200) + '...' });
        return htmlOutput;
    } catch (error) {
        console.error('Markdown conversion failed:', error);
        return `<p>${text}</p>`; // Fallback to wrapped plain text
    }
};

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
                    <div className="message-bubble" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(userMessage) }}>
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
                            <div className="message-bubble" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(botMessage) }}>
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

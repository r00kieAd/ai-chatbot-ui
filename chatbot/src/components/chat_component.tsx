import React, { useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import ChatMessage from './chat_message_component';

const ChatBox: React.FC = () => {
    const { chatHistory } = useGlobal();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Disable auto-scrolling to keep bot messages focused
    // useEffect(() => {
    //     // Scroll to bottom when new messages are added
    //     if (chatContainerRef.current) {
    //         const container = chatContainerRef.current.parentElement; // Get the actual scrolling container
    //         if (container) {
    //             container.scrollTop = container.scrollHeight;
    //         }
    //     }
    // }, [chatHistory]);

    return (
        <div className="chat-box" ref={chatContainerRef}>
            {Object.entries(chatHistory).map(([key, chat]) => (
                <ChatMessage 
                    key={key} 
                    userMessage={chat.userMessage}
                    userTime={chat.userTime}
                    botMessage={chat.botMessage}
                    botTime={chat.botTime}
                />
            ))}
        </div>
    );
};

export default ChatBox;

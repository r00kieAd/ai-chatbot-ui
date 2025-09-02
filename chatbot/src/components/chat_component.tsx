import React, { useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import ChatMessage from './chat_message_component';

const ChatBox: React.FC = () => {
    const { chatHistory } = useGlobal();
    const chatContainerRef = useRef<HTMLDivElement>(null);

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

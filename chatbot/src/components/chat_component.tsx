import React, { useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import ChatMessage from './chat_message_component';

const ChatBox: React.FC = () => {
    const { chatHistory } = useGlobal();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const chatEntries = Object.entries(chatHistory);

    return (
        <div className="chat-box" ref={chatContainerRef}>
            {chatEntries.map(([key, chat], index) => (
                <ChatMessage 
                    key={key} 
                    userMessage={chat.userMessage}
                    userTime={chat.userTime}
                    botMessage={chat.botMessage}
                    botTime={chat.botTime}
                    llmModel={chat.llmModel}
                    isSecondOrLater={index >= 1}
                />
            ))}
        </div>
    );
};

export default ChatBox;

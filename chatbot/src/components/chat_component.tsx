import React from 'react';
import { useGlobal } from '../utils/global_context';
import ChatMessage from './chat_message_component';

const ChatBox: React.FC = () => {
    const { chatHistory } = useGlobal();
    const chatEntries = Object.entries(chatHistory);

    return (
        <div className="chat-box">
            {chatEntries.map(([key, chat]) => (
                <ChatMessage 
                    key={key} 
                    userMessage={chat.userMessage}
                    userTime={chat.userTime}
                    botMessage={chat.botMessage}
                    botTime={chat.botTime}
                    llmprovider={chat.llmprovider}
                    llmModel={chat.llmModel}
                    isStreaming={chat.isStreaming}
                    personality={chat.personality}
                />
            ))}
        </div>
    );
};

export default ChatBox;

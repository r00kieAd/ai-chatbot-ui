import React from 'react';
import { useGlobal } from '../utils/global_context';
import ChatMessage from './chat_message_component';
import robot from '../assets/robot.svg';

const ChatBox: React.FC = () => {
    const { chatHistory, chatEmpty } = useGlobal();
    const chatEntries = Object.entries(chatHistory);

    return (
        <div className="chat-box">
            <div id="chatSVG_bg" className={chatEmpty ? "show" : ""}>
                <img src={robot} alt="" />
            </div>
            {chatEntries.map(([key, chat]) => (
                <ChatMessage 
                    key={key} 
                    userMessage={chat.userMessage}
                    userTime={chat.userTime}
                    botMessage={chat.botMessage}
                    botImages={chat.botImages}
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

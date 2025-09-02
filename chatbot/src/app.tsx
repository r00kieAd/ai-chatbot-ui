import { useState, useRef, useEffect } from 'react';
import { useGlobal } from './utils/global_context';
import LoginComp from './components/login_components';
import ChatBox from './components/chat_component';
import InputBox from './components/input_component';
import './app.css'

function App() {

  const { authorized, setAuthorized, chatInitiated, setChatInitiated } = useGlobal();
  const loginContainer = useRef<HTMLDivElement>(null);
  const mainContainer = useRef<HTMLDivElement>(null);
  const innerContainer = useRef<HTMLDivElement>(null);
  const inputBoxDiv = useRef<HTMLDivElement>(null);
  const chatBoxDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuthorized(sessionStorage.getItem(import.meta.env.VITE_SESSION_AUTH_VAR) === "true")
    if (authorized) {
      setTimeout(() => {
        if (innerContainer.current) innerContainer.current.style.display = "block";
        if (loginContainer.current) loginContainer.current.style.display = "none";
      }, 200);
      setTimeout(() => {
        if (mainContainer.current) mainContainer.current.classList.add("show");
      }, 300);
    }
  }, [authorized]);

  useEffect(() => {
    if (chatInitiated) {
      if (mainContainer.current && inputBoxDiv.current && chatBoxDiv.current && innerContainer.current) {
        if (window.screen.availWidth <= 500) {
          mainContainer.current.style.width = "90%";
        } else {
          mainContainer.current.style.width = "80%";
        }
        inputBoxDiv.current.classList.add('slideDownInputBox');
        inputBoxDiv.current.classList.add('chat-initiated'); // Add class for input positioning
        innerContainer.current.classList.add('chat-mode'); // Switch to flex layout
        chatBoxDiv.current.classList.add('chat-visible'); // Make chat visible
        setChatInitiated(false);
      }
    }
  }, [chatInitiated]);

  return (
    <>
      <div id="parent">
        <div id='loginContainer' ref={loginContainer}>
          <LoginComp />
        </div>
        <div id="mainContainer" ref={mainContainer}>
          <div id="innerContainer" ref={innerContainer}>
            <div id="chatContainer" ref={chatBoxDiv}>
              <ChatBox />
            </div>
            <div id="inputContainer" ref={inputBoxDiv}>
              <InputBox />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App

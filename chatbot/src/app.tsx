import { useState, useRef, useEffect } from 'react';
import { useGlobal } from './utils/global_context';
import LoginComp from './components/login_components';
import ChatBox from './components/chat_component';
import InputBox from './components/input_component';
import NavbarComp from './components/navbar';
import './app.css'

function App() {

  const { authorized, loggedOut, setAuthorized, chatInitiated, setChatInitiated, currUser } = useGlobal();
  const loginContainer = useRef<HTMLDivElement>(null);
  const mainContainer = useRef<HTMLDivElement>(null);
  const innerContainer = useRef<HTMLDivElement>(null);
  const inputBoxDiv = useRef<HTMLDivElement>(null);
  const chatBoxDiv = useRef<HTMLDivElement>(null);
  const navbarDiv1 = useRef<HTMLDivElement>(null);
  const navbarDiv2 = useRef<HTMLDivElement>(null);
  const wlcmDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuthorized(sessionStorage.getItem(import.meta.env.VITE_SESSION_AUTH_VAR) === "true")
    if (authorized) {
      setTimeout(() => {
        if (innerContainer.current) innerContainer.current.style.display = "block";
        if (loginContainer.current) loginContainer.current.style.display = "none";
        if (navbarDiv2.current) navbarDiv2.current.style.display = "block"
      }, 200);
      setTimeout(() => {
        if (mainContainer.current) mainContainer.current.classList.add("show");
        if (navbarDiv1.current) navbarDiv1.current.classList.add("show");
      }, 300);
    };
  }, [authorized]);

  useEffect(() => {
    if (loggedOut) {
      if (inputBoxDiv.current && chatBoxDiv.current && innerContainer.current && mainContainer.current) {
        inputBoxDiv.current.classList.remove('slideDownInputBox');
        inputBoxDiv.current.classList.remove('chat-initiated');
        innerContainer.current.classList.remove('chat-mode');
        chatBoxDiv.current.classList.remove('chat-visible');
        mainContainer.current.style.width = "40rem";
      }
      setTimeout(() => {
        if (innerContainer.current) innerContainer.current.style.display = "none";
        if (loginContainer.current) loginContainer.current.style.display = "block";
        if (navbarDiv2.current) navbarDiv2.current.style.display = "none"
      }, 200);

      setTimeout(() => {
        if (mainContainer.current) mainContainer.current.classList.remove("show");
        if (navbarDiv1.current) navbarDiv1.current.classList.remove("show");
      }, 300);
    }
  }, [loggedOut])

  useEffect(() => {
    if (chatInitiated) {
      if (mainContainer.current && inputBoxDiv.current && chatBoxDiv.current && innerContainer.current && wlcmDiv.current) {
        if (window.screen.availWidth <= 500) {
          mainContainer.current.style.width = "90%";
        } else {
          mainContainer.current.style.width = "80%";
        }
        inputBoxDiv.current.classList.add('slideDownInputBox');
        inputBoxDiv.current.classList.add('chat-initiated');
        innerContainer.current.classList.add('chat-mode');
        chatBoxDiv.current.classList.add('chat-visible');
        wlcmDiv.current.style.display = "none";
        setChatInitiated(false);
      }
    }
  }, [chatInitiated]);

  return (
    <>
      <div id="parent">
        <div id='navbarContainer' ref={navbarDiv1}>
          <div id="navbarController" ref={navbarDiv2}>
            <NavbarComp />
          </div>
        </div>
        <div id='loginContainer' ref={loginContainer}>
          <LoginComp />
        </div>
        <div id="mainContainer" ref={mainContainer}>
          <div id="innerContainer" ref={innerContainer}>
            <div id="chatContainer" ref={chatBoxDiv}>
              <ChatBox />
            </div>
            <div id='welcomeMessage' className='poppins-regular' ref={wlcmDiv}>
              <span>Hello {currUser}! What brings you here today?</span>
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

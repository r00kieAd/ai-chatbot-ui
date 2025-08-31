import { useState, useRef, useEffect } from 'react';
import { useGlobal } from './utils/global_context';
import LoginComp from './components/login_components';
import ChatBox from './components/chat_component';
import InputBox from './components/input_component';
import './app.css'

function App() {

  const { authorized } = useGlobal();
  const loginContainer = useRef<HTMLDivElement>(null);
  const mainContainer = useRef<HTMLDivElement>(null);
  const innerContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authorized) {
      setTimeout(() => {
        if (innerContainer.current) innerContainer.current.style.display = "block";
        if (loginContainer.current) loginContainer.current.style.display = "none";
      }, 200);
      setTimeout(() => {
        if (mainContainer.current) mainContainer.current.classList.add("show");
      }, 300);
    }
  }, [authorized])

  return (
    <>
      <div id="parent">
        <div id='loginContainer' ref={loginContainer}>
          <LoginComp />
        </div>
        <div id="mainContainer" ref={mainContainer}>
          <div id="innerContainer" ref={innerContainer}>
            <div id="chatContainer">
              <ChatBox />
            </div>
            <div id="inputContainer">
              <InputBox />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
